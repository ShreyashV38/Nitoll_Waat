import React from "react";
import "../../style/RoutesPage.css";

interface Props {
  vehicles: any[]; // Receives the formatted routes from RoutesPage
  selectedId: number | null;
  onSelect: (id: number) => void;
}

const RoutesTabs: React.FC<Props> = ({ vehicles, selectedId, onSelect }) => {
  return (
    <div className="routes-tabs-container" style={{
      background: 'var(--card-bg)',
      padding: '15px',
      borderRadius: '12px',
      marginBottom: '20px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <h4 style={{ margin: '0 0 15px 0', color: 'var(--text-muted)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Active Vehicles ({vehicles.length})
      </h4>

      <div className="tabs-scroll-area" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
        {vehicles.map((vehicle) => (
          <button
            key={vehicle.id}
            onClick={() => onSelect(vehicle.id)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: selectedId === vehicle.id ? 'var(--accent-blue)' : 'var(--border-color)',
              background: selectedId === vehicle.id ? 'var(--alert-info-bg)' : 'var(--bg-input)',
              color: selectedId === vehicle.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontWeight: selectedId === vehicle.id ? '600' : '400',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>{vehicle.name}</span>
            <span style={{
              height: '8px',
              width: '8px',
              borderRadius: '50%',
              background: vehicle.status === 'IN_PROGRESS' ? 'var(--accent-green)' : 'var(--text-faint)'
            }} />
          </button>
        ))}

        {vehicles.length === 0 && (
          <div style={{ color: 'var(--text-faint)', fontStyle: 'italic', fontSize: '14px' }}>
            No active vehicles to display.
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutesTabs;