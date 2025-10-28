const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.json());

const env = require("./env");
const port = env.API_PORT;

const dummyPostgresData = [
  { index: 0, date: "2024-01-01T12:00:00Z" },
  { index: 8, date: "2024-01-02T13:00:00Z" },
  { index: 9, date: "2024-01-03T14:00:00Z" },
  { index: 10, date: "2024-01-04T15:00:00Z" },
];

const dummyRedisData = [
  { key: 0, value: 0 },
  { key: 8, value: 21 },
  { key: 9, value: 34 },
  { key: 10, value: 55 },
];

// Routes
app.get("/", (req, res) => {
  res.send("Hello ExpressJS!");
});

app.get("/indexes", (req, res) => {
  res.json(dummyPostgresData);
});

app.get("/values", (req, res) => {
  res.json(dummyRedisData);
});

app.post("/index", (req, res) => {
  setTimeout(() => {
    dummyPostgresData.push({
      index: req.body.index,
      date: new Date().toISOString(),
    });
    dummyRedisData.push({ key: req.body.index, value: -1 }); // Placeholder value
    res.send("OK");
  }, 3000); // Simulate processing delay
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
