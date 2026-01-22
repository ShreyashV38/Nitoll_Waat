import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import BinMap from '../components/MapsBins/BinMap';
import BinDirectory from '../components/MapsBins/BinDirectory';
import AddBinModal from '../components/MapsBins/AddBinModal';
import { binAPI } from '../services/api'; 
import { useAuth } from '../context/AuthContext';
import '../style/MapsBinsPage.css';

const MapsBinsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(''); 
  const [bins, setBins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { area } = useAuth();

  // 1. Fetch Real Bins from DB
  const fetchBins = async () => {
    try {
      const res = await binAPI.getAll();
      
      const formatted = res.data.map((b: any) => ({
         id: b.id.substring(0, 4).toUpperCase(), 
         fullId: b.id,
         level: b.current_fill_percent,
         status: b.status === 'NORMAL' ? 'Active' : b.status,
         overflow: b.status === 'CRITICAL' ? 'High Risk' : 'Stable',
         ward: b.ward_id || 'General', // Show Ward ID or Name if you joined it
         update: 'Live',
         lat: parseFloat(b.latitude),
         lng: parseFloat(b.longitude)
      }));

      setBins(formatted);
      if (formatted.length > 0 && !selectedId) {
          setSelectedId(formatted[0].id);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching bins:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBins();
  }, []); 

  // 2. Handle "Add Bin" (Connected to Backend)
  // --- UPDATED SIGNATURE TO MATCH MODAL ---
  const handleAddBin = async (data: { id: string; level: number; ward_id: string }) => {
    try {
      // Create a random lat/lng near the user's area (Mocking GPS for now)
      const randomLat = 15.4909 + (Math.random() * 0.01 - 0.005);
      const randomLng = 73.8278 + (Math.random() * 0.01 - 0.005);

      const payload = {
        id: data.id || undefined, 
        level: data.level,
        ward_id: data.ward_id, // <--- Now sending the Ward ID
        lat: randomLat,
        lng: randomLng
      };

      await binAPI.create(payload);
      
      // Refresh list after adding
      fetchBins();
      alert(`Bin added successfully!`);

    } catch (err) {
      console.error("Failed to add bin", err);
      alert("Error adding bin to database.");
    }
  };

  return (
    <div className="maps-bins-container">
      <PageHeader 
        title={area ? `${area.area_name}` : "Loading..."}
        subtitle={`${area?.district || 'Goa'} • Waste Bins Map`}
      >
        <button className="add-bin-btn" onClick={() => setIsModalOpen(true)}>
           <Plus size={18} /> Add Bin
        </button>
      </PageHeader>

      {loading ? (
          <div style={{padding: '20px', textAlign: 'center'}}>Loading Map Data...</div>
      ) : (
          <>
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
          </>
      )}

      <AddBinModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddBin} 
      />
    </div>
  );
};

export default MapsBinsPage;