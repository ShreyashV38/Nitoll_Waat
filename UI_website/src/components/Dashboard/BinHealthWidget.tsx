import { useState, useEffect } from 'react';
import { binAPI } from '../../services/api';
import './BinHealthWidget.css';

interface HealthData {
    total_bins?: number;
    offline_bins?: number;
    stale_bins?: number;
    flagged_bins?: any[];
    reliability_score?: number;
}

const BinHealthWidget = () => {
    const [health, setHealth] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        binAPI.getHealth()
            .then(res => { setHealth(res.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="health-widget"><p>Loading health data...</p></div>;
    if (!health) return <div className="health-widget"><p>Health data unavailable</p></div>;

    const score = health?.reliability_score || 0;
    const scoreColor = score >= 90 ? '#22c55e' : score >= 70 ? '#eab308' : '#ef4444';
    const scoreLabel = score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs Attention';

    return (
        <div className="health-widget">
            <div className="health-header">
                <h3>🩺 Bin Health</h3>
                <span className="health-score" style={{ color: scoreColor }}>
                    {score}% {scoreLabel}
                </span>
            </div>

            <div className="health-metrics">
                <div className="health-metric">
                    <span className="metric-value">{health?.total_bins || 0}</span>
                    <span className="metric-label">Total</span>
                </div>
                <div className="health-metric">
                    <span className="metric-value" style={{ color: (health?.offline_bins || 0) > 0 ? '#ef4444' : '#22c55e' }}>
                        {health?.offline_bins || 0}
                    </span>
                    <span className="metric-label">Offline</span>
                </div>
                <div className="health-metric">
                    <span className="metric-value" style={{ color: (health?.stale_bins || 0) > 0 ? '#eab308' : '#22c55e' }}>
                        {health?.stale_bins || 0}
                    </span>
                    <span className="metric-label">Stale</span>
                </div>
            </div>

            {(health?.flagged_bins?.length || 0) > 0 && (
                <div className="flagged-list">
                    <h4>⚠️ Flagged Bins</h4>
                    {health.flagged_bins!.slice(0, 3).map((bin: any) => (
                        <div key={bin.id} className="flagged-item">
                            <span className="flagged-id">Bin {bin.id.substring(0, 8)}</span>
                            <span className="flagged-reason">{bin.reason}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BinHealthWidget;
