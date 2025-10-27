import { NavLink } from "react-router";
import image from "/favicon-32x32.png";

function Header() {
  return (
    <nav>
      <span>
        <img src={image} />
        <h2>Fibi Overkill</h2>
      </span>
      <div>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Home
        </NavLink>
        {" | "}
        <NavLink
          to="/about"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          About
        </NavLink>
      </div>
    </nav>
  );
}

export default Header;
