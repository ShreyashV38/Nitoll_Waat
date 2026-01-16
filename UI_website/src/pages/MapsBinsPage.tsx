import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import BinMap from '../components/MapsBins/BinMap'; // Imports the map component
import BinDirectory from '../components/MapsBins/BinDirectory';
import AddBinModal from '../components/MapsBins/AddBinModal';
import '../style/MapsBinsPage.css'; // Correct path for pages/

const MapsBinsPage: React.FC = () => {
  const [councilName, setCouncilName] = useState("Panaji");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(''); 

  const [bins, setBins] = useState([
    { id: 'A12', level: 90, status: 'Active', overflow: '4.30 PM', update: '30 mins ago', lat: 15.4585, lng: 73.8340 },
    { id: 'A15', level: 60, status: 'Active', overflow: '7.00 PM', update: '10 mins ago', lat: 15.4590, lng: 73.8350 },
    { id: 'B03', level: 20, status: 'Active', overflow: 'Tomorrow', update: '1 hr ago', lat: 15.4580, lng: 73.8335 },
    { id: 'C07', level: 0, status: 'Offline', overflow: 'N/A', update: '2 days ago', lat: 15.4575, lng: 73.8345 },
    { id: 'B08', level: 85, status: 'Active', overflow: '5.15 PM', update: '5 mins ago', lat: 15.4595, lng: 73.8330 },
    { id: 'A20', level: 15, status: 'Active', overflow: 'Tomorrow', update: '20 mins ago', lat: 15.4582, lng: 73.8360 },
  ]);

  useEffect(() => {
    const savedArea = localStorage.getItem("selectedArea");
    if (savedArea) setCouncilName(savedArea);
    if (bins.length > 0 && !selectedId) setSelectedId(bins[0].id);
  }, [bins]);

  const handleAddBin = (id: string, level: number) => {
    const randomLat = 15.4585 + (Math.random() * 0.002 - 0.001);
    const randomLng = 73.8340 + (Math.random() * 0.002 - 0.001);

    const newBin = {
      id: id.toUpperCase(),
      level: level,
      status: 'Active',
      overflow: 'Calculating...',
      update: 'Just now',
      lat: randomLat,
      lng: randomLng
    };
    setBins([...bins, newBin]);
  };

  return (
    <div className="maps-bins-container">
      <PageHeader 
        title={`${councilName} Municipal Council (Zone A)`}
        subtitle={`North Goa • ${bins.length} Active Bins`}
      >
        <button className="add-bin-btn" onClick={() => setIsModalOpen(true)}>
           <Plus size={18} /> Add Bin
        </button>
      </PageHeader>

      {/* Reusing the BinMap Component */}
      <BinMap 
        bins={bins} 
        selectedId={selectedId} 
        onSelect={setSelectedId} 
      />

      <BinDirectory 
        bins={bins}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      <AddBinModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddBin} 
      />
    </div>
  );
};

export default MapsBinsPage;