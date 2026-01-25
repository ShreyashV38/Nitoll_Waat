import React from "react";

interface RouteData {
  id: string;
  progress: number;
  status: string;
}

interface Props {
  routes: RouteData[];
  latestActivity: string; //
}

const RoutesWidget: React.FC<Props> = ({ routes, latestActivity }) => { //
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
                  <span>{route.id}</span>
                  <span className={`status-badge ${route.status.replace(/\s/g, "").toLowerCase()}`}>
                    {route.status}
                  </span>
                </div>
                <div className="progress-bg">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${route.progress}%`, 
                      background: route.progress === 100 ? '#4ade80' : '#fb923c',
                      transition: 'width 0.5s ease-in-out' 
                    }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Active Feed - Now Dynamic */}
      <div className="dashboard-card feed-card">
        <h3>Active Feed</h3>
        <div 
          className="empty-feed" 
          style={{ 
            color: latestActivity === "No new activity" ? "#cbd5e1" : "#1e293b",
            fontSize: "13px",
            fontWeight: latestActivity === "No new activity" ? "400" : "500"
          }}
        >
          {latestActivity} {/* */}
        </div>
      </div>
    </div>
  );
};

export default RoutesWidget;