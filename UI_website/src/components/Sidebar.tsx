<<<<<<< HEAD
import React from 'react';
import { LayoutGrid, Map, Truck, FileText, MessageSquare, User, ChevronLeft } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import GoaLogo from '../assets/Goa.png'; 
import '../style/Sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="branding-row">
          <img src={GoaLogo} alt="Goa Logo" className="sidebar-logo" />
          <div className="welcome-box">
            <h1 className="brand-text">
              Welcome to <br />
              <span className="brand-name">NitollWaat</span>
            </h1>
          </div>
          <button className="collapse-toggle">
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>

      <nav className="nav-menu">
        <NavItem to="/dashboard" icon={<LayoutGrid size={22}/>} label="Dashboard" />
        <NavItem to="/maps-bins" icon={<Map size={22}/>} label="Map and Bins" />
        <NavItem to="/routes" icon={<Truck size={22}/>} label="Routes" />
        <NavItem to="/vehicles" icon={<Truck size={22}/>} label="Vehicles" />
        <NavItem to="/reports" icon={<FileText size={22}/>} label="Reports" />
        <NavItem to="/messages" icon={<MessageSquare size={22}/>} label="Messages" />
        <NavItem to="/profile" icon={<User size={22}/>} label="Profile" />
      </nav>
    </aside>
  );
};

const NavItem = ({ icon, label, to }: any) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
  >
    <span className="icon">{icon}</span>
    <span className="label">{label}</span>
  </NavLink>
);

export default Sidebar;
=======
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
>>>>>>> f2a4db6e964d766c90e959994cbda633cba31382
