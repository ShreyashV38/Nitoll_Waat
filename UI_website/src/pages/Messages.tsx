import { useState } from "react";
import PageHeader from "../components/PageHeader";
import InboxList from "../components/Messages/InboxList";
import MessageDetail from "../components/Messages/MessageDetails";
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
    message: "Based on current fill rate, Bin B-12 (Market Complex) will reach capacity by 23:30 today. Immediate collection recommended.",
    time: "10 mins ago",
  },
  {
    id: 11,
    type: "WARNING",
    title: "Bin C-07 sensor offline",
    message: "Sensor has not reported data in the last 2 hours. Please check connectivity module.",
    time: "1 hr ago",
  },
  {
    id: 12,
    type: "INFO",
    title: "Daily routes generated",
    message: "All optimized routes have been generated successfully based on traffic patterns.",
    time: "5 hrs ago",
  },
];

const Messages = () => {
  const [selectedAlert, setSelectedAlert] = useState<Alert>(alertsData[0]);

  return (
    <div className="messages-page">
      <PageHeader 
        title="Panaji Municipal Council (Zone A)"
        subtitle="North Goa • System Notifications"
      />

      <div className="alerts-box">
        {/* Header / Filter Row */}
        <div className="alerts-header">
          <div>
            <h2>System Alerts</h2>
            <span>Inbox for operational exceptions.</span>
          </div>
          <select className="filter-select">
            <option>All Alerts</option>
            <option>Critical</option>
            <option>Warning</option>
          </select>
        </div>

        {/* Content Layout */}
        <div className="alerts-content">
          <InboxList 
            alerts={alertsData} 
            selectedId={selectedAlert.id} 
            onSelect={setSelectedAlert} 
          />
          
          <MessageDetail alert={selectedAlert} />
        </div>
      </div>
    </div>
  );
};

export default Messages;