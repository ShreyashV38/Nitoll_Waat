import React, { useState, useEffect } from "react";
import StateCard from "../components/StateCard";
import AlertsWidget from "../components/Dashboard/AlertsWidget";
import BinMap from "../components/MapsBins/BinMap"; 
import RoutesWidget from "../components/Dashboard/RouteWidget";
import WasteChart from "../components/Dashboard/WasteChart"; // <--- IMPORT THIS
import PageHeader from "../components/PageHeader";
// Import analyticsAPI
import { binAPI, alertAPI, fleetAPI, dumpingZoneAPI, analyticsAPI } from "../services/api"; 
import { useAuth } from "../context/AuthContext"; 
import "../style/Dashboard.css";

const Dashboard = () => {
  const { area } = useAuth();
  
  // Data States
  const [bins, setBins] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]); 
  const [wasteData, setWasteData] = useState<any[]>([]); // <--- NEW STATE
  
  // Stats
  const [vehicleStats, setVehicleStats] = useState("0/0");
  const [routeCount, setRouteCount] = useState(0);
  const [activeRoutesList, setActiveRoutesList] = useState<any[]>([]);
  const [latestActivity, setLatestActivity] = useState<string>("No new activity");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Add analyticsAPI.getStats() to the Promise.all
        const [binRes, alertRes, vehicleRes, routeRes, zoneRes, analyticsRes] = await Promise.all([
            binAPI.getAll(),
            alertAPI.getAll(),
            fleetAPI.getVehicles(),
            fleetAPI.getActiveRoutes(),
            dumpingZoneAPI.getAll(),
            analyticsAPI.getStats() // <--- FETCH ANALYTICS
        ]);

        // ... (Keep existing Bin/Zone/Alert processing logic) ...
        const formattedBins = binRes.data.map((b: any) => ({
           id: b.id.substring(0, 4),
           fullId: b.id,
           level: b.current_fill_percent,
           status: b.status,
           lid: b.lid_status || "CLOSED", 
           weight: parseFloat(b.current_weight) || 0,
           lat: parseFloat(b.latitude),
           lng: parseFloat(b.longitude),
           last_updated: b.last_updated 
        }));

        if (formattedBins.length > 0) {
            const sortedBins = [...formattedBins].sort((a, b) => 
                new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
            );
            const latest = sortedBins[0];
            setLatestActivity(`Bin ${latest.id} updated to ${latest.level}% fill level`);
        }
        
        const formattedZones = zoneRes.data.map((z: any) => ({
            id: z.id,
            name: z.name,
            lat: parseFloat(z.latitude),
            lng: parseFloat(z.longitude)
        }));

        const formattedAlerts = alertRes.data.map((a: any) => ({
            type: a.severity === 'HIGH' ? 'critical' : 'info',
            msg: a.message,
            time: new Date(a.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }));

        const totalVehicles = vehicleRes.data.length;
        const activeVehicles = vehicleRes.data.filter((v: any) => v.status === 'ACTIVE').length;
        setVehicleStats(`${activeVehicles}/${totalVehicles}`);

        setRouteCount(routeRes.data.length);
        const widgetRoutes = routeRes.data.map((r: any, index: number) => ({
            id: `Route ${index + 1}`,
            progress: r.total_stops > 0 ? Math.round((r.completed_stops / r.total_stops) * 100) : 0, 
            status: r.status
        }));
        setActiveRoutesList(widgetRoutes);

        // --- SAVE NEW ANALYTICS DATA ---
        setWasteData(analyticsRes.data.weeklyWaste); 

        setBins(formattedBins);
        setZones(formattedZones); 
        setAlerts(formattedAlerts);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setLoading(false);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const criticalCount = bins.filter(b => b.level >= 90).length;

  const stats = [
    { title: "Total Bins", value: bins.length, subtitle: "Active in zone" },
    { title: "Critical Bins", value: criticalCount, subtitle: "≥90% full", danger: criticalCount > 0 },
    { title: "Active Vehicles", value: vehicleStats, subtitle: "Available today" }, 
    { title: "Routes Today", value: routeCount, subtitle: "In Progress" },
    { title: "Overflow Risk", value: criticalCount, subtitle: "Based on active alerts" },
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
             <AlertsWidget alerts={alerts.slice(0, 3)} /> 
             {/* ADDED THE CHART HERE - LEFT COLUMN */}
             <WasteChart data={wasteData} />
        </div>
        
        <div style={{ height: '100%', minHeight: '600px' }}> 
           <BinMap 
             bins={bins} 
             zones={zones} 
           />
        </div>

        <RoutesWidget 
            routes={activeRoutesList} 
            latestActivity={latestActivity} 
        />
      </section>
    </div>
  );
};

export default Dashboard;