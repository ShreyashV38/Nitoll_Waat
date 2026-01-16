import React from "react";
import "../../style/Dashboard.css"; 

interface Alert {
  type: string;
  msg: string;
  time: string;
}

interface Props {
  alerts: Alert[];
}

const AlertsWidget: React.FC<Props> = ({ alerts }) => {
  return (
    <div className="dashboard-card alerts-card">
      <div className="card-header">
        <h3>Live Alerts</h3>
        <span className="badge-count">{alerts.length}</span>
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
  );
};

export default AlertsWidget;