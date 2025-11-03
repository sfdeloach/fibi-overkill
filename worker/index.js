const { createClient } = require("redis");

const client = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

client.on("error", (err) => console.error("worker client:", err));

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

const fibonacci = (index) => {
  if (index < 2) {
    return index;
  } else {
    return fibonacci(index - 1) + fibonacci(index - 2);
  }
};

const listener = async (message, channel) => {
  console.log("received message:", message, "on channel:", channel);
  const result = fibonacci(Number.parseInt(message));
  await client.set(message, result);
};

connect();

// graceful shutdown
const shutdown = async () => {
  console.log("Shutting down Worker Service...");
  await client.quit();
  await subscriber.quit();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
