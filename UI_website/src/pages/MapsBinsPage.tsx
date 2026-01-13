import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import Sidebar from '../components/Sidebar'; 
import '../style/MapsBinsPage.css';

const MapsBinsPage: React.FC = () => {
  const [councilName, setCouncilName] = useState("Panaji");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('A12');
  
  // Modal Form State
  const [newBinId, setNewBinId] = useState('');
  const [newBinLevel, setNewBinLevel] = useState(0);

  // Dynamic Data Source
  const [bins, setBins] = useState([
    { id: 'A12', level: 90, status: 'Active', overflow: '4.30 PM', update: '30 mins ago' },
    { id: 'A15', level: 60, status: 'Active', overflow: '7.00 PM', update: '10 mins ago' },
    { id: 'B03', level: 20, status: 'Active', overflow: 'Tomorrow', update: '1 hr ago' },
    { id: 'C07', level: 0, status: 'Offline', overflow: 'N/A', update: '2 days ago' },
    { id: 'B08', level: 85, status: 'Active', overflow: '5.15 PM', update: '5 mins ago' },
    { id: 'A20', level: 15, status: 'Active', overflow: 'Tomorrow', update: '20 mins ago' },
  ]);

  useEffect(() => {
    const savedArea = localStorage.getItem("selectedArea");
    if (savedArea) setCouncilName(savedArea);
  }, []);

  // Find the currently selected bin data dynamically
  const activeBin = bins.find(b => b.id === selectedId) || bins[0];

  const getStatusClass = (level: number, status: string) => {
    if (status === 'Offline') return 'offline';
    if (level > 80) return 'high';
    if (level > 50) return 'mid';
    return 'low';
  };

  const handleAddBin = (e: React.FormEvent) => {
    e.preventDefault();
    const newBin = {
      id: newBinId.toUpperCase(),
      level: Number(newBinLevel),
      status: 'Active',
      overflow: 'Calculating...',
      update: 'Just now'
    };
    setBins([...bins, newBin]);
    setIsModalOpen(false);
    setNewBinId('');
    setNewBinLevel(0);
  };

  return (
    <div className="page-layout">
      <Sidebar />
      
      <main className="main-content">
        <div className="maps-bins-container">
          <header className="mb-header">
            <h1>{councilName} Municipal Council (Zone A)</h1>
            <p className="subtitle">North Goa • {bins.length} Active Bins</p>
          </header>

          {/* All Bins Card */}
          <div className="mb-card visualizer-card">
            <div className="card-top-row">
              <h3>All Bins</h3>
              <button className="add-bin-btn" onClick={() => setIsModalOpen(true)}>
                <Plus size={18} /> Add Bin
              </button>
            </div>
            
            <div className="visualizer-content">
              <div className="bins-grid-container">
                {bins.map(bin => (
                  <div 
                    key={bin.id} 
                    className={`bin-item ${selectedId === bin.id ? 'selected' : ''}`}
                    onClick={() => setSelectedId(bin.id)}
                  >
                    <div className={`bin-circle ${getStatusClass(bin.level, bin.status)}`}>
                      <span className="bin-icon">🗑</span>
                    </div>
                    <span className="bin-label">{bin.id}</span>
                  </div>
                ))}
              </div>

              <div className="legend-box">
                <div className="legend-item"><span className="dot low"></span> Less than 50%</div>
                <div className="legend-item"><span className="dot mid"></span> 50-80%</div>
                <div className="legend-item"><span className="dot high"></span> Above 80%</div>
                <div className="legend-item"><span className="dot offline"></span> Offline</div>
              </div>
            </div>
          </div>

          {/* Bins Details Card */}
          <div className="mb-card details-card">
            <h3>Bins Details</h3>
            <div className="details-row">
              <div className="detail-group">
                <label>Bin ID</label>
                <div className="detail-value bold-id">{activeBin.id}</div>
              </div>
              
              <div className="detail-group fill-group">
                <label>Fill Level</label>
                <div className="progress-container">
                  <div className="progress-track">
                    <div 
                      className={`progress-bar ${getStatusClass(activeBin.level, activeBin.status)}`} 
                      style={{ width: `${activeBin.level}%` }}
                    ></div>
                  </div>
                  <span className="percentage-val">{activeBin.level}%</span>
                </div>
              </div>

              <div className="detail-group">
                <label>Predicted Overflow</label>
                <div className="detail-value">{activeBin.overflow}</div>
              </div>

              <div className="detail-group">
                <label>Last Updated</label>
                <div className="detail-value">{activeBin.update}</div>
              </div>

              <div className="detail-group">
                <label>Status</label>
                <div className={`status-text ${activeBin.status.toLowerCase()}`}>
                  {activeBin.status}
                </div>
              </div>
            </div>
          </div>

          {/* User-Driven Modal */}
          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal-box">
                <div className="modal-header">
                  <h2>Add New Bin</h2>
                  <X className="close-icon" onClick={() => setIsModalOpen(false)} />
                </div>
                <form onSubmit={handleAddBin}>
                  <div className="input-field">
                    <label>Bin ID</label>
                    <input type="text" value={newBinId} onChange={(e) => setNewBinId(e.target.value)} placeholder="e.g. A22" required />
                  </div>
                  <div className="input-field">
                    <label>Initial Fill Level (%)</label>
                    <input type="number" value={newBinLevel} onChange={(e) => setNewBinLevel(Number(e.target.value))} max="100" min="0" />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button type="submit" className="btn-add">Add Bin</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MapsBinsPage;