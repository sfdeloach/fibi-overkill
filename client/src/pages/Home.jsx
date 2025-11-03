import { useEffect, useState } from "react";
import CacheHitIcon from "../icons/CacheHitIcon";
import CacheMissIcon from "../icons/CacheMissIcon";

function Home() {
  const [index, setIndex] = useState("0"); // <String>
  const [value, setValue] = useState({}); // { index: <Number>, result: <Number> || null }
  const [indexes, setIndexes] = useState([]);

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      const resIndexes = await fetch("/api/indexes");
      const dataIndexes = await resIndexes.json();
      if (!ignore) {
        setIndexes(dataIndexes);
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
        const res = await fetch("/api/calculate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ index: parseInt(index) }),
        });

        // { index: <Number>, result: <Number> || null }
        const postResponse = await res.json();

        if (res.ok) {
          setIndex("0");

          // Refresh the "index history" box
          const resIndexes = await fetch("/api/indexes");
          const dataIndexes = await resIndexes.json();
          setIndexes(dataIndexes);

          // Refresh the "calculated value" box
          setValue(postResponse);
        } else {
          console.error("Failed to submit index");
        }
      } catch (error) {
        console.error("POST request (fetch):", error);
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
        <h2>Calculated Value</h2>
        <h3>Redis Data</h3>
        <div className="redis-display">
          {Object.keys(value).length !== 0 ? (
            <>
              <p className="results">
                &#119891; ({value.index}) ={" "}
                {Number.parseInt(value.result).toLocaleString("en-US") || "?"}
              </p>
              <p className="icon">
                {value.result ? <CacheHitIcon /> : <CacheMissIcon />}
              </p>
            </>
          ) : (
            <p className="no-data">submit an index to get started</p>
          )}
        </div>
      </div>
      <div className="box">
        <h2>Index History</h2>
        <h3>PostgreSQL Data</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Index</th>
              <th>Hit?</th>
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
                <td>
                  {item.hit ? (
                    <CacheHitIcon size="24px" />
                  ) : (
                    <CacheMissIcon size="24px" />
                  )}
                </td>
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
