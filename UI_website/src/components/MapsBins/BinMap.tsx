import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Tooltip, Polyline, useMapEvents, useMap } from 'react-leaflet';
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

// --- ICONS CONFIGURATION ---
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

// ✅ ADDED: Orange Icon for Predictions
const orangeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// --- HELPERS ---
const MapClickHandler = ({ onClick }: { onClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) { onClick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
};

const RecenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
};

// --- INTERFACES ---
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

interface BoundaryData {
  coordinates: [number, number][];
  color: string;
  fillColor: string;
  name: string;
}

interface Props {
  bins: Bin[];
  zones: Zone[];
  onMapClick?: (lat: number, lng: number) => void;
  boundary?: BoundaryData;
  activeRoutes?: any[]; // For Hackathon Rendering
}

const ROUTE_COLORS = ['#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6', '#10b981'];

const BinMap: React.FC<Props> = ({ bins, zones, onMapClick, boundary, activeRoutes = [] }) => {
  const defaultLat = 15.4909;
  const defaultLng = 73.8278;
  const centerLat = bins.length > 0 ? bins[0].lat : defaultLat;
  const centerLng = bins.length > 0 ? bins[0].lng : defaultLng;

  const formatTime = (isoString: string) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleString([], {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // Pre-calculate skipped bins for ghosting effect
  const skippedBinIds = new Set<string>();
  activeRoutes.forEach(r => {
    if (r.skipped_bins) {
      r.skipped_bins.forEach((b: any) => skippedBinIds.add(b.id));
    }
  });

  return (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <RecenterMap lat={centerLat} lng={centerLng} />
      {onMapClick && <MapClickHandler onClick={onMapClick} />}
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* AREA BOUNDARY POLYGON */}
      {boundary && (
        <Polygon
          positions={boundary.coordinates}
          pathOptions={{
            color: boundary.color,
            fillColor: boundary.fillColor,
            fillOpacity: 0.12,
            weight: 2.5,
            dashArray: '8, 4'
          }}
        >
          <Tooltip sticky>{boundary.name} Taluka</Tooltip>
        </Polygon>
      )}

      {/* RENDER ROUTES (Hackathon Feature) */}
      {activeRoutes.map((route, index) => {
        if (!route.route_points || route.route_points.length === 0) return null;

        // Map points to [lat, lng]
        const positions: [number, number][] = route.route_points.map((p: any) => [parseFloat(p.latitude), parseFloat(p.longitude)]);
        const color = ROUTE_COLORS[index % ROUTE_COLORS.length];

        return (
          <Polyline
            key={`route-${route.id}`}
            positions={positions}
            pathOptions={{ color, weight: 5, opacity: 0.8 }}
          >
            <Tooltip sticky>
              Driver: {route.driver}<br />
              Vehicle: {route.vehicle}
            </Tooltip>
          </Polyline>
        );
      })}

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
          <Popup><strong>{zone.name}</strong><br />Dumping Zone</Popup>
        </Marker>
      ))}

      {/* BINS */}
      {bins.map((bin) => {
        let icon = greenIcon;

        if (bin.prediction && bin.prediction.predicted_overflow_at) {
          icon = orangeIcon;
        }
        else if (bin.level >= 50) {
          icon = redIcon;
        }
        else if (bin.level >= 45) {
          icon = yellowIcon;
        }

        const isGhosted = skippedBinIds.has(bin.id);

        return (
          <Marker
            key={bin.id}
            position={[bin.lat, bin.lng]}
            icon={icon}
            opacity={isGhosted ? 0.35 : 1.0} // Fade out skipped bins
          >
            <Popup>
              <div style={{ minWidth: '180px' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>
                  Bin #{bin.id.substring(0, 6)} {isGhosted && <span style={{ color: '#94a3b8', fontSize: '11px' }}>(Skipped)</span>}
                </h4>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
                  <span>Fill Level:</span>
                  <strong style={{ color: bin.level >= 50 ? '#ef4444' : '#22c55e' }}>{bin.level}%</strong>
                </div>

                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                  Weight: <strong>{bin.weight} kg</strong><br />
                  Status: {bin.status}
                </div>

                {/* ALERT BOX */}
                {bin.prediction && bin.prediction.predicted_overflow_at && (
                  <div style={{
                    marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0',
                    fontSize: '12px', background: '#fffbeb', padding: '8px', borderRadius: '6px'
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