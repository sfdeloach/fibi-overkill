// TODO: move to a worker service
function fibonacci(index) {
  if (index < 2) {
    return index;
  } else {
    return fibonacci(index - 1) + fibonacci(index - 2);
  }
}

// express setup
const express = require("express");
const app = express();

// body parser middleware for json
const bodyParser = require("body-parser");
app.use(bodyParser.json());

////
// postgres database setup
////
const pg = require("pg");
const postgresPool = new pg.Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
postgresPool.on("error", (err, client) => {
  console.error("Unexpected error on idle Postgres client:", err);
  process.exit(-1);
});

// create table if not exist
const initPostgres = async () => {
  const createTableText = `
  CREATE TABLE IF NOT EXISTS indexes (
    _id SERIAL PRIMARY KEY,
    index INT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`;
  const result = await postgresPool.query(createTableText);
};
initPostgres().catch((err) => {
  console.error("Error initializing Postgres:", err);
});

////
// redis setup
////
const { createClient } = require("redis");
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});
redisClient.on("error", (err) => {
  console.error("Error initializing Redis:", err);
});
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error("Error on Redis connection: ", error);
  }
})();

// redis publisher

////
// route handlers
////
app.get("/", (req, res) => {
  res.send(
    "<h1 style=" +
      '"font-family: monospace; width: 100vw; text-align: center; padding-top: 4rem">' +
      "Who's ready to kill some CPU cycles?<h1>"
  );
});

app.get("/indexes", async (req, res) => {
  const result = await postgresPool.query("SELECT * FROM indexes;");
  res.json(result.rows);
});

app.get("/value/:index", async (req, res) => {
  const result = await redisClient.get(req.params.index);
  res.json({ index: req.params.index, result });
});

app.post("/calculate", async (req, res) => {
  // insert into Postgres
  const insertText = "INSERT INTO indexes (index) VALUES ($1) RETURNING _id;";
  const values = [req.body.index];
  const insertResult = await postgresPool.query(insertText, values);

  // attempt to find value in Redis cache
  const indexString = req.body.index.toString();
  const getValue = await redisClient.get(indexString);

  if (getValue === null) {
    // cache miss, calculate the value
    try {
      await redisClient.set(indexString, fibonacci(req.body.index));
    } catch (err) {
      console.error("Error setting Redis key-value: ", err);
    } finally {
      res.json({ isHit: false });
    }
  } else {
    // cache hit
    res.json({ isHit: true });
  }
});

////
// start the server
////
const server = app.listen(process.env.API_PORT, () => {
  console.log(`API listening on port ${process.env.API_PORT}`);
});

////
// graceful shutdown
////
const shutdown = async () => {
  console.log("Shutting down API server...");

  // close Postgres pool
  await postgresPool.end();
  console.log("Postgres pool is closed.");

  // TODO: close Redis client if implemented

  // close the server
  server.close(() => {
    console.log("API server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
