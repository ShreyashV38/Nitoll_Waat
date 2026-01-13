import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiMap,
  FiTruck,
  FiBarChart2,
  FiMessageSquare,
  FiUser,
} from "react-icons/fi";
import logo from "../assets/Goa.png";
import "../style/Sidebar.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <img src={logo} alt="NitollWaat Logo" />
        <h2>NitollWaat</h2>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" end className="nav-link">
          <FiHome className="nav-icon" />
          Dashboard
        </NavLink>

        <NavLink to="/mapsandbins" className="nav-link">
          <FiMap className="nav-icon" />
          Map and Bins
        </NavLink>

        <NavLink to="/routes" className="nav-link">
          <FiMap className="nav-icon" />
          Routes
        </NavLink>

        <NavLink to="/vehicles" className="nav-link">
          <FiTruck className="nav-icon" />
          Vehicles
        </NavLink>

        <NavLink to="/reports" className="nav-link">
          <FiBarChart2 className="nav-icon" />
          Reports
        </NavLink>

        <NavLink to="/messages" className="nav-link">
          <FiMessageSquare className="nav-icon" />
          Messages
        </NavLink>

        <NavLink to="/profile" className="nav-link">
          <FiUser className="nav-icon" />
          Profile
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
