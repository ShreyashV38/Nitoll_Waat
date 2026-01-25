import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import VehicleFleet from "../components/Vehicles/VehicleFleet";
import { fleetAPI, driverAPI } from "../services/api"; 
import { useAuth } from "../context/AuthContext";
import "../style/Vehicles.css";

const Vehicles = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { area } = useAuth();

  // Fetch Fleet & Drivers
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [fleetRes, driverRes] = await Promise.all([
        fleetAPI.getVehicles(),
        driverAPI.getAll()
      ]);
      
      const formattedVehicles = fleetRes.data.map((v: any) => ({
        id: v.id, 
        license_plate: v.license_plate,
        type: v.type || "Truck", 
        capacity: v.capacity || "N/A",
        driver_id: v.driver_id || "", 
        driver_name: v.driver_name || "Unassigned", 
        status: v.status
      }));
      
      setVehicles(formattedVehicles);
      setDrivers(driverRes.data); 
      setLoading(false);

    } catch (err) {
      console.error("Failed to load fleet data", err);
      setLoading(false);
    }
  };

  // Handle Driver Assignment (and Unassignment)
  const handleAssignDriver = async (vehicleId: string, driverId: string) => {
    // Optimistic Update
    const updatedVehicles = vehicles.map(v => 
        v.id === vehicleId ? { 
            ...v, 
            driver_id: driverId,
            // If driverId is empty, name is "Unassigned", otherwise find the name
            driver_name: driverId ? drivers.find(d => d.id === driverId)?.name || "Assigned" : "Unassigned"
        } : v
    );
    setVehicles(updatedVehicles);

    try {
        await fleetAPI.assignVehicle({ 
            driver_id: driverId, 
            vehicle_id: vehicleId 
        }); 
        
        // Success message varies based on action
        if (driverId) {
            alert("Driver assigned successfully!");
        } else {
            console.log("Driver removed successfully");
        }
        
        // Optional: reload to sync fully
        // loadData(); 
    } catch (err) {
        alert("Failed to update driver assignment.");
        loadData(); // Revert on error
    }
  };

  return (
    <div className="vehicles-page">
      <PageHeader 
        title={area ? `${area.area_name} Fleet` : "Fleet Operations"}
        subtitle="Manage Vehicles & Driver Assignments"
      />

      {loading ? (
        <div style={{padding:'40px', textAlign:'center', color:'#64748b'}}>
            Loading Fleet Data...
        </div>
      ) : (
        <VehicleFleet 
            vehicles={vehicles} 
            drivers={drivers} 
            onAssign={handleAssignDriver} 
        />
      )}
    </div>
  );
};

export default Vehicles;