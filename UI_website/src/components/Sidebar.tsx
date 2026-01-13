import React from 'react';
import { Home, Map, Route, Truck, FileText, MessageSquare, User } from 'lucide-react';
import '../style/Sidebar.css';

interface SidebarProps {
  activeRoute: string;
  setActiveRoute: (route: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeRoute, setActiveRoute }) => {
  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/' },
    { name: 'Map and Bins', icon: Map, path: '/area' },
    { name: 'Routes', icon: Route, path: '/routes' },
    { name: 'Vehicles', icon: Truck, path: '/vehicles', badge: 12 },
    { name: 'Reports', icon: FileText, path: '/reports' },
    { name: 'Messages', icon: MessageSquare, path: '/messages', badge: 12 },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <div className="logo-inner"></div>
        </div>
        <div className="welcome-text">Welcome to</div>
        <h2 className="logo-title">NitollWaat</h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeRoute === item.path;
          return (
            <div
              key={item.name}
              onClick={() => setActiveRoute(item.path)}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
              {item.badge && <span className="badge">{item.badge}</span>}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;