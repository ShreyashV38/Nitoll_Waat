import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ✅ Custom Icons Configuration
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const yellowIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// ✅ Helper to handle Map Clicks
const MapClickHandler = ({ onClick }: { onClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// ✅ NEW HELPER: Automatically Recenters Map when data changes
const RecenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    // Keeps the current zoom, but moves center to the new bin
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
};

// ✅ Interfaces matching Parent
interface Bin {
  id: string;
  lat: number;
  lng: number;
  level: number;
  status: string;
  lid: string;
  weight: number;
  last_updated: string; 
  prediction?: {
    predicted_overflow_at: string | null;
    hours_until_overflow: number | null;
    status: string;
  };
}

interface Zone {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface Props {
  bins: Bin[];
  zones: Zone[];
  onMapClick?: (lat: number, lng: number) => void;
}

const BinMap: React.FC<Props> = ({ bins, zones, onMapClick }) => {
  // Default to Panaji, Goa if absolutely no data exists
  const defaultLat = 15.4909;
  const defaultLng = 73.8278;

  // Prefer the first bin's location
  const centerLat = bins.length > 0 ? bins[0].lat : defaultLat;
  const centerLng = bins.length > 0 ? bins[0].lng : defaultLng;

  // Time Formatter
  const formatTime = (isoString: string) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleString([], {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <MapContainer 
        center={[centerLat, centerLng]} 
        zoom={13} 
        style={{ height: "100%", minHeight: "450px", width: "100%", borderRadius: '12px', aspectRatio: '1/1' }}
    >
      {/* ✅ Add this component to force the map to move */}
      <RecenterMap lat={centerLat} lng={centerLng} />

      {onMapClick && <MapClickHandler onClick={onMapClick} />}

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* DUMPING ZONES */}
      {zones.map((zone) => (
        <Marker 
            key={zone.id} 
            position={[zone.lat, zone.lng]}
            icon={new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
            })}
        >
            <Popup><strong>{zone.name}</strong><br/>Dumping Zone</Popup>
        </Marker>
      ))}

      {/* BINS */}
      {bins.map((bin) => {
        let icon = greenIcon;
        if (bin.level >= 50) icon = redIcon;
        else if (bin.level >= 45) icon = yellowIcon;

        return (
            <Marker key={bin.id} position={[bin.lat, bin.lng]} icon={icon}>
              <Popup>
                <div style={{ minWidth: '180px' }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>Bin #{bin.id.substring(0,6)}</h4>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
                        <span>Fill Level:</span>
                        <strong style={{ color: bin.level >= 50 ? '#ef4444' : '#22c55e' }}>
                            {bin.level}%
                        </strong>
                    </div>

                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                        Weight: <strong>{bin.weight} kg</strong><br/>
                        Status: {bin.status}
                    </div>

                    {bin.prediction && bin.prediction.predicted_overflow_at && (
                        <div style={{ 
                            marginTop: '8px', 
                            paddingTop: '8px', 
                            borderTop: '1px solid #e2e8f0', 
                            fontSize: '12px',
                            background: '#fffbeb',
                            padding: '8px',
                            borderRadius: '6px'
                        }}>
                            <div style={{ fontWeight: 'bold', color: '#f59e0b', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                ⚠️ Predicted Overflow
                            </div>
                            <div style={{ color: '#1e293b' }}>
                                {formatTime(bin.prediction.predicted_overflow_at)}
                            </div>
                        </div>
                    )}
                </div>
              </Popup>
            </Marker>
        );
      })}
    </MapContainer>
  );
};

export default BinMap;