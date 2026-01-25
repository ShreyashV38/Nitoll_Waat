import React from "react";
import "../../style/Dashboard.css";

// ✅ FIXED INTERFACE: Added 'driver' and 'ward'
export interface RouteData {
  id: string;
  name: string;
  status: string;
  progress: number;
  driver: string; // <--- Added
  ward: string;   // <--- Added
  vehicle?: string; // Optional: In case you use it later
}

interface RoutesWidgetProps {
  routes: RouteData[];
  latestActivity: string;
}

const RoutesWidget: React.FC<RoutesWidgetProps> = ({ routes, latestActivity }) => {
  return (
    <div className="dashboard-widget routes-widget">
      <div className="widget-header">
        <h3>Live Route Performance</h3>
        <span className="live-badge">● Live</span>
      </div>

      <div className="routes-list">
        {routes.length === 0 ? (
          <div className="empty-state">No active routes</div>
        ) : (
          routes.map((route) => (
            <div key={route.id} className="route-item" style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
              
              {/* Top Row: Name and Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{route.name}</span>
                <span className={`status-badge ${route.status.toLowerCase()}`} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>
                  {route.status}
                </span>
              </div>

              {/* Details Row (Driver & Ward) */}
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                {route.driver} • {route.ward}
              </div>

              {/* Progress Bar Section */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${route.progress}%`, 
                      height: '100%', 
                      background: '#22c55e', 
                      transition: 'width 0.5s ease' 
                    }} 
                  />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#16a34a' }}>
                  {route.progress}%
                </span>
              </div>

            </div>
          ))
        )}
      </div>

      <div className="activity-footer">
        <small>Latest: {latestActivity}</small>
      </div>
    </div>
  );
};

export default RoutesWidget;