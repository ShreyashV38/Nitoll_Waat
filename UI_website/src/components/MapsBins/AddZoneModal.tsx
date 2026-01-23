import React, { useState } from "react";
import { X, MapPin } from "lucide-react";
import { dumpingZoneAPI } from "../../services/api"; // <--- Import API

interface Props {
  onClose: () => void;
  location?: { lat: number, lng: number } | null;
  refreshData: () => void; // <--- We need this to refresh map after adding
}

const AddZoneModal: React.FC<Props> = ({ onClose, location, refreshData }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [manualLat, setManualLat] = useState(location ? location.lat.toString() : "15.4909");
  const [manualLng, setManualLng] = useState(location ? location.lng.toString() : "73.8278");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return alert("Please enter a name");
    
    setLoading(true);
    try {
        const finalLat = location ? location.lat : parseFloat(manualLat);
        const finalLng = location ? location.lng : parseFloat(manualLng);

        // 1. SAVE TO DB
        await dumpingZoneAPI.create({ 
            name, 
            lat: finalLat, 
            lng: finalLng 
        });
        
        // 2. Refresh Map & Close
        alert("Zone Added Successfully!");
        refreshData();
        onClose();

    } catch (err: any) {
        alert("Failed to add zone: " + (err.response?.data?.message || err.message));
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2>Add Dumping Zone</h2>
          <X className="close-icon" onClick={onClose} style={{cursor: 'pointer'}} />
        </div>

        {/* Location Display */}
        <div style={{background: '#f3e8ff', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', border: '1px solid #d8b4fe'}}>
            <MapPin size={24} color="#9333ea" />
            <div style={{width: '100%'}}>
                <p style={{margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#6b21a8'}}>Zone Location:</p>
                {location ? (
                    <p style={{margin: 0, fontSize: '12px', color: '#9333ea'}}>
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
            <label>Zone Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Saligao Treatment Plant" 
              autoFocus
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button 
                type="submit" 
                className="btn-add" 
                style={{backgroundColor: '#9333ea'}}
                disabled={loading}
            >
                {loading ? "Adding..." : "Add Zone"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddZoneModal;