import { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../style/Vehicles.css";

type Vehicle = {
  id: string;
  driver: string;
  status: "ACTIVE" | "INACTIVE";
};

const driverList = ["Ramesh", "Suresh", "Mahesh"];

const Vehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: "GA-07-T-1234", driver: "", status: "ACTIVE" },
    { id: "GA-07-T-5678", driver: "", status: "ACTIVE" },
    { id: "GA-07-T-9012", driver: "", status: "INACTIVE" },
  ]);

  const assignDriver = (index: number, driver: string) => {
    const updated = [...vehicles];
    updated[index].driver = driver;
    setVehicles(updated);
  };

  return (
    <div className="layout">
      <Sidebar />

      <main className="vehicles-page">
        <header className="page-header">
          <h2>Panaji Municipal Council (Zone A)</h2>
          <p>North Goa • 3 Vehicles Registered</p>
        </header>

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
                <span>{v.id}</span>

                <select
                  value={v.driver}
                  onChange={(e) => assignDriver(index, e.target.value)}
                >
                  <option value="">Assign Driver</option>
                  {driverList.map((d) => (
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
      </main>
    </div>
  );
};
export default Vehicles;
