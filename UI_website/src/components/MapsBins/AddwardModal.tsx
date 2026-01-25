// src/components/MapsBins/AddwardModal.tsx (or AddWardModal.tsx)
import React, { useState } from "react";
import { X, FolderPlus } from "lucide-react";
import { wardAPI } from "../../services/api"; 

interface Props {
  onClose: () => void;
  refreshData: () => void; 
  // location prop is removed/ignored as it is not needed
  location?: any; 
}

const AddWardModal: React.FC<Props> = ({ onClose, refreshData }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return alert("Please enter a Ward Name");

    setLoading(true);
    try {
        // ✅ FIX: Send only name and description
        await wardAPI.create({ 
            name,
            description
        });

        refreshData(); 
        onClose();     
    } catch (err: any) {
        alert(err.response?.data?.message || "Failed to create ward");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
             <FolderPlus size={24} color="#db2777" />
             <h2>Create Bin Group (Ward)</h2>
          </div>
          <X className="close-icon" onClick={onClose} style={{cursor: 'pointer'}} />
        </div>

        <p style={{fontSize: '13px', color: '#64748b', marginBottom: '15px'}}>
            Create a named area to group your bins (e.g., "Market Sector", "Beach Road").
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-field">
            <label>Ward Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Market Area" 
              required
              autoFocus
            />
          </div>

          <div className="input-field">
            <label>Description (Optional)</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description of this collection area..."
              style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', minHeight: '80px'}}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-add" disabled={loading} style={{backgroundColor: '#db2777'}}>
                {loading ? "Creating..." : "Create Ward"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWardModal;