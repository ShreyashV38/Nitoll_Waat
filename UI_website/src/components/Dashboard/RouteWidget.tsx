import React from "react";

interface RouteData {
  id: string;
  progress: number;
  status: string;
}

interface Props {
  routes: RouteData[];
}

const RoutesWidget: React.FC<Props> = ({ routes }) => {
  return (
    <div className="right-column">
      {/* Today's Routes */}
      <div className="dashboard-card routes-card">
        <h3>Today's Routes</h3>
        <div className="routes-list">
          {routes.map((route) => (
            <div key={route.id} className="route-item">
              <div className="route-info">
                <span>{route.id}</span>
                <span className={`status-badge ${route.status.replace(" ", "")}`}>
                  {route.status}
                </span>
              </div>
              <div className="progress-bg">
                <div 
                  className="progress-fill" 
                  style={{ width: `${route.progress}%`, background: route.progress === 100 ? '#4ade80' : '#fb923c' }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Feed Placeholder */}
      <div className="dashboard-card feed-card">
        <h3>Active Feed</h3>
        <div className="empty-feed">No new activity</div>
      </div>
    </div>
  );
};

export default RoutesWidget;