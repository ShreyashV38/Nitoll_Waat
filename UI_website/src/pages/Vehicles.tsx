import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import VehicleFleet from "../components/Vehicles/VehicleFleet";
import { fleetAPI } from "../services/api"; // <--- Import API
import { useAuth } from "../context/AuthContext";
import "../style/Vehicles.css";

const Vehicles = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { area }=useAuth();

  // Fetch vehicles from DB
  useEffect(() => {
    const fetchFleet = async () => {
      try {
        const res = await fleetAPI.getVehicles();
        
        // Map DB data to UI
        const formatted = res.data.map((v: any) => ({
          id: v.license_plate, // Show Plate as ID
          db_id: v.id,
          driver: v.driver_name || "Unassigned", // Comes from the LEFT JOIN
          status: v.status
        }));
        
        setVehicles(formatted);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load fleet", err);
      }
    };
    fetchFleet();
  }, []);

  // Placeholder for assigning driver
  const assignDriver = (index: number, driver: string) => {
    const updated = [...vehicles];
    updated[index].driver = driver;
    setVehicles(updated);
    alert("Driver updated locally. (Backend endpoint required to save permanently)");
  };

  // Drivers list (Static for now, or fetch from users table)
  const driverList = ["Ramesh", "Suresh", "Mahesh", "Rajesh", "Amit"];

  return (
    <div className="vehicles-page">
      <PageHeader 
        title={area ? `${area.area_name}` : "Loading..."}
        subtitle={`${area?.district || 'Goa'} • Active Fleet`}
      />

      {loading ? (
        <p style={{padding:'20px'}}>Loading Fleet...</p>
      ) : (
        <VehicleFleet 
            vehicles={vehicles} 
            drivers={driverList} 
            onAssign={assignDriver} 
        />
      )}
    </div>
  );
};
export default Vehicles;