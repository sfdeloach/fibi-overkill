import { MermaidDiagram } from "@lightenna/react-mermaid-diagram";

function About() {
  const diagramText = `
  graph TB
    A((Web Browser)) <--> B(Nginx Reverse\nProxy)
    subgraph Docker Network
    B <--> C[Vite Development\nServer]
    B <--> D[Express API\nServer]
    D <--> E[(PostgreSQL\nDatabase)]
    D <--> F[(Redis Cache)]
    F <--> G[[Background\nWorker Service]]
    end
  `;

  return (
    <div className="content">
      <h1>About</h1>
      <ul>
        <li>User enters a number</li>
        <li>
          Nginx server determines if the request is for the Vite Dev Server or
          the Express API
        </li>
        <li>If for the Vite Server, Nginx serves the Vite Server</li>
        <li>
          If for the Express API, route to the Express API, then
          <ul>
            <li>Stores number in a Postgres database</li>
            <li>Looks up number in Redis for previous calculation</li>
            <li>If already calculated, return the cached result</li>
            <li>
              Otherwise, publishes a message to a subscribed Nodejs worker to
              perform the calculation and caches the value in Redis
            </li>
            <li>Update UI with data from Postgres</li>
            <li>
              Update UI with cached value from Redis is available, otherwise
              return a placeholder, which is updated via a Server Sent Event
              (SSE)
            </li>
          </ul>
        </li>
      </ul>
      <div className="box">
        <h2>Development Architecture</h2>
        <MermaidDiagram>{diagramText}</MermaidDiagram>
      </div>
    </div>
  );
}

export default About;
