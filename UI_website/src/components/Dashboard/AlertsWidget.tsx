import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../../services/socket"; 
import "../../style/Dashboard.css"; 

interface Alert {
  type: string;
  msg: string;
  time: string;
}

interface Props {
  alerts: Alert[]; 
}

const AlertsWidget: React.FC<Props> = ({ alerts: initialAlerts }) => {
  const navigate = useNavigate();
  const [currentAlerts, setCurrentAlerts] = useState<Alert[]>(initialAlerts);

  useEffect(() => {
    setCurrentAlerts(initialAlerts);
  }, [initialAlerts]);

  // Listen for Real-Time Socket Events
  useEffect(() => {
    if (!socket) return;

    const handleNewAlert = (alertData: any) => {
      console.log("New Alert Received:", alertData);

      const newAlert: Alert = {
        type: alertData.severity === 'HIGH' ? 'critical' : 'warning',
        msg: alertData.message,
        time: new Date(alertData.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setCurrentAlerts((prev) => [newAlert, ...prev]);
    };

    // ✅ FIX: Changed 'newAlert' to 'new_alert' to match Backend
    socket.on('new_alert', handleNewAlert);

    return () => {
      if (socket) {
        socket.off('new_alert', handleNewAlert);
      }
    };
  }, []);

  return (
    <div className="dashboard-card alerts-card">
      <div className="card-header">
        <h3>Live Alerts</h3>
        <span className="badge-count">{currentAlerts.length}</span>
      </div>
      <div className="alerts-list">
        {currentAlerts.length === 0 ? (
          <p className="empty-feed" style={{textAlign: 'center', marginTop: '20px'}}>No active alerts</p>
        ) : (
          currentAlerts.map((alert, idx) => (
            <div key={idx} className={`alert-box ${alert.type}`}>
              <p className="alert-msg">{alert.msg}</p>
              <span className="alert-time">{alert.time}</span>
            </div>
          ))
        )}
      </div>
      <button 
        className="view-all-btn" 
        onClick={() => navigate('/messages')} 
      >
        View all Alerts
      </button>
    </div>
  );
};

export default AlertsWidget;