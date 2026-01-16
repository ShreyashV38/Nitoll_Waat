import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import iconMarker from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";


const DefaultIcon = L.icon({
  iconUrl: iconMarker,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const GBS_COORDS: [number, number] = [15.4585, 73.8340];

const MapWidget: React.FC = () => {
  return (
    <div className="dashboard-card map-card">
      <div className="card-header">
        <h3>Map preview</h3>
      </div>
      <div className="map-preview-box">
        <MapContainer 
          center={GBS_COORDS} 
          zoom={15} 
          style={{ height: "100%", width: "100%", zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={GBS_COORDS}>
            <Popup>
              <strong>Goa Business School</strong><br />
              Active Zone A
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default MapWidget;