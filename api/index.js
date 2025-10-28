// environment variables
const env = require("./env");
const port = env.API_PORT;
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
const pool = new pg.Pool({
  host: postgresHost,
  port: postgresPort,
  user: postgresUser,
  database: postgresDatabase,
  password: postgresPassword,
});

// create tables if not exist
const createTableText = `
CREATE TABLE IF NOT EXISTS indexes (
  _id SERIAL PRIMARY KEY,
  index INT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

pool
  .query(createTableText)
  .query("INSERT INTO indexes (index) VALUES ($1)", [3]) // remove after testing
  .catch((err) => console.error("Error occurred during pool query: ", err));

const dummyRedisData = [
  { key: 0, value: 0 },
  { key: 8, value: 21 },
  { key: 9, value: 34 },
  { key: 10, value: 55 },
];

// route handlers
app.get("/", (req, res) => {
  res.send("Hello ExpressJS!");
});

app.get("/indexes", (req, res) => {
  const queryText = "SELECT * FROM indexes;";
  pool
    .query(queryText)
    .then((result) => {
      res.json(result.rows);
    })
    .catch((err) => {
      console.error("Error querying indexes", err);
      res.status(500).send("Error retrieving indexes");
    });
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
    dummyRedisData.push({ key: req.body.index, value: -1 }); // placeholder value
    res.send("OK");
  }, 3000); // simulate processing delay
});

// start the server
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
