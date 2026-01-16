import React from 'react';
import { LayoutGrid, Map, Truck, MessageSquare, User } from 'lucide-react'; 
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
        </div>
      </div>

      <nav className="nav-menu">
        <NavItem to="/dashboard" icon={<LayoutGrid size={22}/>} label="Dashboard" />
        <NavItem to="/maps-bins" icon={<Map size={22}/>} label="Map and Bins" />
        <NavItem to="/routes" icon={<Truck size={22}/>} label="Routes" />
        <NavItem to="/vehicles" icon={<Truck size={22}/>} label="Vehicles" />
        {/* REMOVED REPORTS ITEM */}
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