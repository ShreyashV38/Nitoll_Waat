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
