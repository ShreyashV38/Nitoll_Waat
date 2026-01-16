import React, { useState } from "react";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (id: string, level: number) => void;
}

const AddBinModal: React.FC<Props> = ({ isOpen, onClose, onAdd }) => {
  const [newBinId, setNewBinId] = useState('');
  const [newBinLevel, setNewBinLevel] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(newBinId, newBinLevel);
    setNewBinId('');
    setNewBinLevel(0);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2>Add New Bin</h2>
          <X className="close-icon" onClick={onClose} />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-field">
            <label>Bin ID</label>
            <input 
              type="text" 
              value={newBinId} 
              onChange={(e) => setNewBinId(e.target.value)} 
              placeholder="e.g. A22" 
              required 
            />
          </div>
          <div className="input-field">
            <label>Initial Fill Level (%)</label>
            <input 
              type="number" 
              value={newBinLevel} 
              onChange={(e) => setNewBinLevel(Number(e.target.value))} 
              max="100" min="0" 
            />
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