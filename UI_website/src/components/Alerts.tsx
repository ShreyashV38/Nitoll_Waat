import React from 'react';
import '../style/Alerts.css';

interface Alert {
  id: number;
  message: string;
  type: 'error' | 'warning' | 'info';
  time: string;
}

interface AlertsProps {
  alerts: Alert[];
}

const Alerts: React.FC<AlertsProps> = ({ alerts }) => {
  return (
    <div className="card alerts-card">
      <div className="alerts-header">
        <h3 className="card-title">Live Alerts</h3>
        <span className="alerts-badge">{alerts.length}</span>
      </div>

      <div className="alerts-list">
        {alerts.map((alert) => (
          <div key={alert.id} className={`alert-item alert-${alert.type}`}>
            <div className="alert-message">{alert.message}</div>
            <div className="alert-time">{alert.time}</div>
          </div>
        ))}
      </div>

      <button className="view-all-button">View all Alerts</button>
    </div>
  );
};

export default Alerts;