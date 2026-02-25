import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import InboxList from "../components/Messages/InboxList";
import MessageDetail from "../components/Messages/MessageDetails";
import { alertAPI, complaintAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../style/Messages.css";

const Messages = () => {
  const { area } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [filter, setFilter] = useState<"ALL" | "ALERTS" | "COMPLAINTS">("ALL");

  useEffect(() => {
    const fetchAllMessages = async () => {
      try {
        // Fetch both concurrently
        const [alertsRes, complaintsRes] = await Promise.all([
          alertAPI.getAll(),
          complaintAPI.getAll()
        ]);

        // Map Alerts
        const formattedAlerts = alertsRes.data.map((a: any) => ({
          id: a.id,
          dbId: a.id, // Keep original DB ID for reference
          source: "ALERT",
          type: a.severity === 'HIGH' ? "CRITICAL" : "INFO",
          title: a.severity === 'HIGH' ? "Critical Bin Alert" : "System Notification",
          message: a.message,
          timestamp: new Date(a.created_at).getTime(),
          time: new Date(a.created_at).toLocaleString(),
        }));

        // Map Complaints
        const formattedComplaints = complaintsRes.data.map((c: any) => ({
          id: `comp_${c.id}`, // Guarantee unique ID across both arrays
          dbId: c.id,
          source: "COMPLAINT",
          type: "WARNING", // Using WARNING styling for complaints
          title: `Citizen Complaint: ${c.type}`,
          message: `Bin ${c.bin_id ? c.bin_id.substring(0, 8) : 'Unknown'} - ${c.description || 'No description provided.'}\nReporter: ${c.reporter_name || 'Anonymous'}${c.reporter_contact ? ` (${c.reporter_contact})` : ''}`,
          timestamp: new Date(c.created_at).getTime(),
          time: new Date(c.created_at).toLocaleString(),
          status: c.status
        }));

        // Merge and sort newest first
        const merged = [...formattedAlerts, ...formattedComplaints].sort(
          (a, b) => b.timestamp - a.timestamp
        );

        setMessages(merged);
        if (merged.length > 0) setSelectedMessage(merged[0]);

      } catch (err) {
        console.error("Error loading messages", err);
      }
    };
    fetchAllMessages();
  }, []);

  // Filter logic
  const filteredMessages = messages.filter(msg => {
    if (filter === "ALERTS") return msg.source === "ALERT";
    if (filter === "COMPLAINTS") return msg.source === "COMPLAINT";
    return true;
  });

  // Auto-select first item when filter changes if nothing is selected or standard behavior
  useEffect(() => {
    if (filteredMessages.length > 0 && !filteredMessages.find(m => m.id === selectedMessage?.id)) {
      setSelectedMessage(filteredMessages[0]);
    } else if (filteredMessages.length === 0) {
      setSelectedMessage(null);
    }
  }, [filter, filteredMessages.length]);


  return (
    <div className="messages-page">
      <PageHeader
        title={area ? `${area.area_name}` : "Zone Messages"}
        subtitle="North Goa • Inbox & Notifications"
      />

      <div className="alerts-box">
        <div className="alerts-header">
          <div>
            <h2>Inbox</h2>
            <span>System alerts and citizen feedback.</span>
          </div>
          <div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="ALL">All Messages</option>
              <option value="ALERTS">System Alerts Only</option>
              <option value="COMPLAINTS">Citizen Complaints Only</option>
            </select>
          </div>
        </div>

        <div className="alerts-content">
          <InboxList
            alerts={filteredMessages}
            selectedId={selectedMessage?.id}
            onSelect={setSelectedMessage}
          />

          {selectedMessage ? (
            <MessageDetail alert={selectedMessage} />
          ) : (
            <div className="alert-details" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>No messages found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;