import React, { useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import "../../style/RoutesPage.css";

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

// Update the interface to accept the route object
interface Props {
  vehicle: {
    id: number;
    name: string;
    driver: string;
    license_plate: string;
    ward_name: string;
    status: string;
    progress: number;
    bins: string;
    distance: string;
    route_points?: { latitude: string; longitude: string }[];
    skipped_bins?: { id: string, name?: string, lat?: number, lng?: number }[];
  };
}

// Component to recenter map based on points
const RecenterMap = ({ points }: { points: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [points, map]);
  return null;
};

const RouteInfoCard: React.FC<Props> = ({ vehicle }) => {
  // Parse points to leaflet format
  const positions: [number, number][] = (vehicle.route_points || []).map(p => [
    parseFloat(p.latitude),
    parseFloat(p.longitude)
  ]);

  const hasRoute = positions.length > 0;

  return (
    <div className="route-info-card" style={{
      background: 'var(--card-bg)',
      borderRadius: '16px',
      padding: '24px',
      marginTop: '20px',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-md)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '20px' }}>{vehicle.name} Details</h3>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
            Driver: <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{vehicle.driver}</span>
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{
            background: vehicle.status === 'IN_PROGRESS' ? 'var(--status-completed-bg)' : 'var(--bg-input)',
            color: vehicle.status === 'IN_PROGRESS' ? 'var(--status-completed-text)' : 'var(--text-muted)',
            padding: '8px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {vehicle.status}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: '20px' }}>
        {/* Left Stats Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Vehicle</span>
            <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '18px' }}>{vehicle.license_plate}</span>
          </div>
          <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Target Ward</span>
            <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '18px' }}>{vehicle.ward_name}</span>
          </div>
          <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Progress ({vehicle.bins})</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
              <div style={{ flex: 1, height: '8px', background: 'var(--progress-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${vehicle.progress}%`, height: '100%', background: 'var(--accent-blue)', transition: 'width 0.5s ease' }} />
              </div>
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '16px' }}>{Math.round(vehicle.progress)}%</span>
            </div>
          </div>
        </div>

        {/* Right Map Column */}
        <div style={{
          height: '350px',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-input)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {hasRoute ? (
            <MapContainer
              center={positions[0]}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <RecenterMap points={positions} />

              {/* Draw Route Line */}
              <Polyline
                positions={positions}
                pathOptions={{ color: '#3b82f6', weight: 6, opacity: 0.8 }}
              />

              {/* Start Marker */}
              <Marker position={positions[0]}>
                <Popup>Route Start</Popup>
              </Marker>

              {/* End Marker */}
              {positions.length > 1 && (
                <Marker position={positions[positions.length - 1]}>
                  <Popup>Route End</Popup>
                </Marker>
              )}

            </MapContainer>
          ) : (
            <div style={{ color: 'var(--text-faint)', textAlign: 'center' }}>
              <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>🗺️</span>
              No route path available for this active vehicle.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteInfoCard;