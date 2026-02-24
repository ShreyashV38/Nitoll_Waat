import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import RouteTabs from "../components/Routes/RoutesTabs";
import RouteInfoCard from "../components/Routes/RoutesInfoCard";
import { fleetAPI, driverAPI, wardAPI } from "../services/api"; 
import { useAuth } from "../context/AuthContext";
import { socketService } from "../services/socket"; // ✅ IMPORT SOCKET
import "../style/RoutesPage.css";

const RoutesPage = () => {
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  
  // Data State
  const [routes, setRoutes] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  
  // Form State
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false); 

  const { area } = useAuth();

  useEffect(() => {
    loadData();

    // ✅ NEW: Connect Socket for Real-Time Progress Updates
    const socket = socketService.connect();
    socket.on("route_update", () => {
        console.log("♻️ Route Progress Update Received");
        loadData();
    });

    const interval = setInterval(loadData, 30000); // Backup polling
    return () => {
        clearInterval(interval);
        socket.off("route_update");
    };
  }, []);

  const loadData = async () => {
    try {
        const [routeRes, driverRes, wardRes] = await Promise.all([
            fleetAPI.getActiveRoutes(),
            driverAPI.getAll(),
            wardAPI.getAll()
        ]);

        const formattedRoutes = routeRes.data.map((r: any, index: number) => {
            // ✅ SAFETY FIX: Parse DB strings to integers
            const completed = parseInt(r.completed_stops) || 0;
            const total = parseInt(r.total_stops) || 0;
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

            return {
                id: index + 1,
                db_route_id: r.id,
                name: `Route ${index + 1}`,
                number: "Active", 
                driver: r.driver_name,
                license_plate: r.license_plate,
                ward_name: r.ward_name,        
                completed_stops: completed,
                total_stops: total,
                progress: percentage, // ✅ Use safe calculated percentage
                status: r.status,
                bins: `${completed}/${total}`, 
                distance: r.distance || "..."
            };
        });
        
        setRoutes(formattedRoutes);
        setDrivers(driverRes.data);
        setWards(wardRes.data);

    } catch(err) {
        console.error("Fetch error", err);
    }
  };

  // ... (Keep handleDispatch, handleAutoDispatch, handleCancelRoute, return JSX exactly as they were) ...
  // (Assuming you have the rest of the file content, just copy-paste the functions below loadData)

  // 2. Handle Manual Dispatch
  const handleDispatch = async () => {
    if(!selectedDriver || !selectedWard) return alert("Please select a Driver and a Ward");
    
    setLoading(true);
    try {
        await fleetAPI.assignRoute({
            driver_id: selectedDriver,
            ward_id: selectedWard
        });
        
        alert("Driver Dispatched Successfully!");
        setSelectedDriver("");
        setSelectedWard("");
        loadData(); 

    } catch (err: any) {
        alert(err.response?.data?.message || "Failed to dispatch driver");
    } finally {
        setLoading(false);
    }
  };

  // 3. Handle Auto-Dispatch
  const handleAutoDispatch = async () => {
    setAutoLoading(true);
    try {
        await fleetAPI.autoDispatch(); 
        alert("Daily operations started! Drivers dispatched to assigned wards.");
        loadData();
    } catch (err: any) {
        alert(err.response?.data?.message || "Auto-dispatch failed");
    } finally {
        setAutoLoading(false);
    }
  };

  // 4. Handle Route Cancellation
  const handleCancelRoute = async (routeId: string) => {
    if (!window.confirm("Are you sure you want to remove this driver from their route?")) return;

    try {
        await fleetAPI.cancelRoute(routeId);
        alert("Route removed. Driver is now available.");
        loadData(); 
    } catch (err: any) {
        alert(err.response?.data?.message || "Failed to remove route");
    }
  };

  const selectedVehicle = routes.find(r => r.id === selectedRouteId);

  return (
    <div className="routes-page">
      <PageHeader 
        title={area ? `${area.area_name} Operations` : "Operations"}
        subtitle="Dispatch Drivers & Monitor Active Routes"
      />

      {/* Start Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
          <button 
            onClick={handleAutoDispatch}
            disabled={autoLoading}
            style={{
                background: '#2563eb',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 'bold',
                cursor: autoLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
            }}
          >
              {autoLoading ? "Starting Operations..." : "Start Daily Operations"}
          </button>
      </div>

      {/* Dispatch Card */}
      <div className="assignment-card" style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '16px', 
          marginBottom: '20px', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
      }}>
         <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
             <div>
                <h3 style={{margin:0, color:'#1e293b', fontSize:'18px'}}>Manual Dispatch</h3>
                <p style={{margin:'4px 0 0 0', color:'#64748b', fontSize:'13px'}}>Assign a driver to a specific ward manually.</p>
             </div>
             <div style={{background:'#eff6ff', color:'#2563eb', padding:'6px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'600'}}>
                 {drivers.length} Drivers Available
             </div>
         </div>
         
         <div style={{display:'flex', gap:'20px', alignItems:'end'}}>
             <div style={{flex:1}}>
                 <label style={{display:'block', fontSize:'12px', fontWeight:'bold', textTransform:'uppercase', color:'#64748b', marginBottom:'8px'}}>Select Driver</label>
                 <select 
                    style={{width:'100%', padding:'12px', borderRadius:'8px', border:'1px solid #cbd5e1', fontSize:'14px', background:'#f8fafc'}}
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                 >
                     <option value="">Choose a Driver...</option>
                     {drivers.map(d => (
                         <option key={d.id} value={d.id}>
                            {d.name} {d.status === 'BUSY' ? '🔴 (Busy)' : '🟢 (Ready)'}
                         </option>
                     ))}
                 </select>
             </div>

             <div style={{flex:1}}>
                 <label style={{display:'block', fontSize:'12px', fontWeight:'bold', textTransform:'uppercase', color:'#64748b', marginBottom:'8px'}}>Target Ward</label>
                 <select 
                    style={{width:'100%', padding:'12px', borderRadius:'8px', border:'1px solid #cbd5e1', fontSize:'14px', background:'#f8fafc'}}
                    value={selectedWard}
                    onChange={(e) => setSelectedWard(e.target.value)}
                 >
                     <option value="">Choose Ward...</option>
                     {wards.map(w => (
                         <option key={w.id} value={w.id}>{w.name}</option>
                     ))}
                 </select>
             </div>

             <button 
                onClick={handleDispatch}
                disabled={loading}
                style={{
                    height:'45px',
                    background: loading ? '#94a3b8' : '#10b981', 
                    color: 'white', border:'none', 
                    padding: '0 30px', borderRadius: '8px', 
                    cursor: loading ? 'not-allowed' : 'pointer', 
                    fontWeight: 'bold', fontSize: '14px',
                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                    transition: 'all 0.2s'
                }}
             >
                 {loading ? "Dispatching..." : "Start Route"}
             </button>
         </div>
      </div>

      <h3 style={{fontSize:'18px', color:'#334155', marginBottom:'15px'}}>Live Route Performance</h3>
      
      {/* ✅ FIX: Reduced Height & Added Auto Scroll */}
      <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '20px', 
          marginBottom: '30px',
          maxHeight: '40vh',   // ✅ Uses 40% of viewport height (Approx 300-400px)
          overflowY: 'auto',   // ✅ Enables scrolling inside this section
          padding: '4px',
          paddingRight: '8px'
      }}>
          {routes.map(route => (
              <div key={route.db_route_id} style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', height: 'fit-content', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                      <div>
                          <h4 style={{ margin: 0, color: '#1e293b' }}>{route.driver}</h4>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>{route.license_plate} • {route.ward_name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', background: '#dcfce7', color: '#16a34a', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>LIVE</span>
                        <button 
                            onClick={() => handleCancelRoute(route.db_route_id)}
                            style={{ 
                                background: '#fee2e2', 
                                color: '#ef4444', 
                                border: 'none', 
                                borderRadius: '4px', 
                                cursor: 'pointer', 
                                fontSize: '10px', 
                                padding: '4px 8px',
                                fontWeight: 'bold'
                            }}
                        >
                            REMOVE
                        </button>
                      </div>
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                          <span>Bins Collected</span>
                          <strong>{route.bins}</strong>
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${route.progress}%`, height: '100%', background: '#22c55e', transition: 'width 0.5s ease' }} />
                      </div>
                  </div>
              </div>
          ))}
      </div>

      <h3 style={{fontSize:'18px', color:'#334155', marginBottom:'15px'}}>Fleet Details</h3>
      
      {/* Fleet Details Section */}
      <div style={{ paddingBottom: '40px' }}> {/* ✅ Added padding bottom so it doesn't touch edge */}
        {routes.length === 0 ? (
            <div className="empty-state-card" style={{padding:'40px', background:'white', borderRadius:'12px', textAlign:'center', color:'#94a3b8', border:'2px dashed #e2e8f0'}}>
                <p style={{fontSize:'16px'}}>No active routes. Start operations to see fleet details.</p>
            </div>
        ) : (
            <>
                <RouteTabs vehicles={routes} selectedId={selectedRouteId} onSelect={setSelectedRouteId} />
                {selectedVehicle && <RouteInfoCard vehicle={selectedVehicle} />}
            </>
        )}
      </div>
    </div>
  );
};

export default RoutesPage;