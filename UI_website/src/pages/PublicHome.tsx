import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import GOA_LOCATIONS from '../data/goaLocations';
import { findBoundaryForArea } from '../data/goaBoundaries';
import { getTranslations, languageNames } from '../data/translations';
import type { Language } from '../data/translations';
import '../style/PublicHome.css';
import logo from '../assets/Goa.png';
import BinMap from '../components/MapsBins/BinMap';

const PublicHome: React.FC = () => {
  const navigate = useNavigate();

  // Language
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('citizen-lang') as Language) || 'en';
  });
  const t = getTranslations(lang);

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('citizen-lang', newLang);
  };

  // Selections
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTaluka, setSelectedTaluka] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState('');

  // Derived from GOA_LOCATIONS (client-side)
  const districts = Object.keys(GOA_LOCATIONS);
  const talukas = selectedDistrict ? Object.keys(GOA_LOCATIONS[selectedDistrict]) : [];

  // Areas from API
  const [areas, setAreas] = useState<{ id: string, area_name: string }[]>([]);

  // Data State
  const [areaData, setAreaData] = useState<{ bins: any[], wards: any[] } | null>(null);
  const [mapBins, setMapBins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Complaint form state
  const [showComplaint, setShowComplaint] = useState(false);
  const [complaintBinId, setComplaintBinId] = useState('');
  const [complaintType, setComplaintType] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintName, setComplaintName] = useState('');
  const [complaintContact, setComplaintContact] = useState('');
  const [complaintSuccess, setComplaintSuccess] = useState(false);

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dist = e.target.value;
    setSelectedDistrict(dist);
    setSelectedTaluka('');
    setSelectedAreaId('');
    setAreas([]);
    setAreaData(null);
  };

  const handleTalukaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tal = e.target.value;
    setSelectedTaluka(tal);
    setSelectedAreaId('');
    setAreaData(null);
    if (tal) api.get(`/public/areas?district=${selectedDistrict}&taluka=${tal}`).then(res => setAreas(res.data));
  };

  const handleAreaSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedAreaId(id);
    if (id) {
      setLoading(true);
      api.get(`/public/data/${id}`).then(res => {
        const rawBins = res.data.bins;
        const formattedBins = rawBins.map((b: any) => ({
          id: b.id,
          lat: parseFloat(b.latitude),
          lng: parseFloat(b.longitude),
          level: b.current_fill_percent,
          status: b.status,
          lid: 'UNKNOWN',
          weight: 0,
          last_updated: b.last_updated
        }));
        setAreaData(res.data);
        setMapBins(formattedBins);
        setLoading(false);
      });
    }
  };

  const handleComplaintSubmit = async () => {
    if (!complaintBinId || !complaintType) return;
    try {
      await api.post('/complaints/create', {
        bin_id: complaintBinId,
        type: complaintType,
        description: complaintDesc,
        reporter_name: complaintName,
        reporter_contact: complaintContact
      });
      setComplaintSuccess(true);
      setTimeout(() => {
        setShowComplaint(false);
        setComplaintSuccess(false);
        setComplaintType('');
        setComplaintDesc('');
        setComplaintName('');
        setComplaintContact('');
      }, 2000);
    } catch {
      alert('Error submitting complaint');
    }
  };

  return (
    <div className="public-container">
      {/* Navbar */}
      <nav className="public-nav">
        <div className="nav-brand">
          <img src={logo} alt="Logo" style={{ height: 40 }} />
          <span>Nitoll Waat <small>{t.citizenPortal}</small></span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Language Selector */}
          <select
            value={lang}
            onChange={e => handleLangChange(e.target.value as Language)}
            style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ccc', fontSize: 13 }}
          >
            {(Object.keys(languageNames) as Language[]).map(l => (
              <option key={l} value={l}>{languageNames[l]}</option>
            ))}
          </select>
          <button className="nav-btn" onClick={() => navigate('/login')}>{t.adminLogin}</button>
        </div>
      </nav>

      {/* Hero */}
      <div className="hero-box">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>

        <div className="search-card">
          <div className="form-group">
            <label>{t.district}</label>
            <select onChange={handleDistrictChange} value={selectedDistrict}>
              <option value="">{t.selectDistrict}</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>{t.taluka}</label>
            <select onChange={handleTalukaChange} value={selectedTaluka} disabled={!selectedDistrict}>
              <option value="">{t.selectTaluka}</option>
              {talukas.map(tk => <option key={tk} value={tk}>{tk}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>{t.village}</label>
            <select onChange={handleAreaSelect} value={selectedAreaId} disabled={!selectedTaluka}>
              <option value="">{t.selectArea}</option>
              {areas.length === 0 && selectedTaluka ? (
                <option disabled>{t.noAreas}</option>
              ) : null}
              {areas.map(a => <option key={a.id} value={a.id}>{a.area_name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading && <div className="loading-spinner">{t.loading}</div>}

      {areaData && (
        <div className="data-section">
          <div className="map-container-public">
            <BinMap
              bins={mapBins}
              zones={[]}
              boundary={selectedTaluka ? (() => {
                const b = findBoundaryForArea(selectedTaluka);
                return b ? { ...b, fillColor: b.fillColor } : undefined;
              })() : undefined}
            />
          </div>

          {/* Report Issue Button */}
          {mapBins.length > 0 && (
            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              <button
                className="nav-btn"
                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
                onClick={() => { setComplaintBinId(mapBins[0]?.id || ''); setShowComplaint(true); }}
              >
                🚨 {t.reportIssue}
              </button>
            </div>
          )}

          <div className="summary-row" style={{ marginTop: '2rem' }}>
            <div className="summary-card">
              <h3>{t.totalBins}</h3>
              <p>{areaData.bins.length}</p>
            </div>
            <div className="summary-card">
              <h3>{t.serviceWards}</h3>
              <p>{areaData.wards.length}</p>
            </div>
            <div className="summary-card status-ok">
              <h3>Status</h3>
              <p>{t.statusLive}</p>
            </div>
          </div>
        </div>
      )}

      {/* Complaint Modal */}
      {showComplaint && (
        <div className="modal-overlay" onClick={() => setShowComplaint(false)}>
          <div className="complaint-modal" onClick={e => e.stopPropagation()}>
            {complaintSuccess ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <p style={{ fontSize: 48 }}>✅</p>
                <h3>{t.complaintSuccess}</h3>
              </div>
            ) : (
              <>
                <h3>🚨 {t.reportIssue}</h3>
                <div className="complaint-field">
                  <label>{t.complaintType}</label>
                  <select value={complaintType} onChange={e => setComplaintType(e.target.value)}>
                    <option value="">{t.selectType}</option>
                    <option value="OVERFLOWING">{t.overflowing}</option>
                    <option value="DAMAGED_LID">{t.damagedLid}</option>
                    <option value="BAD_SMELL">{t.badSmell}</option>
                    <option value="MISSING_BIN">{t.missingBin}</option>
                    <option value="OTHER">{t.other}</option>
                  </select>
                </div>
                <div className="complaint-field">
                  <label>Bin</label>
                  <select value={complaintBinId} onChange={e => setComplaintBinId(e.target.value)}>
                    {mapBins.map(b => (
                      <option key={b.id} value={b.id}>Bin {b.id.substring(0, 8)}... ({b.level}%)</option>
                    ))}
                  </select>
                </div>
                <div className="complaint-field">
                  <label>{t.description}</label>
                  <textarea
                    value={complaintDesc}
                    onChange={e => setComplaintDesc(e.target.value)}
                    rows={3}
                    placeholder={t.description}
                  />
                </div>
                <div className="complaint-field">
                  <label>{t.yourName}</label>
                  <input value={complaintName} onChange={e => setComplaintName(e.target.value)} />
                </div>
                <div className="complaint-field">
                  <label>{t.contactNumber}</label>
                  <input value={complaintContact} onChange={e => setComplaintContact(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button className="btn-cancel" onClick={() => setShowComplaint(false)}>{t.cancel}</button>
                  <button className="btn-submit" onClick={handleComplaintSubmit} disabled={!complaintType}>
                    {t.submit}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicHome;