import React from "react";
import "../../style/MapsBinsPage.css"; 

interface Bin {
  id: string;
  level: number;
  status: string;
  overflow: string;
  update: string;
}

interface Props {
  bins: Bin[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const BinDirectory: React.FC<Props> = ({ bins, selectedId, onSelect }) => {
  
  const getStatusClass = (level: number, status: string) => {
    if (status === 'Offline') return 'offline';
    if (level > 80) return 'high';
    if (level > 50) return 'mid';
    return 'low';
  };

  return (
    <div className="mb-card directory-card">
      <h3>Bin Directory</h3>
      
      <div className="directory-list">
        {/* Header Row */}
        <div className="directory-header">
          <span>BIN ID</span>
          <span style={{flex: 1, paddingLeft: '20px'}}>FILL LEVEL</span>
          <span>OVERFLOW</span>
          <span>UPDATED</span>
          <span>STATUS</span>
        </div>

        {/* Scrollable List of Bins */}
        <div className="directory-scroll-area">
          {bins.map((bin) => (
            <div 
              key={bin.id} 
              className={`directory-row ${selectedId === bin.id ? 'active-row' : ''}`}
              onClick={() => onSelect(bin.id)}
            >
              <div className="col-id">{bin.id}</div>
              
              <div className="col-progress">
                <div className="progress-track small">
                  <div 
                    className={`progress-bar ${getStatusClass(bin.level, bin.status)}`} 
                    style={{ width: `${bin.level}%` }}
                  ></div>
                </div>
                <span className="percent">{bin.level}%</span>
              </div>

              <div className="col-text">{bin.overflow}</div>
              <div className="col-text">{bin.update}</div>
              
              <div className="col-status">
                <span className={`status-badge ${bin.status.toLowerCase()}`}>
                  {bin.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BinDirectory;