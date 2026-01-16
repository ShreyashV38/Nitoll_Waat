import React from "react";
import "../../style/Vehicles.css";

interface Vehicle {
  id: string;
  driver: string;
  status: "ACTIVE" | "INACTIVE";
}

interface Props {
  vehicles: Vehicle[];
  drivers: string[];
  onAssign: (index: number, driver: string) => void;
}

const VehicleFleet: React.FC<Props> = ({ vehicles, drivers, onAssign }) => {
  return (
    <section className="fleet-card">
      <h3>Fleet Management</h3>
      <p className="subtext">Registered Vehicles</p>

      <div className="table">
        <div className="table-head">
          <span>VEHICLE ID</span>
          <span>ASSIGNED DRIVER</span>
          <span>STATUS</span>
        </div>

        {vehicles.map((v, index) => (
          <div className="table-row" key={v.id}>
            <span className="v-id">{v.id}</span>

            <select
              value={v.driver}
              onChange={(e) => onAssign(index, e.target.value)}
              className="driver-select"
            >
              <option value="">Assign Driver</option>
              {drivers.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <span className={`status ${v.status.toLowerCase()}`}>
              {v.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default VehicleFleet;