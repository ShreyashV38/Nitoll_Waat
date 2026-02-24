import { useState } from 'react';
import { binAPI } from '../../services/api';
import '../../style/MapsBinsPage.css';

interface Props {
    bin: { id: string; empty_distance?: number; full_distance?: number };
    onClose: () => void;
    onSaved: () => void;
}

const CalibrationModal = ({ bin, onClose, onSaved }: Props) => {
    const [emptyDist, setEmptyDist] = useState(bin.empty_distance || 100);
    const [fullDist, setFullDist] = useState(bin.full_distance || 5);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        if (emptyDist <= fullDist) {
            setError('Empty distance must be greater than full distance');
            return;
        }
        setSaving(true);
        setError('');
        try {
            await binAPI.updateCalibration(bin.id, {
                empty_distance: emptyDist,
                full_distance: fullDist
            });
            onSaved();
            onClose();
        } catch {
            setError('Failed to save calibration');
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
                <h2>📐 Calibrate Sensor</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
                    Bin {bin.id.substring(0, 8)}... — Set sensor distance thresholds
                </p>

                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, color: 'var(--text-secondary)' }}>
                        Empty Distance (cm)
                    </label>
                    <input
                        type="number"
                        value={emptyDist}
                        onChange={e => setEmptyDist(Number(e.target.value))}
                        style={{
                            width: '100%', padding: '10px 12px', borderRadius: 8,
                            border: '1px solid var(--border-color)', fontSize: 14,
                            background: 'var(--bg-input, #fff)', color: 'var(--text-primary)',
                            boxSizing: 'border-box'
                        }}
                    />
                    <small style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                        Distance when bin is empty (sensor to bottom)
                    </small>
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, color: 'var(--text-secondary)' }}>
                        Full Distance (cm)
                    </label>
                    <input
                        type="number"
                        value={fullDist}
                        onChange={e => setFullDist(Number(e.target.value))}
                        style={{
                            width: '100%', padding: '10px 12px', borderRadius: 8,
                            border: '1px solid var(--border-color)', fontSize: 14,
                            background: 'var(--bg-input, #fff)', color: 'var(--text-primary)',
                            boxSizing: 'border-box'
                        }}
                    />
                    <small style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                        Distance when bin is full (sensor to waste surface)
                    </small>
                </div>

                {/* Visual indicator */}
                <div style={{
                    background: 'var(--bg-main)', padding: 14, borderRadius: 10,
                    marginBottom: 16, border: '1px solid var(--border-color)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                        <span>Empty: {emptyDist}cm</span>
                        <span>Full: {fullDist}cm</span>
                        <span>Range: {emptyDist - fullDist}cm</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--border-color)', borderRadius: 4, marginTop: 8, overflow: 'hidden' }}>
                        <div style={{
                            width: fullDist > 0 ? `${Math.min(100, (fullDist / emptyDist) * 100)}%` : '0%',
                            height: '100%', background: '#22c55e', borderRadius: 4,
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                </div>

                {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 10 }}>{error}</p>}

                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1, padding: 12, borderRadius: 8, border: '1px solid var(--border-color)',
                            background: 'transparent', fontWeight: 600, cursor: 'pointer',
                            color: 'var(--text-secondary)'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            flex: 1, padding: 12, borderRadius: 8, border: 'none',
                            background: saving ? '#94a3b8' : '#3b82f6', color: 'white',
                            fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {saving ? 'Saving...' : 'Save Calibration'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CalibrationModal;
