import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";

import Header from "./Header.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  // Declarative routing setup
  <BrowserRouter>
    <Header />
    <Routes>
      <Route index element={<Home />} />
      <Route path="about" element={<About />} />
    </Routes>
  </BrowserRouter>
);
