import React from "react";
import "../../style/RoutesPage.css";

// Update the interface to accept the route object
interface Props {
  vehicle: { // Renamed from 'route' to 'vehicle' to match your RoutesPage usage
    id: number;
    name: string;
    driver: string;
    license_plate: string;
    ward_name: string;
    status: string;
    progress: number;
    bins: string;
    distance: string;
  };
}

const RouteInfoCard: React.FC<Props> = ({ vehicle }) => {
  return (
    <div className="route-info-card" style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#1e293b' }}>{vehicle.name} Details</h3>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
            Driver: <span style={{ fontWeight: 'bold', color: '#334155' }}>{vehicle.driver}</span>
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ 
            background: vehicle.status === 'IN_PROGRESS' ? '#dcfce7' : '#f1f5f9', 
            color: vehicle.status === 'IN_PROGRESS' ? '#16a34a' : '#64748b',
            padding: '6px 12px', 
            borderRadius: '20px', 
            fontSize: '12px', 
            fontWeight: 'bold' 
          }}>
            {vehicle.status}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '15px' }}>
        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Vehicle</span>
          <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{vehicle.license_plate}</span>
        </div>
        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Ward</span>
          <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{vehicle.ward_name}</span>
        </div>
        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Progress</span>
          <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{Math.round(vehicle.progress)}%</span>
        </div>
      </div>
    </div>
  );
};

export default RouteInfoCard;