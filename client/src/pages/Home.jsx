import { useEffect, useState } from "react";

function Home() {
  const [index, setIndex] = useState("0");
  const [indexes, setIndexes] = useState([]);
  const [values, setValues] = useState([]);

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      const resIndexes = await fetch("/api/indexes");
      const dataIndexes = await resIndexes.json();
      const resValues = await fetch("/api/values");
      const dataValues = await resValues.json();
      if (!ignore) {
        setIndexes(dataIndexes);
        setValues(dataValues);
      }
    }
    fetchData();
    return () => {
      ignore = true;
    };
  }, []);

  function handleChange(event) {
    setIndex(event.target.value);
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (index !== "") {
      try {
        const res = await fetch("/api/index", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ index: parseInt(index) }),
        });

        await res.json();

        if (res.ok) {
          setIndex("0");
          // Refresh the indexes and values after submission
          const resIndexes = await fetch("/api/indexes");
          const dataIndexes = await resIndexes.json();
          setIndexes(dataIndexes);
          const resValues = await fetch("/api/values");
          const dataValues = await resValues.json();
          setValues(dataValues);
        } else {
          console.error("Failed to submit index");
        }
      } catch (error) {
        console.error("Error submitting index:", error);
      }
    } else {
      console.error("Index cannot be empty");
      setIndex("0");
    }
  };

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
          id="index"
          min={0}
          max={50}
          value={index}
          onChange={handleChange}
        />
        <button type="submit">Submit</button>
      </form>
      <div className="box">
        <h2>Calculated Values</h2>
        <h3>Redis Data</h3>
        <ul>
          {values.map((item) => (
            <li key={item.key}>
              For index {item.key}, calculated value is {item.value}
            </li>
          ))}
        </ul>
      </div>
      <div className="box">
        <h2>Index History</h2>
        <h3>PostgreSQL Data</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Index</th>
              <th>Date Submitted</th>
            </tr>
          </thead>
          <tbody>
            {indexes.length === 0 && (
              <tr className="no-data">
                <td colSpan={3}>no data to display</td>
              </tr>
            )}
            {indexes.map((item) => (
              <tr key={item._id}>
                <td>{item._id}</td>
                <td>{item.index}</td>
                <td>{new Date(item.date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Home;
