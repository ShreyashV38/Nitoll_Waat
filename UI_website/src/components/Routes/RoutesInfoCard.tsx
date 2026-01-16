import React from "react";
import "../../style/RoutesPage.css";

interface Vehicle {
  id: number;
  name: string;
  number: string;
  driver: string;
  bins: number;
  distance: string;
}

const RouteInfoCard: React.FC<{ vehicle: Vehicle }> = ({ vehicle }) => {
  return (
    <div className="vehicle-card">
      <h2>{vehicle.name}</h2>

      <div className="vehicle-grid">
        <div className="info-group">
          <span>Vehicle Number</span>
          <strong>{vehicle.number}</strong>
        </div>

        <div className="info-group">
          <span>Assigned Driver</span>
          <strong>{vehicle.driver}</strong>
        </div>

        <div className="info-group">
          <span>Bins on Route</span>
          <strong>{vehicle.bins}</strong>
        </div>

        <div className="info-group">
          <span>Total Distance</span>
          <strong>{vehicle.distance}</strong>
        </div>
      </div>
    </div>
  );
};

export default RouteInfoCard;