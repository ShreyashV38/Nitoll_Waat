import React from "react";
import "../../style/Vehicles.css";

interface Vehicle {
  id: string;
  license_plate: string;
  type: string;
  capacity: string;
  driver_id: string;
  driver_name: string;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
}

interface Driver {
  id: string;
  name: string;
  status: string;
}

interface Props {
  vehicles: Vehicle[];
  drivers: Driver[];
  onAssign: (vehicleId: string, driverId: string) => void;
}

const VehicleFleet: React.FC<Props> = ({ vehicles, drivers, onAssign }) => {
  return (
    <section className="fleet-card" style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px' }}>Fleet Management</h3>
        <p className="subtext" style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
            Total Vehicles: {vehicles.length}
        </p>
      </div>

      <div className="table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '12px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Vehicle Info</th>
                    <th style={{ padding: '12px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Type / Capacity</th>
                    <th style={{ padding: '12px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Assigned Driver</th>
                    <th style={{ padding: '12px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                </tr>
            </thead>
            <tbody>
                {vehicles.map((v) => (
                <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {/* Column 1: Vehicle Info */}
                    <td style={{ padding: '16px 12px' }}>
                        <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{v.license_plate}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>ID: {v.id.substring(0, 8)}...</div>
                    </td>

                    {/* Column 2: Type & Capacity */}
                    <td style={{ padding: '16px 12px' }}>
                        <div style={{ color: '#334155' }}>{v.type}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{v.capacity} Tons</div>
                    </td>

                    {/* Column 3: Driver Selector */}
                    <td style={{ padding: '16px 12px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <select
                                value={v.driver_id || ""}
                                onChange={(e) => onAssign(v.id, e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid #cbd5e1',
                                    background: '#f8fafc',
                                    width: '100%',
                                    maxWidth: '180px',
                                    fontSize: '14px',
                                    color: v.driver_id ? '#0f172a' : '#64748b'
                                }}
                            >
                                <option value="">-- No Driver --</option>
                                {drivers.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name} {d.status === 'BUSY' ? '(Busy)' : ''}
                                    </option>
                                ))}
                            </select>

                            {/* ✅ NEW: X Button to quickly remove driver */}
                            {v.driver_id && (
                                <button 
                                    onClick={() => onAssign(v.id, "")}
                                    title="Unassign Driver"
                                    style={{
                                        background: '#fee2e2', 
                                        border: '1px solid #fecaca', 
                                        color: '#ef4444',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        padding: '0 10px',
                                        height: '35px',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </td>

                    {/* Column 4: Status Badge */}
                    <td style={{ padding: '16px 12px' }}>
                        <span style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: v.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9',
                            color: v.status === 'ACTIVE' ? '#166534' : '#64748b'
                        }}>
                            {v.status}
                        </span>
                    </td>
                </tr>
                ))}
            </tbody>
        </table>

        {vehicles.length === 0 && (
            <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                No vehicles registered in this area.
            </div>
        )}
      </div>
    </section>
  );
};

export default VehicleFleet;