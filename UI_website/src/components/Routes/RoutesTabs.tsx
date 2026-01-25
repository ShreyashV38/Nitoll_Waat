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
        background: 'white', 
        padding: '15px', 
        borderRadius: '12px', 
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      <h4 style={{ margin: '0 0 15px 0', color: '#64748b', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
              borderColor: selectedId === vehicle.id ? '#2563eb' : '#e2e8f0',
              background: selectedId === vehicle.id ? '#eff6ff' : 'white',
              color: selectedId === vehicle.id ? '#2563eb' : '#475569',
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
                background: vehicle.status === 'IN_PROGRESS' ? '#22c55e' : '#94a3b8' 
            }} />
          </button>
        ))}

        {vehicles.length === 0 && (
            <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '14px' }}>
                No active vehicles to display.
            </div>
        )}
      </div>
    </div>
  );
};

export default RoutesTabs;