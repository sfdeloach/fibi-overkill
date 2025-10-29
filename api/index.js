// environment variables
const env = require("./env");
const apiPort = env.API_PORT;
const postgresHost = env.POSTGRES_HOST;
const postgresPort = env.POSTGRES_PORT;
const postgresUser = env.POSTGRES_USER;
const postgresDatabase = env.POSTGRES_DATABASE;
const postgresPassword = env.POSTGRES_PASSWORD;

// express setup
const express = require("express");
const app = express();

// body parser middleware for json
const bodyParser = require("body-parser");
app.use(bodyParser.json());

// postgres client setup
const pg = require("pg");
const postgresPool = new pg.Pool({
  host: postgresHost,
  port: postgresPort,
  user: postgresUser,
  database: postgresDatabase,
  password: postgresPassword,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
postgresPool.on("error", (err, client) => {
  console.error("Unexpected error on idle Postgres client:", err);
  process.exit(-1);
});

// redis client setup
const { connectRedis } = require("./redis");
let redisPool;
(async () => {
  try {
    redisPool = await connectRedis();
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
    process.exit(1);
  }
})();

// create tables if not exist
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

// dummy Redis data
const dummyRedisData = [
  { key: 0, value: 0 },
  { key: 8, value: 21 },
  { key: 9, value: 34 },
  { key: 10, value: 55 },
];

// route handlers
app.get("/", (req, res) => {
  res.send(
    '<h1 style="font-family: monospace; width: 100vw; text-align: center; padding-top: 4rem">Who\'s ready to kill some CPU cycles?<h1>'
  );
});

app.get("/indexes", async (req, res) => {
  const queryText = "SELECT * FROM indexes;";
  const result = await postgresPool.query(queryText);
  console.log("Indexes retrieved:", JSON.stringify(result.rows));
  res.json(result.rows);
});

app.get("/values", (req, res) => {
  res.json(dummyRedisData);
});

app.post("/index", async (req, res) => {
  // insert into Postgres
  const insertText = "INSERT INTO indexes (index) VALUES ($1) RETURNING _id;";
  const values = [req.body.index];
  const insertResult = await postgresPool.query(insertText, values);

  // insert into a Redis sorted set, TODO: CONTINUE IMPLEMENTATION
  try {
    const added = await redisPool.zAdd("zSet", [{ score: 12, value: "128" }]);
  } catch (err) {
    console.error("Error adding index into Redis: ", err);
  }

  res.json(insertResult.rows);
});

// start the server
const server = app.listen(apiPort, () => {
  console.log(`API listening on port ${apiPort}`);
});

// graceful shutdown
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
