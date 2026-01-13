import { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../style/RoutesPage.css";

type Vehicle = {
  id: number;
  name: string;
  number: string;
  driver: string;
  bins: number;
  distance: string;
};

const vehicles: Vehicle[] = [
  {
    id: 1,
    name: "Vehicle 1",
    number: "GA-07-T-1234",
    driver: "abc",
    bins: 6,
    distance: "12.3 km",
  },
  {
    id: 2,
    name: "Vehicle 2",
    number: "GA-07-T-5678",
    driver: "xyz",
    bins: 4,
    distance: "9.8 km",
  },
  {
    id: 3,
    name: "Vehicle 3",
    number: "GA-07-T-9012",
    driver: "pqr",
    bins: 7,
    distance: "14.1 km",
  },
];

const Routes = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  return (
    <div className="layout">
      <Sidebar />

      <main className="routes-page">
        {/* Header */}
        <div className="page-header">
          <h1>Panaji Municipal Council (Zone A)</h1>
          <p>North Goa • {vehicles.length} Vehicles Registered</p>
        </div>

        {/* Vehicle Tabs */}
        <div className="vehicle-tabs">
          <button
            className={`tab ${selectedVehicle === null ? "active" : ""}`}
            onClick={() => setSelectedVehicle(null)}
          >
            All routes
          </button>

          {vehicles.map((v) => (
            <button
              key={v.id}
              className={`tab ${
                selectedVehicle?.id === v.id ? "active" : ""
              }`}
              onClick={() => setSelectedVehicle(v)}
            >
              {v.name}
            </button>
          ))}
        </div>

        {/* Vehicle Details */}
        {selectedVehicle && (
          <div className="vehicle-card">
            <h2>{selectedVehicle.name}</h2>

            <div className="vehicle-grid">
              <div>
                <span>Number</span>
                <strong>{selectedVehicle.number}</strong>
              </div>

              <div>
                <span>Driver</span>
                <strong>{selectedVehicle.driver}</strong>
              </div>

              <div>
                <span>Bins</span>
                <strong>{selectedVehicle.bins}</strong>
              </div>

              <div>
                <span>Distance</span>
                <strong>{selectedVehicle.distance}</strong>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Routes;
