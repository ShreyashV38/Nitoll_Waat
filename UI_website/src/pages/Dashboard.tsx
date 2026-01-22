import React, { useState, useEffect } from "react";
import StateCard from "../components/StateCard";
import AlertsWidget from "../components/Dashboard/AlertsWidget";
import BinMap from "../components/MapsBins/BinMap"; 
import RoutesWidget from "../components/Dashboard/RouteWidget";
import PageHeader from "../components/PageHeader";
import { binAPI, alertAPI, fleetAPI } from "../services/api"; // <--- Import fleetAPI
import { useAuth } from "../context/AuthContext"; 
import "../style/Dashboard.css";

const Dashboard = () => {
  const { area } = useAuth();
  const [selectedBinId, setSelectedBinId] = useState<string>("");
  const [bins, setBins] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  
  // New State for Dynamic Stats
  const [vehicleStats, setVehicleStats] = useState("0/0");
  const [routeCount, setRouteCount] = useState(0);
  const [activeRoutesList, setActiveRoutesList] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  // Fetch ALL Live Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Bins, Alerts, Vehicles, and Routes in parallel
        const [binRes, alertRes, vehicleRes, routeRes] = await Promise.all([
            binAPI.getAll(),
            alertAPI.getAll(),
            fleetAPI.getVehicles(),
            fleetAPI.getActiveRoutes()
        ]);

        // 1. Process Bins
        const formattedBins = binRes.data.map((b: any) => ({
           id: b.id.substring(0, 4),
           fullId: b.id,
           level: b.current_fill_percent,
           status: b.status === 'NORMAL' ? 'Active' : b.status,
           lat: parseFloat(b.latitude),
           lng: parseFloat(b.longitude)
        }));
        
        // 2. Process Alerts
        const formattedAlerts = alertRes.data.map((a: any) => ({
            type: a.severity === 'HIGH' ? 'critical' : 'info',
            msg: a.message,
            time: new Date(a.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }));

        // 3. Process Vehicles (Count Active vs Total)
        const totalVehicles = vehicleRes.data.length;
        const activeVehicles = vehicleRes.data.filter((v: any) => v.status === 'ACTIVE').length;
        setVehicleStats(`${activeVehicles}/${totalVehicles}`);

        // 4. Process Routes
        setRouteCount(routeRes.data.length);
        
        // Format Routes for the Widget
        const widgetRoutes = routeRes.data.map((r: any, index: number) => ({
            id: `Route ${index + 1}`,
            progress: 50, // Placeholder progress (needs DB field to be real)
            status: r.status
        }));
        setActiveRoutesList(widgetRoutes);

        setBins(formattedBins);
        setAlerts(formattedAlerts);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const criticalCount = bins.filter(b => b.level >= 90).length;

  const stats = [
    { title: "Total Bins", value: bins.length, subtitle: "Active in zone" },
    { title: "Critical Bins", value: criticalCount, subtitle: "≥90% full", danger: criticalCount > 0 },
    
    // NOW DYNAMIC:
    { title: "Active Vehicles", value: vehicleStats, subtitle: "Available today" }, 
    { title: "Routes Today", value: routeCount, subtitle: "In Progress" },
    
    { title: "Overflow Risk", value: criticalCount, subtitle: "Predicted soon" },
  ];

  return (
    <div className="dashboard">
      <PageHeader 
        title={area ? `${area.area_name}` : "Loading Zone..."} 
        subtitle={area ? `${area.district} • Real-Time Overview` : "Loading..."}
      />

      <section className="overview-bar">
        <div className="overview-text">
          <h3>Overview</h3>
          <span>Data updated: {loading ? 'Loading...' : 'Live'}</span>
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
        <AlertsWidget alerts={alerts.slice(0, 3)} /> 
        
        <div style={{ height: '100%', minHeight: '400px' }}> 
           <BinMap 
             title="Live Map"
             bins={bins} 
             selectedId={selectedBinId} 
             onSelect={setSelectedBinId} 
           />
        </div>

        {/* Pass the dynamic routes list here */}
        <RoutesWidget routes={activeRoutesList.length > 0 ? activeRoutesList : []} />
      </section>
    </div>
  );
};

export default Dashboard;