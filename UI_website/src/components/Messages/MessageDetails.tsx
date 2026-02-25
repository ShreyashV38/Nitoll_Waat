import React from "react";
import "../../style/Messages.css";

interface Alert {
  id: string | number;
  dbId: string | number;
  source: "ALERT" | "COMPLAINT";
  type: "CRITICAL" | "WARNING" | "INFO";
  title: string;
  message: string;
  time: string;
  status?: string;
}

const MessageDetail: React.FC<{ alert: Alert }> = ({ alert }) => {
  return (
    <div className="alert-details">
      <span className={`badge ${alert.type.toLowerCase()}`}>
        {alert.source === 'COMPLAINT' ? 'COMPLAINT' : alert.type}
      </span>

      <h3>{alert.title}</h3>
      <p className="meta">
        Received: {alert.time} &nbsp; | &nbsp; {alert.source === 'COMPLAINT' ? 'Complaint' : 'Alert'} ID: #{alert.dbId}
        {alert.status && <span style={{ marginLeft: '10px', textTransform: 'capitalize', color: alert.status === 'resolved' ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
          • Status: {alert.status}
        </span>}
      </p>

      <div className="message-box" style={{ whiteSpace: 'pre-wrap' }}>
        {alert.message}
      </div>

      {alert.source === 'COMPLAINT' && alert.status !== 'resolved' && (
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button className="resolve-btn" style={{
            background: 'var(--accent-green)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            Mark as Resolved
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageDetail;