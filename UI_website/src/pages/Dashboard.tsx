import React, { useState } from "react";
import StateCard from "../components/StateCard";
import AlertsWidget from "../components/Dashboard/AlertsWidget";
import BinMap from "../components/MapsBins/BinMap"; 
import RoutesWidget from "../components/Dashboard/RouteWidget";
import PageHeader from "../components/PageHeader";
import "../style/Dashboard.css";

const Dashboard = () => {
  const [selectedBinId, setSelectedBinId] = useState<string>("");

  const bins = [
    { id: 'A12', level: 90, status: 'Active', lat: 15.4585, lng: 73.8340 },
    { id: 'A15', level: 60, status: 'Active', lat: 15.4590, lng: 73.8350 },
    { id: 'B03', level: 20, status: 'Active', lat: 15.4580, lng: 73.8335 },
    { id: 'C07', level: 0, status: 'Offline', lat: 15.4575, lng: 73.8345 },
    { id: 'B08', level: 85, status: 'Active', lat: 15.4595, lng: 73.8330 },
    { id: 'A20', level: 15, status: 'Active', lat: 15.4582, lng: 73.8360 },
  ];

  const stats = [
    { title: "Total Bins", value: 120, subtitle: "Active in zone" },
    { title: "Critical Bins", value: 6, subtitle: "≥80% full", danger: true },
    { title: "Active Vehicles", value: "3/3", subtitle: "Available today" },
    { title: "Routes Today", value: 3, subtitle: "Auto-generated" },
    { title: "Overflow Risk", value: 2, subtitle: "Predicted soon" },
  ];

  const alerts = [
    { type: "critical", msg: "Bin B-12 predicted to overflow", time: "10 mins ago" },
    { type: "info", msg: "Bin C-07 sensor offline", time: "1 hour ago" },
    { type: "info", msg: "Daily routes generated", time: "5 hours ago" },
  ];

  const activeRoutes = [
    { id: "GA-07-T-1234", progress: 80, status: "in progress" },
    { id: "GA-07-T-5678", progress: 45, status: "in progress" },
    { id: "GA-07-T-9012", progress: 100, status: "completed" },
  ];

  return (
    <div className="dashboard">
      <PageHeader 
        title="Panaji Municipal Council (Zone A)"
        subtitle="North Goa • 3 Vehicles Registered"
      />

      <section className="overview-bar">
        <div className="overview-text">
          <h3>Overview</h3>
          <span>Data updated: Just now</span>
        </div>
        <div className="system-pill">
          <span className="dot"></span> System Status: <strong>Healthy</strong>
        </div>
      </section>

      <section className="stats-grid">
        {stats.map((s, i) => (
          <StateCard key={i} {...s} />
        ))}
      </section>

      <section className="main-grid">
        <AlertsWidget alerts={alerts} />
        
        {/* Middle Col: BinMap with Title */}
        <div style={{ height: '100%', minHeight: '400px' }}> 
           <BinMap 
             title="Map preview"  // <--- Shows the heading now!
             bins={bins} 
             selectedId={selectedBinId} 
             onSelect={setSelectedBinId} 
           />
        </div>

        <RoutesWidget routes={activeRoutes} />
      </section>
    </div>
  );
};

export default Dashboard;