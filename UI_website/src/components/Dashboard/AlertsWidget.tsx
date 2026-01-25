import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../../services/socket"; // Ensure this path matches your socket service
import "../../style/Dashboard.css"; 

interface Alert {
  type: string;
  msg: string;
  time: string;
}

interface Props {
  alerts: Alert[]; // Initial alerts fetched by parent
}

const AlertsWidget: React.FC<Props> = ({ alerts: initialAlerts }) => {
  const navigate = useNavigate();
  
  // Local state to handle both initial and new live alerts
  const [currentAlerts, setCurrentAlerts] = useState<Alert[]>(initialAlerts);

  // 1. Sync with parent if initial props change (e.g. on first load)
  useEffect(() => {
    setCurrentAlerts(initialAlerts);
  }, [initialAlerts]);

  // 2. Listen for Real-Time Socket Events
  useEffect(() => {
    if (!socket) return;

    const handleNewAlert = (alertData: any) => {
      console.log("New Alert Received:", alertData);

      // Convert Backend Data Format to Frontend UI Format
      const newAlert: Alert = {
        type: alertData.severity === 'HIGH' ? 'critical' : 'warning', // Map severity to CSS class
        msg: alertData.message,
        time: new Date(alertData.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Add new alert to the TOP of the list
      setCurrentAlerts((prev) => [newAlert, ...prev]);
    };

    // Listen to the specific event name emitted by fleetController.js
    socket.on('newAlert', handleNewAlert);

    // Cleanup listener on unmount
    return () => {
      if (socket) {
        socket.off('newAlert', handleNewAlert);
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