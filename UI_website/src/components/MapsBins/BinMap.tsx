import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// Note: We use ../../ to go up two levels from components/MapsBins/ to style/
import "../../style/MapsBinsPage.css"; 

// Helper to create custom colored markers
const createBinIcon = (level: number, status: string, isSelected: boolean) => {
  let colorClass = 'low';
  if (status === 'Offline') colorClass = 'offline';
  else if (level > 80) colorClass = 'high';
  else if (level > 50) colorClass = 'mid';

  const wrapperClass = isSelected ? "custom-map-marker selected-marker" : "custom-map-marker";

  return L.divIcon({
    className: wrapperClass,
    html: `<div class="bin-circle ${colorClass}" style="width:30px; height:30px; font-size:12px; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
             <span style="display:none">${level}</span>
           </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 16);
  }, [center, map]);
  return null;
};

interface Bin {
  id: string;
  lat: number;
  lng: number;
  level: number;
  status: string;
}

interface Props {
  bins: Bin[];
  selectedId: string;
  onSelect: (id: string) => void;
  title?: string;
}

const BinMap: React.FC<Props> = ({ bins, selectedId, onSelect, title }) => {
  const defaultCenter: [number, number] = [15.4585, 73.8340];
  
  const selectedBin = bins.find(b => b.id === selectedId);
  const mapCenter = selectedBin ? [selectedBin.lat, selectedBin.lng] as [number, number] : defaultCenter;

  return (
    <div className="mb-card map-card" style={{ 
      padding: "0", 
      overflow: "hidden", 
      borderRadius: "16px", 
      marginBottom: "20px",
      display: "flex",
      flexDirection: "column",
      background: "white" // Ensure background is white
    }}>
      
      {/* Optional Title Header */}
      {title && (
        <div style={{ padding: "20px 24px 10px 24px", borderBottom: "1px solid #f0f0f0" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>{title}</h3>
        </div>
      )}

      {/* MAP CONTAINER - FIXED HEIGHT IS CRITICAL HERE */}
      <div style={{ height: "500px", width: "100%", position: "relative" }}>
        <MapContainer 
          center={defaultCenter} 
          zoom={15} 
          style={{ height: "100%", width: "100%", zIndex: 0 }} // zIndex fixes layering issues
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapUpdater center={mapCenter} />

          {bins.map((bin) => (
            <Marker 
              key={bin.id} 
              position={[bin.lat, bin.lng]} 
              icon={createBinIcon(bin.level, bin.status, bin.id === selectedId)}
              eventHandlers={{
                click: () => onSelect(bin.id),
              }}
            >
              <Popup>
                <strong>Bin {bin.id}</strong><br />
                Status: {bin.status}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default BinMap;