import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { Bin, Zone } from "../../pages/MapsBinsPage"; 

// ... (Keep your Icon definitions: greenIcon, redIcon, etc.) ...
const createIcon = (color: string) => {
    return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
};

const greenIcon = createIcon('green');   
const orangeIcon = createIcon('orange'); 
const redIcon = createIcon('red');       
const violetIcon = createIcon('violet'); 

// --- HELPER: Format Weight ---
const formatWeight = (grams: number) => {
    if (grams >= 1000) {
        return `${(grams / 1000).toFixed(2)} kg`;
    }
    return `${Math.round(grams)} g`;
};

interface Props {
  bins: Bin[];
  zones?: Zone[]; 
  onMapClick?: (lat: number, lng: number) => void;
}

const MapClickHandler: React.FC<{ onMapClick?: (lat: number, lng: number) => void }> = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

const BinMap: React.FC<Props> = ({ bins, zones = [], onMapClick }) => {
  return (
    <div className="map-container" style={{ height: "600px", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
      <MapContainer center={[15.4909, 73.8278]} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <MapClickHandler onMapClick={onMapClick} />

        {bins.map((bin) => {
            let iconToUse = greenIcon; 
            if (bin.status === "CRITICAL" || bin.level >= 90) iconToUse = redIcon;
            else if (bin.status === "WARNING" || bin.level >= 70) iconToUse = orangeIcon;

            return (
                <Marker key={bin.id} position={[bin.lat, bin.lng]} icon={iconToUse}>
                    <Popup>
                        <div style={{ minWidth: "200px" }}>
                            <h3 style={{ margin: "0 0 8px 0", color: "#334155" }}>Bin #{bin.id.substring(0, 6)}</h3>
                            
                            <div style={{ 
                                marginBottom: "10px", padding: "4px 8px", borderRadius: "4px", display: "inline-block",
                                fontSize: "12px", fontWeight: "bold",
                                backgroundColor: bin.status === "CRITICAL" ? "#fee2e2" : bin.status === "WARNING" ? "#ffedd5" : "#dcfce7",
                                color: bin.status === "CRITICAL" ? "#ef4444" : bin.status === "WARNING" ? "#f97316" : "#22c55e"
                            }}>
                                {bin.status}
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "13px" }}>
                                <div><strong style={{color: '#64748b'}}>Level:</strong> {bin.level}%</div>
                                
                                {/* DYNAMIC WEIGHT HERE */}
                                <div><strong style={{color: '#64748b'}}>Weight:</strong> {formatWeight(bin.weight)}</div>
                                
                                <div><strong style={{color: '#64748b'}}>Lid:</strong> {bin.lid}</div>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            );
        })}

        {zones.map((zone) => (
            <Marker key={zone.id} position={[zone.lat, zone.lng]} icon={violetIcon}>
                <Popup>
                    <div style={{ textAlign: "center", minWidth: "150px" }}>
                        <h3 style={{ margin: "0", color: "#7e22ce" }}>♻️ Dumping Zone</h3>
                        <p style={{ margin: "5px 0 0 0", fontWeight: "bold", fontSize: "14px" }}>{zone.name}</p>
                    </div>
                </Popup>
            </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default BinMap;