import { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../style/Messages.css";

type AlertType = "CRITICAL" | "WARNING" | "INFO";

interface Alert {
  id: number;
  type: AlertType;
  title: string;
  message: string;
  time: string;
}

const alertsData: Alert[] = [
  {
    id: 10,
    type: "CRITICAL",
    title: "BIN B-12 predicted to overflow",
    message:
      "Based on current fill rate, Bin B-12 (Market Complex) will reach capacity by 23:30 today. Immediate collection recommended.",
    time: "Time",
  },
  {
    id: 11,
    type: "WARNING",
    title: "Bin C-07 sensor offline",
    message: "Sensor has not reported data in the last 2 hours.",
    time: "Time",
  },
  {
    id: 12,
    type: "INFO",
    title: "Daily routes generated",
    message: "All optimized routes have been generated successfully.",
    time: "Time",
  },
];

const Messages = () => {
  const [selectedAlert, setSelectedAlert] = useState<Alert>(alertsData[0]);

  return (
    <div className="layout">
      <Sidebar />

      <main className="messages-page">
        {/* Header */}
        <div className="page-header">
          <h1>Panaji Municipal Council (Zone A)</h1>
          <p>North Goa • 3 Vehicles Registered</p>
        </div>

        {/* System Alerts */}
        <div className="alerts-box">
          <div className="alerts-header">
            <div>
              <h2>System Alerts</h2>
              <span>Inbox for operational exceptions and system notifications.</span>
            </div>

            <select>
              <option>Filter</option>
              <option>Critical</option>
              <option>Warning</option>
              <option>Info</option>
            </select>
          </div>

          <div className="alerts-content">
            {/* Inbox */}
            <div className="alerts-list">
              <h4>Inbox ({alertsData.length})</h4>

              {alertsData.map((alert) => (
                <div
                  key={alert.id}
                  className={`alert-item ${alert.type.toLowerCase()}`}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <span className={`badge ${alert.type.toLowerCase()}`}>
                    {alert.type}
                  </span>
                  <p>{alert.title}</p>
                  <span className="time">{alert.time}</span>
                </div>
              ))}
            </div>

            {/* Details */}
            <div className="alert-details">
              <span className={`badge ${selectedAlert.type.toLowerCase()}`}>
                {selectedAlert.type}
              </span>

              <h3>{selectedAlert.title}</h3>
              <p className="meta">
                Received: {selectedAlert.time} &nbsp; | &nbsp; ID:#{selectedAlert.id}
              </p>

              <div className="message-box">
                {selectedAlert.message}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
