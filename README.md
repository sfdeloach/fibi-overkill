# Fibi Overkill

An "over the top" web application with more services than necessary to calculate Fibonacci numbers. The purpose is to demonstrate how to build a more complex multi-container application.

## Message Routing

![message routing schematic](./images/schematic.png)

### Custom Redis Image

Configure Redis to publish [keyspace notifications](https://redis.io/docs/latest/develop/pubsub/keyspace-notifications/)

## TODO

- Create custom Redis image, configure to notify on "set" events
- Implement API to monitor for "set" events
- Web sockets?
- New column in Postgres to track hits and misses
