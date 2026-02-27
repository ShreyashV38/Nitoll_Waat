import React, { useState } from "react";
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

interface Props {
  alert: Alert;
  onResolve?: (dbId: string | number) => Promise<void>;
}

const MessageDetail: React.FC<Props> = ({ alert, onResolve }) => {
  const [resolving, setResolving] = useState(false);

  const handleResolve = async () => {
    if (!onResolve) return;
    setResolving(true);
    try {
      await onResolve(alert.dbId);
    } catch (err) {
      console.error("Failed to resolve complaint", err);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="alert-details">
      <span className={`badge ${alert.type.toLowerCase()}`}>
        {alert.source === 'COMPLAINT' ? 'COMPLAINT' : alert.type}
      </span>

      <h3>{alert.title}</h3>
      <p className="meta">
        Received: {alert.time} &nbsp; | &nbsp; {alert.source === 'COMPLAINT' ? 'Complaint' : 'Alert'} ID: #{alert.dbId}
        {alert.status && <span style={{ marginLeft: '10px', textTransform: 'capitalize', color: alert.status === 'resolved' || alert.status === 'RESOLVED' ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
          • Status: {alert.status}
        </span>}
      </p>

      <div className="message-box" style={{ whiteSpace: 'pre-wrap' }}>
        {alert.message}
      </div>

      {alert.source === 'COMPLAINT' && alert.status !== 'resolved' && alert.status !== 'RESOLVED' && (
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button
            className="resolve-btn"
            onClick={handleResolve}
            disabled={resolving}
            style={{
              background: resolving ? 'var(--text-faint)' : 'var(--accent-green)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: resolving ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              opacity: resolving ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {resolving ? 'Resolving...' : '✓ Mark as Resolved'}
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageDetail;