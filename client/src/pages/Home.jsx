import { useState } from "react";

function Home() {
  const [index, setIndex] = useState("0");

  const dummyPostgresData = [
    { index: 7, date: "2024-01-01T12:00:00Z" },
    { index: 8, date: "2024-01-02T12:00:00Z" },
    { index: 9, date: "2024-01-03T12:00:00Z" },
    { index: 10, date: "2024-01-04T12:00:00Z" },
  ];

  const dummyRedisData = [
    { key: 7, value: 13 },
    { key: 8, value: 21 },
    { key: 9, value: 34 },
    { key: 10, value: 55 },
  ];

  function handleChange(event) {
    setIndex(event.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();
    console.log("Submitted index:", index);
    // TODO: Handle form submission logic here
  }

  return (
    <div className="content">
      <h1>Home</h1>
      <p>
        An unnecessarily complex and over the top solution to find Fibonacci
        numbers!
      </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="index">Enter an index:</label>
        <input
          type="number"
          name="index"
          min={0}
          max={50}
          value={index}
          onChange={handleChange}
        />
        <button type="submit">Submit</button>
      </form>
      <div className="box">
        <h2>Index History</h2>
        <h3>PostgreSQL Data</h3>
        <ul>
          {dummyPostgresData.map((item) => (
            <li key={item.index}>
              Index {item.index} submitted on{" "}
              {new Date(item.date).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
      <div className="box">
        <h2>Calculated Values</h2>
        <h3>Redis Data</h3>
        <ul>
          {dummyRedisData.map((item) => (
            <li key={item.key}>
              For index {item.key}, calculated value is {item.value}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Home;
