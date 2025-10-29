// redis client setup
const env = require("./env");
const redisHost = env.REDIS_HOST;
const redisPort = env.REDIS_PORT;

const { createClientPool } = require("redis");

const pool = createClientPool({
  url: `redis://${redisHost}:${redisPort}`,
});

pool.on("error", (err) =>
  console.error("Unexpected error on idle Redis client:", err)
);

async function connectRedis() {
  if (!pool.isOpen) {
    await pool.connect();
    console.log("Connected to Redis");
  }
  return pool;
}

module.exports = { connectRedis };
