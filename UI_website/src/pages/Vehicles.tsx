import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import VehicleFleet from "../components/Vehicles/VehicleFleet";
import { fleetAPI, driverAPI } from "../services/api"; // Added driverAPI
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
      
      // Map DB data to UI
      const formattedVehicles = fleetRes.data.map((v: any) => ({
        id: v.id, // Database ID
        license_plate: v.license_plate,
        type: v.type || "Truck", // Default if missing
        capacity: v.capacity || "N/A",
        driver_id: v.driver_id || "", // For the dropdown value
        driver_name: v.driver_name || "Unassigned", // For display
        status: v.status
      }));
      
      setVehicles(formattedVehicles);
      setDrivers(driverRes.data); // Store available drivers
      setLoading(false);

    } catch (err) {
      console.error("Failed to load fleet data", err);
      setLoading(false);
    }
  };

  // Handle Driver Assignment
  const handleAssignDriver = async (vehicleId: string, driverId: string) => {
    // Optimistic Update (Update UI immediately)
    const updatedVehicles = vehicles.map(v => 
        v.id === vehicleId ? { ...v, driver_id: driverId } : v
    );
    setVehicles(updatedVehicles);

    try {
        // ✅ CORRECTED: Use the new assignVehicle API method
        await fleetAPI.assignVehicle({ 
            driver_id: driverId, 
            vehicle_id: vehicleId 
        }); 
        alert("Driver assigned successfully!");
        loadData(); // Refresh to get official state
    } catch (err) {
        alert("Failed to save driver assignment.");
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