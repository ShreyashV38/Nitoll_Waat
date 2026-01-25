import React, { useState, useEffect } from "react";
import StateCard from "../components/StateCard";
import AlertsWidget from "../components/Dashboard/AlertsWidget";
import BinMap from "../components/MapsBins/BinMap"; 
import RoutesWidget from "../components/Dashboard/RouteWidget";
import WasteChart from "../components/Dashboard/WasteChart";
import PageHeader from "../components/PageHeader";
import { binAPI, alertAPI, fleetAPI, dumpingZoneAPI, analyticsAPI, } from "../services/api"; 
import { useAuth } from "../context/AuthContext"; 
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

  useEffect(() => {
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
        
        // 5. Process Routes (WITH DRIVER DETAILS)
        const widgetRoutes = routeRes.data.map((r: any) => ({
            id: r.id,
            name: `Route #${r.id.substring(0, 4)}`,
            progress: r.total_stops > 0 ? Math.round((r.completed_stops / r.total_stops) * 100) : 0, 
            status: r.status,
            driver: r.driver_name || "Unassigned",
            vehicle: r.license_plate || "No Vehicle",
            ward: r.ward_name || "General Area"
        }));
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
    
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
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

      {/* Row 1: Equal Height Widgets */}
      <section className="main-grid">
        {/* Column 1: Alerts Only */}
        <AlertsWidget alerts={alerts.slice(0, 3)} /> 
        
        {/* Column 2: Map */}
        <div style={{ height: '100%', minHeight: '300px' }}> 
           <BinMap 
             bins={bins} 
             zones={zones} 
           />
        </div>

        {/* Column 3: Routes */}
        <RoutesWidget 
          routes={activeRoutesList} 
          latestActivity={latestActivity}        
        />
      </section>

      {/* Row 2: Full Width Chart */}
      <section className="chart-section" style={{ marginTop: '24px' }}>
         <WasteChart data={chartData} labels={chartLabels} />
      </section>
    </div>
  );
};

export default Dashboard;