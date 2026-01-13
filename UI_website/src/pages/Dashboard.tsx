import { useEffect } from "react";
import StateCard from "../components/StateCard";
import "../style/Dashboard.css";

// --- MAP IMPORTS ---
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// --- FIX: Default Leaflet Icons in React ---
import iconMarker from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: iconMarker,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;
// ------------------------------------------

const Dashboard = () => {
  // 1. Stats Data
  const stats = [
    { title: "Total Bins", value: 120, subtitle: "Active in zone" },
    { title: "Critical Bins", value: 6, subtitle: "≥80% full", danger: true },
    { title: "Active Vehicles", value: "3/3", subtitle: "Available today" },
    { title: "Routes Today", value: 3, subtitle: "Auto-generated" },
    { title: "Overflow Risk", value: 2, subtitle: "Predicted soon" },
  ];

  // 2. Mock Alerts Data
  const alerts = [
    { type: "critical", msg: "Bin B-12 predicted to overflow", time: "10 mins ago" },
    { type: "info", msg: "Bin C-07 sensor offline", time: "1 hour ago" },
    { type: "info", msg: "Daily routes generated", time: "5 hours ago" },
  ];

  // 3. Mock Route Progress Data
  const activeRoutes = [
    { id: "GA-07-T-1234", progress: 80, status: "in progress" },
    { id: "GA-07-T-5678", progress: 45, status: "in progress" },
    { id: "GA-07-T-9012", progress: 100, status: "completed" },
  ];

  // Goa Business School Coordinates [Lat, Lng]
  const GBS_COORDS: [number, number] = [15.4585, 73.8340];

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Panaji Municipal Council (Zone A)</h1>
          <p>North Goa • 3 Vehicles Registered</p>
        </div>
      </header>

      {/* Overview Bar */}
      <section className="overview-bar">
        <div className="overview-text">
          <h3>Overview</h3>
          <span>Data updated: Just now</span>
        </div>
        <div className="system-pill">
          <span className="dot"></span> System Status: <strong>Healthy</strong>
        </div>
      </section>

      {/* Top Stats Grid */}
      <section className="stats-grid">
        {stats.map((s, i) => (
          <StateCard key={i} {...s} />
        ))}
      </section>

      {/* Bottom Main Grid (3 Columns) */}
      <section className="main-grid">
        
        {/* Column 1: Live Alerts */}
        <div className="dashboard-card alerts-card">
          <div className="card-header">
            <h3>Live Alerts</h3>
            <span className="badge-count">12</span>
          </div>
          <div className="alerts-list">
            {alerts.map((alert, idx) => (
              <div key={idx} className={`alert-box ${alert.type}`}>
                <p className="alert-msg">{alert.msg}</p>
                <span className="alert-time">{alert.time}</span>
              </div>
            ))}
          </div>
          <button className="view-all-btn">View all Alerts</button>
        </div>

        {/* Column 2: INTERACTIVE MAP (Leaflet) */}
        <div className="dashboard-card map-card">
          <div className="card-header">
             <h3>Map preview</h3>
          </div>
          <div className="map-preview-box">
             <MapContainer 
                center={GBS_COORDS} 
                zoom={15} 
                style={{ height: "100%", width: "100%", zIndex: 0 }}
             >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={GBS_COORDS}>
                  <Popup>
                    <strong>Goa Business School</strong><br />
                    Active Zone A
                  </Popup>
                </Marker>
             </MapContainer>
          </div>
        </div>

        {/* Column 3: Routes & Feed */}
        <div className="right-column">
          {/* Today's Routes */}
          <div className="dashboard-card routes-card">
            <h3>Today's Routes</h3>
            <div className="routes-list">
              {activeRoutes.map((route) => (
                <div key={route.id} className="route-item">
                  <div className="route-info">
                    <span>{route.id}</span>
                    <span className={`status-badge ${route.status.replace(" ", "")}`}>
                      {route.status}
                    </span>
                  </div>
                  <div className="progress-bg">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${route.progress}%`, background: route.progress === 100 ? '#4ade80' : '#fb923c' }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Feed Placeholder */}
          <div className="dashboard-card feed-card">
            <h3>Active Feed</h3>
            <div className="empty-feed">No new activity</div>
          </div>
        </div>

      </section>
    </div>
  );
};

export default Dashboard;