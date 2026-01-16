import { useState } from "react";
import PageHeader from "../components/PageHeader";
import RouteTabs from "../components/Routes/RoutesTabs";
import RouteInfoCard from "../components/Routes/RoutesInfoCard";
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
  { id: 1, name: "Vehicle 1", number: "GA-07-T-1234", driver: "Ramesh Gupta", bins: 6, distance: "12.3 km" },
  { id: 2, name: "Vehicle 2", number: "GA-07-T-5678", driver: "Suresh Naik", bins: 4, distance: "9.8 km" },
  { id: 3, name: "Vehicle 3", number: "GA-07-T-9012", driver: "Mahesh Desai", bins: 7, distance: "14.1 km" },
];

const RoutesPage = () => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  return (
    <div className="routes-page">
      <PageHeader 
        title="Panaji Municipal Council (Zone A)"
        subtitle={`North Goa • ${vehicles.length} Vehicles Registered`} 
      />

      <RouteTabs 
        vehicles={vehicles} 
        selectedId={selectedVehicleId} 
        onSelect={setSelectedVehicleId} 
      />

      {selectedVehicle ? (
        <RouteInfoCard vehicle={selectedVehicle} />
      ) : (
        <div className="empty-state-card">
           <p>Select a vehicle to view route details.</p>
        </div>
      )}
    </div>
  );
};

export default RoutesPage;