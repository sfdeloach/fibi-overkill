///////////////////
// express setup //
///////////////////
const express = require("express");
const app = express();

// body parser middleware for json
const bodyParser = require("body-parser");
app.use(bodyParser.json());

/////////////////////////////
// postgres database setup //
/////////////////////////////
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
    hit BOOLEAN,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`;

  const result = await postgresPool.query(createTableText);
};

initPostgres().catch((err) => {
  console.error("Error initializing Postgres:", err);
});

/////////////////
// redis setup //
/////////////////
const { createClient } = require("redis");

// client to get values from database
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

redisClient.on("error", (err) => console.error("api client:", err));

// publisher to broadcast messages to worker
const redisPublisher = redisClient.duplicate();
redisPublisher.on("error", (err) => console.error("api publisher:", err));

// subscriber to key-event notifications
const redisSubscriber = redisClient.duplicate();
redisSubscriber.on("error", (err) => console.error("api subscriber:", err));

const listener = async (message, channel) => {
  console.log(`received message "${message}" on channel ${channel}`);
  // TODO: Is this the place to setup a web socket? Send update to the web client.
};

// connect all three Redis clients
const redisConnect = async () => {
  try {
    await redisClient.connect();
    await redisPublisher.connect();
    await redisSubscriber.connect();
    await redisSubscriber.subscribe("__keyevent@0__:set", listener);
  } catch (error) {
    console.error("Error on Redis connection: ", error);
  }
};

redisConnect();

////////////////////
// route handlers //
////////////////////
app.get("/", (req, res) => {
  res.send(
    "<h1 style=" +
      '"font-family: monospace; width: 100vw; text-align: center; padding-top: 4rem">' +
      "Who's ready to kill some CPU cycles?<h1>"
  );
});

app.get("/indexes", async (req, res) => {
  const result = await postgresPool.query(
    "SELECT * FROM indexes ORDER BY _id DESC;"
  );
  res.json(result.rows);
});

app.get("/value/:index", async (req, res) => {
  const result = await redisClient.get(req.params.index);
  res.json({ index: req.params.index, result });
});

app.post("/calculate", async (req, res) => {
  // attempt to find value in Redis cache
  const getValue = await redisClient.get(req.body.index.toString());
  const isHit = getValue !== null;

  // insert into Postgres
  const insertText =
    "INSERT INTO indexes (index, hit) VALUES ($1, $2) RETURNING _id;";
  const values = [req.body.index, isHit];
  await postgresPool.query(insertText, values);

  if (!isHit) {
    // cache miss, broadcast (publish) message to worker
    await redisPublisher.publish(
      "status:assignment",
      req.body.index.toString()
    );
  }

  res.json({ index: req.body.index, result: getValue });
});

//////////////////////
// start the server //
//////////////////////
const server = app.listen(process.env.API_PORT, () => {
  console.log(`API listening on port ${process.env.API_PORT}`);
});

///////////////////////
// graceful shutdown //
///////////////////////
const shutdown = async () => {
  console.log("Shutting down API server...");

  // close Postgres pool
  await postgresPool.end();
  console.log("Postgres pool is closed.");

  // close Redis clients
  await redisClient.quit();
  await redisPublisher.quit();

  // close the server
  app.close(() => {
    console.log("API server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
