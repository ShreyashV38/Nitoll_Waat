import Sidebar from "../components/Sidebar";
import StateCard from "../components/StateCard";
import "../style/Dashboard.css";


const Dashboard = () => {
  const stats = [
    { title: "Total Bins", value: 120, subtitle: "Active in zone" },
    { title: "Critical Bins", value: 6, subtitle: "≥80% full", danger: true },
    { title: "Active Vehicles", value: "3/3", subtitle: "Available today" },
    { title: "Routes Today", value: 3, subtitle: "Auto-generated" },
    { title: "Overflow Risk", value: 2, subtitle: "Predicted soon" },
  ];

  return (
    <div className="layout">
      <Sidebar />

      <main className="dashboard">
        <header className="dashboard-header">
          <h1>Panaji Municipal Council (Zone A)</h1>
          <p>North Goa • 3 Vehicles Registered</p>
        </header>

        <section className="overview">
          <h3>Overview</h3>
          <span className="status">● Healthy</span>
        </section>

        <section className="stats-grid">
          {stats.map((s, i) => (
            <StateCard key={i} {...s} />
          ))}
        </section>
      </main>
    </div>
  );
};
export default Dashboard;
