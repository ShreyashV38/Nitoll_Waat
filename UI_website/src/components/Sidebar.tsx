import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Map as MapIcon,
  Route,
  Truck,
  BarChart3,
  MessageSquare,
  UserCircle,
  ChevronLeft,
} from "lucide-react"; // Using Lucide icons for a clean look
import "../style/Sidebar.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo-container">
          <img
            src="/assets/road-map-illustration.png"
            alt="Logo"
            className="brand-logo"
          />
          <button className="collapse-btn">
            <ChevronLeft size={20} />
          </button>
        </div>
        <div className="brand-text">
          <h2>Welcome to</h2> [cite: 142]
          <h1>NitollWaat</h1> [cite: 142]
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <LayoutDashboard size={22} />
          <span>Dashboard</span> [cite: 143]
        </NavLink>

        <NavLink
          to="/map"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <MapIcon size={22} />
          <span>Map and Bins</span> [cite: 144]
        </NavLink>

        <NavLink
          to="/routes"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <Route size={22} />
          <span>Routes</span>
        </NavLink>

        <NavLink
          to="/vehicles"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <div className="nav-label-group">
            <Truck size={22} />
            <span>Vehicles</span> [cite: 146]
          </div>
          <span className="nav-badge">12</span> [cite: 148]
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <BarChart3 size={22} />
          <span>Reports</span> [cite: 147]
        </NavLink>

        <NavLink
          to="/messages"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <div className="nav-label-group">
            <MessageSquare size={22} />
            <span>Messages</span> [cite: 149]
          </div>
          <span className="nav-badge">12</span> [cite: 150]
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <UserCircle size={22} />
          <span>Profile</span> [cite: 151]
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
