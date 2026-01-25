import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import BinMap from "../components/MapsBins/BinMap";
import BinDirectory from "../components/MapsBins/BinDirectory";
import AddBinModal from "../components/MapsBins/AddBinModal";
import AddZoneModal from "../components/MapsBins/AddZoneModal";
import AddWardModal from "../components/MapsBins/AddwardModal"; 
import { binAPI, wardAPI, dumpingZoneAPI } from "../services/api";
import { socketService } from "../services/socket";
import { useAuth } from "../context/AuthContext";
import "../style/MapsBinsPage.css";

// Interface for Real IoT Data
export interface Bin {
  id: string;
  lat: number;
  lng: number;
  level: number;
  status: "NORMAL" | "WARNING" | "CRITICAL" | "BLOCKED"; 
  lid: string;
  weight: number;
  lastUpdated: string; 
  last_updated: string; 
  address: string;
  prediction?: {
    predicted_overflow_at: string | null;
    hours_until_overflow: number | null;
    status: string;
  };
}

// Interface for Dumping Zones
export interface Zone {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

const MapsBinsPage = () => {
  const [activeTab, setActiveTab] = useState<"map" | "directory">("map");
  
  // Modals state
  const [showBinModal, setShowBinModal] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showWardModal, setShowWardModal] = useState(false); 
  
