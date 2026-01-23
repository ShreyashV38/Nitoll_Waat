import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import RouteTabs from "../components/Routes/RoutesTabs";
import RouteInfoCard from "../components/Routes/RoutesInfoCard";
import { fleetAPI, driverAPI, wardAPI } from "../services/api"; 
import { useAuth } from "../context/AuthContext";
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
  const [autoLoading, setAutoLoading] = useState(false); // For new feature

  const { area } = useAuth();

  // 1. Fetch All Data (Routes, Drivers, Wards)
  useEffect(() => {
    loadData();
    // Auto-refresh live data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
        const [routeRes, driverRes, wardRes] = await Promise.all([
            fleetAPI.getActiveRoutes(),
            driverAPI.getAll(),
            wardAPI.getAll()
        ]);

        // Format Active Routes for the UI with Performance Tracking
        const formattedRoutes = routeRes.data.map((r: any, index: number) => ({
            id: index + 1,
            db_route_id: r.id,
            name: `Route ${index + 1}`,
            number: "Active", 
            driver: r.driver_name,
            license_plate: r.license_plate, // For performance card
            ward_name: r.ward_name,        // For performance card
            completed_stops: r.completed_stops || 0,
            total_stops: r.total_stops || 0,
            progress: r.total_stops > 0 ? (r.completed_stops / r.total_stops) * 100 : 0,
            status: r.status,
            bins: `${r.completed_stops || 0}/${r.total_stops || 0}`, 
            distance: r.distance || "..."
        }));
        
        setRoutes(formattedRoutes);
        setDrivers(driverRes.data);
        setWards(wardRes.data);

    } catch(err) {
        console.error("Fetch error", err);
    }
  };

  // 2. Handle Manual Dispatch (Assign Ward)
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

  // 3. NEW FEATURE: Auto-Dispatch Daily Operations
  const handleAutoDispatch = async () => {
    setAutoLoading(true);
    try {
        await fleetAPI.autoDispatch(); // Ensure this is added to your api.ts
        alert("Daily operations started! Drivers dispatched to assigned wards.");
        loadData();
    } catch (err: any) {
        alert(err.response?.data?.message || "Auto-dispatch failed");
    } finally {
        setAutoLoading(false);
    }
  };

  const selectedVehicle = routes.find(r => r.id === selectedRouteId);

  return (
    <div className="routes-page">
      <PageHeader 
        title={area ? `${area.area_name} Operations` : "Operations"}
        subtitle="Dispatch Drivers & Monitor Active Routes"
      />

      {/* --- NEW FEATURE: AUTO-DISPATCH ACTION --- */}
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
              {autoLoading ? "Starting Operations..." : "🚀 Start Daily Operations"}
          </button>
      </div>

      {/* --- DISPATCH BOARD --- */}
      <div className="assignment-card" style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '16px', 
          marginBottom: '30px', 
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
                 {loading ? "Dispatching..." : "Start Route 🚀"}
             </button>
         </div>
      </div>

      {/* --- NEW FEATURE: PERFORMANCE PROGRESS GRID --- */}
      <h3 style={{fontSize:'18px', color:'#334155', marginBottom:'15px'}}>Live Route Performance</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          {routes.map(route => (
              <div key={route.db_route_id} style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                      <div>
                          <h4 style={{ margin: 0, color: '#1e293b' }}>{route.driver}</h4>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>{route.license_plate} • {route.ward_name}</span>
                      </div>
                      <span style={{ fontSize: '10px', background: '#dcfce7', color: '#16a34a', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>LIVE</span>
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

      {/* --- ORIGINAL LIVE MONITORING SECTION --- */}
      <h3 style={{fontSize:'18px', color:'#334155', marginBottom:'15px'}}>Fleet Details</h3>
      
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
  );
};

export default RoutesPage;