import React from 'react';
import { Map } from 'lucide-react';
import '../style/MapPreview.css';

const MapPreview: React.FC = () => {
  return (
    <div className="card map-card">
      <h3 className="card-title">Map preview</h3>
      <div className="map-container">
        <div className="map-pattern"></div>
        <div className="map-overlay">
          <Map size={48} />
          <div className="map-text">Open full map</div>
        </div>
        <div className="bin-icon bin-icon-1">🗑️</div>
        <div className="bin-icon bin-icon-2">🗑️</div>
      </div>
    </div>
  );
};

export default MapPreview;