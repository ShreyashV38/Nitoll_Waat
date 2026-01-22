import React, { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { wardAPI } from "../../services/api"; // Import the new API

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { id: string; level: number; ward_id: string }) => void;
}

const AddBinModal: React.FC<Props> = ({ isOpen, onClose, onAdd }) => {
  const [newBinId, setNewBinId] = useState('');
  const [newBinLevel, setNewBinLevel] = useState(0);
  
  // Ward State
  const [wards, setWards] = useState<any[]>([]);
  const [selectedWard, setSelectedWard] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newWardName, setNewWardName] = useState("");

  // Fetch Wards when modal opens
  useEffect(() => {
    if (isOpen) fetchWards();
  }, [isOpen]);

  const fetchWards = async () => {
    try {
      const res = await wardAPI.getAll();
      setWards(res.data);
    } catch (err) { console.error(err); }
  };

  const handleCreateWard = async () => {
    if (!newWardName) return;
    try {
      const res = await wardAPI.create(newWardName);
      setWards([...wards, res.data]); // Update list
      setSelectedWard(res.data.id);   // Auto-select
      setIsCreating(false);
      setNewWardName("");
    } catch (err) { alert("Failed to create ward"); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWard) return alert("Please select a ward");

    onAdd({ id: newBinId, level: newBinLevel, ward_id: selectedWard });
    
    // Reset
    setNewBinId('');
    setNewBinLevel(0);
    setSelectedWard('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2>Add New Bin</h2>
          <X className="close-icon" onClick={onClose} style={{cursor: 'pointer'}}/>
        </div>
        <form onSubmit={handleSubmit}>
          
          <div className="input-field">
            <label>Select Ward</label>
            {!isCreating ? (
                <div style={{display: 'flex', gap: '10px'}}>
                    <select 
                        value={selectedWard} 
                        onChange={(e) => setSelectedWard(e.target.value)}
                        style={{flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #ddd'}}
                        required
                    >
                        <option value="">-- Choose Ward --</option>
                        {wards.map((w: any) => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                    </select>
                    <button type="button" onClick={() => setIsCreating(true)} style={{background: '#e0e7ff', border: 'none', borderRadius: '8px', padding: '0 12px', color: '#4338ca', cursor: 'pointer'}}>
                        <Plus size={20} />
                    </button>
                </div>
            ) : (
                <div style={{display: 'flex', gap: '10px'}}>
                    <input 
                        type="text" 
                        value={newWardName} 
                        onChange={(e) => setNewWardName(e.target.value)} 
                        placeholder="New Ward Name" 
                        autoFocus
                    />
                    <button type="button" onClick={handleCreateWard} style={{background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', padding: '0 15px', fontWeight: 'bold', cursor: 'pointer'}}>
                        Save
                    </button>
                </div>
            )}
          </div>

          <div className="input-field">
            <label>Bin ID (Optional)</label>
            <input type="text" value={newBinId} onChange={(e) => setNewBinId(e.target.value)} placeholder="Auto-generated" />
          </div>

          <div className="input-field">
            <label>Initial Fill Level (%)</label>
            <input type="number" value={newBinLevel} onChange={(e) => setNewBinLevel(Number(e.target.value))} max="100" min="0" />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-add">Add Bin</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBinModal;