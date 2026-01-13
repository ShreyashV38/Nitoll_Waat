import React from 'react';
import '../style/TodaysRoutes.css';

interface RouteData {
  id: string;
  status: 'in progress' | 'completed';
  completed: number;
  total: number;
  progress: number;
}

interface TodaysRoutesProps {
  routes: RouteData[];
}

const TodaysRoutes: React.FC<TodaysRoutesProps> = ({ routes }) => {
  return (
    <div className="card routes-card">
      <h3 className="card-title">Today's Routes</h3>

      <div className="routes-list">
        {routes.map((route) => (
          <div key={route.id} className="route-item">
            <div className="route-header">
              <span className="route-id">{route.id}</span>
              <span className={`route-status status-${route.status.replace(' ', '-')}`}>
                {route.status}
              </span>
            </div>
            <div className={`progress-bar progress-${route.status === 'completed' ? 'completed' : 'progress'}`}>
              <div className="progress-fill" style={{ width: `${route.progress}%` }}></div>
            </div>
            <div className="route-progress">
              {route.completed}/{route.total}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodaysRoutes;