import React from "react";
import { Plus } from "lucide-react";

interface Bin {
  id: string;
  level: number;
  status: string;
}

interface Props {
  bins: Bin[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAddClick: () => void;
}

const BinList: React.FC<Props> = ({ bins, selectedId, onSelect, onAddClick }) => {
  
  const getStatusClass = (level: number, status: string) => {
    if (status === 'Offline') return 'offline';
    if (level > 80) return 'high';
    if (level > 50) return 'mid';
    return 'low';
  };

  return (
    <div className="mb-card visualizer-card">
      <div className="card-top-row">
        <h3>All Bins</h3>
        <button className="add-bin-btn" onClick={onAddClick}>
          <Plus size={18} /> Add Bin
        </button>
      </div>
      
      <div className="visualizer-content">
        {/* Horizontal scrollable list if there are many bins */}
        <div className="bins-grid-container">
          {bins.map(bin => (
            <div 
              key={bin.id} 
              className={`bin-item ${selectedId === bin.id ? 'selected' : ''}`}
              onClick={() => onSelect(bin.id)}
            >
              <div className={`bin-circle ${getStatusClass(bin.level, bin.status)}`}>
                <span className="bin-icon">🗑</span>
              </div>
              <span className="bin-label">{bin.id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BinList;