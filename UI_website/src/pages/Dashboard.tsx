<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import StateCard from "../components/StateCard";
import AlertsWidget from "../components/Dashboard/AlertsWidget";
import BinMap from "../components/MapsBins/BinMap"; 
import RoutesWidget from "../components/Dashboard/RouteWidget";
import WasteChart from "../components/Dashboard/WasteChart";
import PageHeader from "../components/PageHeader";
import { binAPI, alertAPI, fleetAPI, dumpingZoneAPI, analyticsAPI, } from "../services/api"; 
import { useAuth } from "../context/AuthContext"; 
import { socketService } from "../services/socket"; // ✅ IMPORT SOCKET

import "../style/Dashboard.css";

const Dashboard = () => {
  const { area } = useAuth();
  
  // Data States
  const [bins, setBins] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]); 
  
  // Chart Data States
  const [chartData, setChartData] = useState<number[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  
  // Stats
  const [vehicleStats, setVehicleStats] = useState("0/0");
  const [routeCount, setRouteCount] = useState(0);
  const [activeRoutesList, setActiveRoutesList] = useState<any[]>([]);
  const [latestActivity, setLatestActivity] = useState<string>("No new activity");

  const [loading, setLoading] = useState(true);

  // ✅ Extracted fetchData so it can be called by Socket
  const fetchData = async () => {
    try {
      const [binRes, alertRes, vehicleRes, routeRes, zoneRes, analyticsRes] = await Promise.all([
          binAPI.getAll(),
          alertAPI.getAll(),
          fleetAPI.getVehicles(),
          fleetAPI.getActiveRoutes(),
          dumpingZoneAPI.getAll(),
          analyticsAPI.getStats()
      ]);

      // 1. Process Bins
      const formattedBins = binRes.data.map((b: any) => ({
          id: b.id.substring(0, 4),
          fullId: b.id,
          level: b.current_fill_percent,
          status: b.status,
          lid: b.lid_status || "CLOSED", 
          weight: parseFloat(b.current_weight) || 0,
          lat: parseFloat(b.latitude),
          lng: parseFloat(b.longitude),
          last_updated: b.last_updated,
          prediction: b.prediction 
      }));

      if (formattedBins.length > 0) {
          const sortedBins = [...formattedBins].sort((a, b) => 
              new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
          );
          const latest = sortedBins[0];
          setLatestActivity(`Bin ${latest.id} updated to ${latest.level}% fill level`);
      }
      
      // 2. Process Zones
      const formattedZones = zoneRes.data.map((z: any) => ({
          id: z.id,
          name: z.name,
          lat: parseFloat(z.latitude),
          lng: parseFloat(z.longitude)
      }));

      // 3. Process Alerts
      const formattedAlerts = alertRes.data.map((a: any) => ({
          type: a.severity === 'HIGH' ? 'critical' : 'info',
          msg: a.message,
          time: new Date(a.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }));

      // 4. Process Vehicles Stats
      const totalVehicles = vehicleRes.data.length;
      const activeVehicles = vehicleRes.data.filter((v: any) => v.status === 'ACTIVE').length;
      setVehicleStats(`${activeVehicles}/${totalVehicles}`);

      setRouteCount(routeRes.data.length);
      
      // 5. Process Routes (WITH SAFETY CHECK)
      const widgetRoutes = routeRes.data.map((r: any) => {
        // Safe math to avoid NaN errors
        const completed = parseInt(r.completed_stops) || 0;
        const total = parseInt(r.total_stops) || 0;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        return {
          id: r.id,
          name: `Route #${r.id.substring(0, 4)}`,
          progress: percentage, // <--- This sends the % to the widget
          status: r.status,
          driver: r.driver_name || "Unassigned",
          vehicle: r.license_plate || "No Vehicle",
          ward: r.ward_name || "General Area"
        };
      });
      setActiveRoutesList(widgetRoutes);

      // 6. Process Analytics (Dynamic Chart Data)
      const stats = analyticsRes.data;
      if (stats && Array.isArray(stats.weeklyWaste)) {
          const labels = stats.weeklyWaste.map((item: any) => item.day);
          const values = stats.weeklyWaste.map((item: any) => parseFloat(item.total_weight) || 0);

          if (values.length === 0) {
               setChartLabels(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
               setChartData([0, 0, 0, 0, 0, 0, 0]);
          } else {
               setChartLabels(labels);
               setChartData(values);
          }
      }

      setBins(formattedBins);
      setZones(formattedZones); 
      setAlerts(formattedAlerts);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // ✅ NEW: Socket Listeners
    const socket = socketService.connect();
    socket.on("connect", () => console.log("Dashboard Socket Connected"));
    
    // Listen for progress updates
    socket.on("route_update", () => {
        console.log("♻️ Dashboard refreshing route progress...");
        fetchData();
    });
    
    socket.on("bin_update", () => fetchData());

    const interval = setInterval(fetchData, 60000);
    return () => {
        clearInterval(interval);
        socket.off("route_update");
        socket.off("bin_update");
    };
  }, []);

  const criticalCount = bins.filter(b => b.level >= 50).length;

  const stats = [
    { title: "Total Bins", value: bins.length, subtitle: "Active in zone" },
    { title: "Critical Bins", value: criticalCount, subtitle: "≥50% full", danger: criticalCount > 0 },
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
          <span>Data updated: {loading ? 'Loading...' : 'Live 🟢'}</span>
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
        <div style={{ height: '100%', minHeight: '300px' }}> 
           <BinMap bins={bins} zones={zones} />
        </div>
        <RoutesWidget routes={activeRoutesList} latestActivity={latestActivity} />
      </section>

      <section className="chart-section" style={{ marginTop: '24px' }}>
         <WasteChart data={chartData} labels={chartLabels} />
      </section>
    </div>
  );
};

export default Dashboard;
=======
import Sidebar from "../components/Sidebar";
import "../style/Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="main-content">
        <header className="content-header">
          <div className="zone-info">
            <h1>Panaji Municipal Council (Zone A)</h1>
            <p>North Goa • 3 Vehicles Registered</p>
          </div>
        </header>

        <section className="overview-section">
          <div className="section-title-row">
            <h2>Overview</h2>
            <div className="status-badge">
              System Status: <span className="status-green">● Healthy</span>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <span className="label">Total Bins</span>
              <div className="value">120</div>
              <span className="sub-label">Active in zone</span>
            </div>
            <div className="stat-card critical">
              <span className="label">Critical Bins</span>
              <div className="value">6</div>
              <span className="sub-label">≥ 80% fill</span>
            </div>
            <div className="stat-card">
              <span className="label">Active Vehicles</span>
              <div className="value">3/3</div>
              <span className="sub-label">Available today</span>
            </div>
            <div className="stat-card">
              <span className="label">Routes Today</span>
              <div className="value">3</div>
              <span className="sub-label">Auto-generated</span>
            </div>
            <div className="stat-card">
              <span className="label">Overflow Risk</span>
              <div className="value">2</div>
              <span className="sub-label">Predicted soon</span>
            </div>
          </div>
        </section>

        <div className="dashboard-grid-bottom">
          <div className="widget live-alerts">
            <h3>
              Live Alerts <span className="badge">12</span>
            </h3>
            <div className="alert-item critical-alert">
              <p>Bin B-12 predicted to overflow</p>
              <span>time</span>
            </div>
            <div className="alert-item warning-alert">
              <p>Bin C-07 sensor offline</p>
              <span>time</span>
            </div>
            <div className="alert-item info-alert">
              <p>Daily routes generated</p>
              <span>time</span>
            </div>
            <button className="view-all-btn">View all Alerts</button>
          </div>

          <div className="widget map-preview">
            <h3>Map preview</h3>
            <div className="map-placeholder">
              <img src="/assets/map-preview.png" alt="Map View" />
              <button className="full-map-btn">Open full map</button>
            </div>
          </div>

          <div className="widget routes-list">
            <h3>Today's Routes</h3>
            <div className="route-item">
              <div className="route-header">
                <span>GA-07-T-1234</span>
                <span className="progress-label">in progress 5/6</span>
              </div>
              <div className="progress-bar">
                <div className="fill" style={{ width: "83%" }}></div>
              </div>
            </div>
            <div className="route-item">
              <div className="route-header">
                <span>GA-07-T-5678</span>
                <span className="progress-label">in progress 3/7</span>
              </div>
              <div className="progress-bar">
                <div className="fill" style={{ width: "42%" }}></div>
              </div>
            </div>
            <div className="route-item">
              <div className="route-header">
                <span>GA-07-T-9012</span>
                <span className="progress-label">completed 5/5</span>
              </div>
              <div className="progress-bar completed">
                <div className="fill" style={{ width: "100%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
>>>>>>> develop
