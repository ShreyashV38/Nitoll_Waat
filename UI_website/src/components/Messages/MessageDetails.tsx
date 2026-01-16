import React from "react";
import "../../style/Messages.css";

interface Alert {
  id: number;
  type: "CRITICAL" | "WARNING" | "INFO";
  title: string;
  message: string;
  time: string;
}

const MessageDetail: React.FC<{ alert: Alert }> = ({ alert }) => {
  return (
    <div className="alert-details">
      <span className={`badge ${alert.type.toLowerCase()}`}>
        {alert.type}
      </span>

      <h3>{alert.title}</h3>
      <p className="meta">
        Received: {alert.time} &nbsp; | &nbsp; ID:#{alert.id}
      </p>

      <div className="message-box">
        {alert.message}
      </div>
    </div>
  );
};

export default MessageDetail;