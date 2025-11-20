const { createClient } = require("redis");

// client used to set key values in the redis database
const client = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

client.on("error", (err) => console.error("worker client:", err));

// subscriber used to listen for messages from API server
const subscriber = client.duplicate();
subscriber.on("error", (err) => console.error("worker subscriber:", err));

const connect = async () => {
  try {
    await client.connect();
    await subscriber.connect();
    await subscriber.subscribe("status:assignment", listener);
  } catch (err) {
    console.error("connect: ", err);
  }
};

connect();

// all of this overhead, just to get to this function!
const fibonacci = (index) => {
  if (index < 2) {
    return index;
  } else {
    return fibonacci(index - 1) + fibonacci(index - 2);
  }
};

//
const listener = async (message, channel) => {
  console.log(`received message "${message}" on channel ${channel}`);
  const result = fibonacci(Number.parseInt(message));
  console.log(`setting pair, key: ${message}, value:${result}`);
  await client.set(message, result);
};

// graceful shutdown
const shutdown = async () => {
  console.log("Shutting down Worker Service...");
  await client.quit();
  await subscriber.quit();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// export for testing
module.exports = {
  fibonacci,
  shutdown,
};
