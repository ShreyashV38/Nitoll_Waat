import React from 'react';
import { LayoutGrid, Map, Truck, MessageSquare, User, Moon, Sun } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import GoaLogo from '../assets/Goa.png';
import '../style/Sidebar.css';
import { useTheme } from '../context/ThemeContext';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const Sidebar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === 'dark';

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
        <NavItem to="/dashboard" icon={<LayoutGrid size={22} />} label="Dashboard" />
        <NavItem to="/maps-bins" icon={<Map size={22} />} label="Map and Bins" />
        <NavItem to="/routes" icon={<Truck size={22} />} label="Routes" />
        <NavItem to="/vehicles" icon={<Truck size={22} />} label="Vehicles" />
        <NavItem to="/messages" icon={<MessageSquare size={22} />} label="Messages" />
        <NavItem to="/profile" icon={<User size={22} />} label="Profile" />
      </nav>

      <button className="theme-toggle" onClick={toggleTheme}>
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
    </aside>
  );
};

const NavItem: React.FC<NavItemProps> = ({ icon, label, to }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
  >
    <span className="icon">{icon}</span>
    <span className="label">{label}</span>
  </NavLink>
);

export default Sidebar;