  // ✅ FIX: Removed "WARD" from Add Mode (Wards don't need map clicks)
  const [addMode, setAddMode] = useState<"NONE" | "BIN" | "ZONE">("NONE");
  
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);
  const [bins, setBins] = useState<Bin[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const { area } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); 

    const socket = socketService.connect();
    socket.on("connect", () => {
      console.log("Socket Connected!");
      setIsConnected(true);
    });
    socket.on("disconnect", () => {
      console.log("Socket Disconnected");
      setIsConnected(false);
    });

    socketService.onBinUpdate((updatedBin: any) => {
      setBins((prevBins) => {
        return prevBins.map((bin) => {
          if (bin.id === updatedBin.id) {
            const now = new Date();
            return {
              ...bin,
              level: updatedBin.fill_percent,
              status: updatedBin.status,
              lid: updatedBin.lid_status,
              weight: parseFloat(updatedBin.weight) || 0,
              lastUpdated: now.toLocaleTimeString(),
              last_updated: now.toISOString() 
            };
          }
          return bin;
        });
      });
    });

    return () => {
      clearInterval(interval);
      socketService.disconnect();
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  const loadData = async () => {
    try {
      const [binRes, wardRes, zoneRes] = await Promise.all([
        binAPI.getAll(),
        wardAPI.getAll(),
        dumpingZoneAPI.getAll()
      ]);

      const formattedBins = binRes.data.map((b: any) => ({
        id: b.id,
        lat: parseFloat(b.latitude),
        lng: parseFloat(b.longitude),
        level: b.current_fill_percent,
        status: b.status,
        lid: b.lid_status || "CLOSED",
        weight: parseFloat(b.current_weight) || 0,
        lastUpdated: new Date(b.last_updated).toLocaleTimeString(),
        last_updated: b.last_updated,
        address: `Ward ${b.ward_id || 'Unknown'}`,
        prediction: b.prediction
      }));

      const formattedZones = zoneRes.data.map((z: any) => ({
        id: z.id,
        name: z.name,
        lat: parseFloat(z.latitude),
        lng: parseFloat(z.longitude)
      }));

      setBins(formattedBins);
      setWards(wardRes.data);
      setZones(formattedZones);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load data", err);
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    loadData();
  };

  // ✅ FIX: Map click only handles Bins and Zones (Items with locations)
  const handleMapClick = (lat: number, lng: number) => {
    if (addMode === "NONE") return;

    setSelectedLocation({ lat, lng });

    if (addMode === "BIN") {
      setShowBinModal(true);
    } else if (addMode === "ZONE") {
      setShowZoneModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowBinModal(false);
    setShowZoneModal(false);
    setShowWardModal(false); 
    setSelectedLocation(null);
  };

  return (
    <div className="maps-bins-page">
      <PageHeader title={area ? `${area.area_name}` : "Operations"} subtitle="Monitor Bins & Zones">
         <div style={{
             background: isConnected ? '#dcfce7' : '#fee2e2', 
             color: isConnected ? '#166534' : '#991b1b',
             padding: '6px 12px', borderRadius: '20px', 
             fontSize: '12px', fontWeight: 'bold', 
             display: 'flex', alignItems: 'center', gap: '6px'
         }}>
             <span style={{
                 width: '8px', height: '8px', 
                 background: isConnected ? '#22c55e' : '#ef4444', 
                 borderRadius: '50%'
             }}></span>
             {isConnected ? "LIVE SOCKET ACTIVE" : "SOCKET DISCONNECTED"}
         </div>
      </PageHeader>

      <div className="actions-bar">
        <div className="tabs">
          <button className={activeTab === "map" ? "active" : ""} onClick={() => setActiveTab("map")}>
            🗺️ Live Map
          </button>
          <button className={activeTab === "directory" ? "active" : ""} onClick={() => setActiveTab("directory")} >
            📂 Directory List
          </button>
        </div>

        <div className="buttons">
          <button className="refresh-btn" onClick={handleRefresh}>🔄 Refresh</button>
          
          {/* ✅ FIX: Ward Button now opens Modal DIRECTLY (No Map Click needed) */}
          <button 
            className="add-btn ward-btn" 
            onClick={() => setShowWardModal(true)}
            style={{
                backgroundColor: "#ec4899", 
                border: "none",
                color: 'white'
            }}
          >
             + Add Ward
          </button>

          <button 
            className={`add-btn zone-btn ${addMode === "ZONE" ? "active-mode" : ""}`} 
            onClick={() => setAddMode(addMode === "ZONE" ? "NONE" : "ZONE")}
            style={{
                backgroundColor: addMode === "ZONE" ? "#7e22ce" : "#9333ea", 
                border: addMode === "ZONE" ? "2px solid #000" : "none"
            }}
          >
             {addMode === "ZONE" ? "📍 Click Map to Set Zone" : "+ Add Zone"}
          </button>

          <button 
            className={`add-btn ${addMode === "BIN" ? "active-mode" : ""}`} 
            onClick={() => setAddMode(addMode === "BIN" ? "NONE" : "BIN")}
            style={{
                border: addMode === "BIN" ? "2px solid #000" : "none"
            }}
          >
             {addMode === "BIN" ? "📍 Click Map to Set Bin" : "+ Add Bin"}
          </button>
        </div>
      </div>

      {/* ✅ FIX: Updated Info Banner */}
      {addMode !== "NONE" && (
        <div style={{background: '#fff7ed', border: '1px solid #ffedd5', color: '#c2410c', padding: '10px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold'}}>
           Adding {addMode === "BIN" ? "Smart Bin" : "Dumping Zone"}: Click a location on the map to place it.
        </div>
      )}

      <div className="content-area">
        {loading ? (
            <p style={{padding: '20px', textAlign: 'center'}}>Loading IoT Data...</p>
        ) : (
            <>
                {activeTab === "map" ? (
                    <BinMap 
                        bins={bins} 
                        zones={zones} 
                        onMapClick={handleMapClick} 
                    />
                ) : (
                    <BinDirectory bins={bins} />
                )}
            </>
        )}
      </div>

      {showBinModal && (
        <AddBinModal 
            onClose={handleCloseModal} 
            refreshData={loadData} 
            wards={wards} 
            location={selectedLocation} 
        />
      )}
      
      {showZoneModal && (
        <AddZoneModal 
            onClose={handleCloseModal} 
            refreshData={loadData} 
            location={selectedLocation} 
        />
      )}

      {showWardModal && (
        <AddWardModal 
            onClose={handleCloseModal} 
            refreshData={loadData} 
            // Location is no longer needed/passed
        />
      )}
    </div>
  );
};

export default MapsBinsPage;