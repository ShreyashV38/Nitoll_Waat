import React, { useState } from "react";
import { X, MapPin } from "lucide-react";
import { binAPI } from "../../services/api"; 

interface Props {
  onClose: () => void;
  refreshData: () => void; 
  wards: any[];            
  location?: { lat: number, lng: number } | null; // Optional location from map click
}

const AddBinModal: React.FC<Props> = ({ onClose, refreshData, wards, location }) => {
  const [newBinId, setNewBinId] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Manual Lat/Lng state (used if no map location was clicked)
  const [manualLat, setManualLat] = useState('15.4909');
  const [manualLng, setManualLng] = useState('73.8278');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWard) return alert("Please select a Ward");

    setLoading(true);
    try {
        // Use props location OR manual entry
        const finalLat = location ? location.lat : parseFloat(manualLat);
        const finalLng = location ? location.lng : parseFloat(manualLng);

        await binAPI.create({ 
            id: newBinId, 
            ward_id: selectedWard,
            lat: finalLat,
            lng: finalLng,
            level: 0 
        });

        refreshData(); 
        onClose();     
    } catch (err: any) {
        alert(err.response?.data?.message || "Failed to add bin");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2>Add New Bin</h2>
          <X className="close-icon" onClick={onClose} style={{cursor: 'pointer'}} />
        </div>

        {/* Location Display */}
        <div style={{background: '#eff6ff', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', border: '1px solid #bfdbfe'}}>
            <MapPin size={24} color="#2563eb" />
            <div style={{width: '100%'}}>
                <p style={{margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#1e3a8a'}}>Location:</p>
                {location ? (
                    <p style={{margin: 0, fontSize: '12px', color: '#60a5fa'}}>
                        {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                ) : (
                    <div style={{display:'flex', gap:'5px', marginTop:'5px'}}>
                        <input className="input-field" style={{margin:0, padding:'5px'}} value={manualLat} onChange={e=>setManualLat(e.target.value)} placeholder="Lat" />
                        <input className="input-field" style={{margin:0, padding:'5px'}} value={manualLng} onChange={e=>setManualLng(e.target.value)} placeholder="Lng" />
                    </div>
                )}
            </div>
        </div>

        <form onSubmit={handleSubmit}>
          
          <div className="input-field">
            <label>Bin ID (Optional)</label>
            <input 
              type="text" 
              value={newBinId} 
              onChange={(e) => setNewBinId(e.target.value)} 
              placeholder="e.g. BIN-2024-X" 
            />
          </div>

          <div className="input-field">
            <label>Select Ward</label>
            <select 
                value={selectedWard} 
                onChange={(e) => setSelectedWard(e.target.value)}
                style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd'}}
                required
            >
                <option value="">-- Choose Ward --</option>
                {wards.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                ))}
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-add" disabled={loading}>
                {loading ? "Adding..." : "Confirm & Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBinModal;