// src/components/Dashboard/RouteWidget.tsx
import React from "react";

// ✅ 1. Update Interface to include 'name'
interface RouteData {
  id: string;
  name?: string; // Add this optional property
  progress: number;
  status: string;
}

interface Props {
  routes: RouteData[];
  latestActivity: string; 
}

const RoutesWidget: React.FC<Props> = ({ routes, latestActivity }) => { 
  // ✅ Helper to fix class names (IN_PROGRESS -> inprogress)
  const getStatusClass = (status: string) => {
    return status.replace(/_/g, "").toLowerCase(); // Removes underscores, not just spaces
  };

  return (
    <div className="right-column">
      {/* Today's Routes */}
      <div className="dashboard-card routes-card">
        <h3>Today's Routes</h3>
        <div className="routes-list">
          {routes.length === 0 ? (
            <div className="empty-feed">No active routes</div>
          ) : (
            routes.map((route) => (
              <div key={route.id} className="route-item">
                <div className="route-info">
                  {/* ✅ 2. Display friendly 'name' OR fallback to ID */}
                  <span style={{fontWeight: '600', color: '#334155'}}>
                    {route.name || `Route #${route.id.substring(0,4)}`}
                  </span>
                  
                  {/* ✅ 3. Apply fixed status class */}
                  <span className={`status-badge ${getStatusClass(route.status)}`}>
                    {route.status.replace(/_/g, " ")}
                  </span>
                </div>
                
                <div className="progress-bg">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${route.progress}%`, 
                      background: route.progress === 100 ? '#22c55e' : '#f59e0b', // Green if done, Orange if active
                      transition: 'width 0.5s ease-in-out' 
                    }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Active Feed */}
      <div className="dashboard-card feed-card">
        <h3>Active Feed</h3>
        <div 
          className="empty-feed" 
          style={{ 
            color: latestActivity === "No new activity" ? "#cbd5e1" : "#1e293b",
            fontSize: "13px",
            fontWeight: latestActivity === "No new activity" ? "400" : "500",
            padding: "10px 0"
          }}
        >
          {latestActivity}
        </div>
      </div>
    </div>
  );
};

export default RoutesWidget;