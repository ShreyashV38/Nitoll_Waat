import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import RouteTabs from "../components/Routes/RoutesTabs";
import RouteInfoCard from "../components/Routes/RoutesInfoCard";
import { fleetAPI } from "../services/api"; // <--- Import API
import { useAuth } from "../context/AuthContext";
import "../style/RoutesPage.css";

const RoutesPage = () => {
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  
  const { area }=useAuth();
  // Fetch Active Routes
  useEffect(() => {
    const fetchRoutes = async () => {
        try {
            const res = await fleetAPI.getActiveRoutes();
            // Map DB Data
            const formatted = res.data.map((r: any, index: number) => ({
                id: index + 1, // Simple ID for tabs
                db_route_id: r.id,
                name: `Route ${index + 1}`,
                number: "GA-07-TEMP", // You can update query to fetch vehicle plate
                driver: r.driver_name,
                bins: 12, // Placeholder until we count route_stops in SQL
                distance: "Calculating..."
            }));
            setRoutes(formatted);
        } catch(err) {
            console.error("Route fetch error", err);
        }
    }
    fetchRoutes();
  }, []);

  const selectedVehicle = routes.find(r => r.id === selectedRouteId);

  return (
    <div className="routes-page">
      <PageHeader 
        title={area ? `${area.area_name}` : "Loading..."}
        subtitle={`${area?.district || 'Goa'} • Active Routes`}
      />

      {routes.length === 0 ? (
         <div className="empty-state-card" style={{padding:'20px', background:'white', borderRadius:'12px'}}>
            <p>No active routes found in database.</p>
         </div>
      ) : (
        <>
            <RouteTabs 
                vehicles={routes} 
                selectedId={selectedRouteId} 
                onSelect={setSelectedRouteId} 
            />

            {selectedVehicle ? (
                <RouteInfoCard vehicle={selectedVehicle} />
            ) : (
                <div className="empty-state-card" style={{marginTop:'20px'}}>
                <p>Select a route above to view details.</p>
                </div>
            )}
        </>
      )}
    </div>
  );
};

export default RoutesPage;