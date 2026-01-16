import { useState } from "react";
import PageHeader from "../components/PageHeader";
import VehicleFleet from "../components/Vehicles/VehicleFleet";
import "../style/Vehicles.css";

type Vehicle = {
  id: string;
  driver: string;
  status: "ACTIVE" | "INACTIVE";
};

const driverList = ["Ramesh", "Suresh", "Mahesh", "Rajesh", "Amit"];

const Vehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: "GA-07-T-1234", driver: "Ramesh", status: "ACTIVE" },
    { id: "GA-07-T-5678", driver: "", status: "ACTIVE" },
    { id: "GA-07-T-9012", driver: "", status: "INACTIVE" },
  ]);

  const assignDriver = (index: number, driver: string) => {
    const updated = [...vehicles];
    updated[index].driver = driver;
    setVehicles(updated);
  };

  return (
    <div className="vehicles-page">
      <PageHeader 
        title="Panaji Municipal Council (Zone A)"
        subtitle="North Goa • 3 Vehicles Registered"
      />

      <VehicleFleet 
        vehicles={vehicles} 
        drivers={driverList} 
        onAssign={assignDriver} 
      />
    </div>
  );
};
export default Vehicles;