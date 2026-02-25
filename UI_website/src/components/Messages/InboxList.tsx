import React from "react";
import "../../style/Messages.css";

interface Alert {
  id: string | number; // Updated to accept string (comp_UUID) or number
  type: "CRITICAL" | "WARNING" | "INFO";
  title: string;
  message: string;
  time: string;
}

interface Props {
  alerts: Alert[];
  selectedId: string | number; // Updated to match
  onSelect: (alert: Alert) => void;
}

const InboxList: React.FC<Props> = ({ alerts, selectedId, onSelect }) => {
  return (
    <div className="alerts-list">
      <h4>Inbox ({alerts.length})</h4>

      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`alert-item ${alert.type.toLowerCase()} ${selectedId === alert.id ? "active-msg" : ""
            }`}
          onClick={() => onSelect(alert)}
        >
          <span className={`badge ${alert.type.toLowerCase()}`}>
            {alert.type}
          </span>
          <p>{alert.title}</p>
          <span className="time">{alert.time}</span>
        </div>
      ))}
    </div>
  );
};

export default InboxList;