import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import InboxList from "../components/Messages/InboxList";
import MessageDetail from "../components/Messages/MessageDetails";
import { alertAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../style/Messages.css";

const Messages = () => {
  const { area } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await alertAPI.getAll();
        const formatted = res.data.map((a: any) => ({
          id: a.id, // Use UUID or index
          type: a.severity === 'HIGH' ? "CRITICAL" : "INFO",
          title: a.severity === 'HIGH' ? "Critical Bin Alert" : "System Notification",
          message: a.message,
          time: new Date(a.created_at).toLocaleString(),
        }));
        setAlerts(formatted);
        if (formatted.length > 0) setSelectedAlert(formatted[0]);
      } catch (err) {
        console.error("Error loading alerts", err);
      }
    };
    fetchAlerts();
  }, []);

  return (
    <div className="messages-page">
      <PageHeader 
        title={area ? `${area.area_name}` : "Zone Messages"}
        subtitle="North Goa • System Notifications"
      />

      <div className="alerts-box">
        <div className="alerts-header">
          <div>
            <h2>System Alerts</h2>
            <span>Inbox for operational exceptions.</span>
          </div>
        </div>

        <div className="alerts-content">
          <InboxList 
            alerts={alerts} 
            selectedId={selectedAlert?.id} 
            onSelect={setSelectedAlert} 
          />
          
          {selectedAlert && <MessageDetail alert={selectedAlert} />}
        </div>
      </div>
    </div>
  );
};

export default Messages;