import { Link } from "react-router-dom";
import "../../styles/navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/feed">Feed</Link>
        <Link to="/create">create Post</Link>
      </div>
    </nav>
  );
};

export default Navbar;
