import { useState, useEffect } from "react";
import StateCard from "../components/StateCard";
import AlertsWidget from "../components/Dashboard/AlertsWidget";
import BinMap from "../components/MapsBins/BinMap";
import RoutesWidget from "../components/Dashboard/RouteWidget";
import WasteChart from "../components/Dashboard/WasteChart";
import BinHealthWidget from "../components/Dashboard/BinHealthWidget";
import PredictionTimeline from "../components/Dashboard/PredictionTimeline";
import PageHeader from "../components/PageHeader";
import { binAPI, alertAPI, fleetAPI, dumpingZoneAPI, analyticsAPI, } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { socketService } from "../services/socket";
import { exportToCSV } from "../utils/exportCSV";
import { findBoundaryForArea } from "../data/goaBoundaries";

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

      const formattedZones = zoneRes.data.map((z: any) => ({
        id: z.id,
        name: z.name,
        lat: parseFloat(z.latitude),
        lng: parseFloat(z.longitude)
      }));

      const formattedAlerts = alertRes.data.map((a: any) => ({
        type: a.severity === 'HIGH' ? 'critical' : 'info',
        msg: a.message,
        time: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));

      const totalVehicles = vehicleRes.data.length;
      const activeVehicles = vehicleRes.data.filter((v: any) => v.status === 'ACTIVE').length;
      setVehicleStats(`${activeVehicles}/${totalVehicles}`);

      setRouteCount(routeRes.data.length);

      const widgetRoutes = routeRes.data.map((r: any) => {
        const completed = parseInt(r.completed_stops) || 0;
        const total = parseInt(r.total_stops) || 0;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
          id: r.id,
          name: `Route #${r.id.substring(0, 4)}`,
          progress: percentage,
          status: r.status,
          driver: r.driver_name || "Unassigned",
          vehicle: r.license_plate || "No Vehicle",
          ward: r.ward_name || "General Area",
          route_points: r.route_points || [],
          skipped_bins: r.skipped_bins || []
        };
      });
      setActiveRoutesList(widgetRoutes);

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

    const socket = socketService.connect();
    socket.on("connect", () => console.log("Dashboard Socket Connected"));

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
    { title: "Alerts Today", value: alerts.length, subtitle: alerts.length > 0 ? "Needs attention" : "All clear", danger: alerts.length > 3 },
    { title: "Routes Today", value: routeCount, subtitle: "In Progress" },
    { title: "Active Vehicles", value: vehicleStats, subtitle: "Available today" },
    { title: "Overflow Risk", value: criticalCount, subtitle: "Based on active alerts", danger: criticalCount > 0 },
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
        <button
          onClick={() => exportToCSV(bins.map(b => ({
            Bin_ID: b.fullId,
            Fill_Level: `${b.level}%`,
            Status: b.status,
            Lid_Status: b.lid,
            Weight_kg: `${b.weight}`,
            Latitude: b.lat,
            Longitude: b.lng,
            Prediction_Status: b.prediction?.status || 'N/A',
            Hours_Until_Overflow: b.prediction?.hours_until_overflow ?? 'N/A',
            Predicted_Overflow: b.prediction?.predicted_overflow_at
              ? new Date(b.prediction.predicted_overflow_at).toLocaleString() : 'N/A',
            Needs_Collection: b.level >= 50 ? 'YES' : 'NO',
            Last_Updated: new Date(b.last_updated).toLocaleString()
          })), `bin_report_${area?.area_name || 'zone'}`)}
          style={{
            padding: '8px 16px', borderRadius: 20, border: '1px solid var(--border-color)',
            background: 'var(--card-bg)', color: 'var(--text-secondary)', fontSize: 13,
            cursor: 'pointer', fontWeight: 600
          }}
        >
          📥 Export CSV
        </button>
      </section>
      <section className="stats-grid">
        {stats.map((s, i) => (
          <StateCard key={i} {...s} />
        ))}
      </section>

      <section className="main-grid">
        <AlertsWidget alerts={alerts.slice(0, 3)} />
        <div style={{ height: '100%', minHeight: '300px' }}>
          <BinMap bins={bins} zones={zones} activeRoutes={activeRoutesList} boundary={area?.taluka ? (() => {
            const b = findBoundaryForArea(area.taluka);
            return b ? { ...b, fillColor: b.fillColor } : undefined;
          })() : undefined} />
        </div>
        <RoutesWidget routes={activeRoutesList} latestActivity={latestActivity} />
      </section>

      <section className="chart-section" style={{ marginTop: '24px' }}>
        <WasteChart data={chartData} labels={chartLabels} />
      </section>

      {/* Bin Health & Overflow Predictions */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
        <BinHealthWidget />
        <PredictionTimeline bins={bins} />
      </section>
    </div>
  );
};

export default Dashboard;
