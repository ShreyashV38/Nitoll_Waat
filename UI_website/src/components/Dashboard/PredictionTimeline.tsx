import './PredictionTimeline.css';

interface Bin {
    id: string;
    fullId?: string;
    level: number;
    status: string;
    prediction?: {
        status: string;
        predicted_overflow_at: string | null;
        hours_until_overflow: number | null;
    };
}

interface Props {
    bins: Bin[];
}

const PredictionTimeline = ({ bins }: Props) => {
    // Filter bins that have predictions safely
    const predicted = (bins || [])
        .filter(b => b?.prediction && b.prediction?.hours_until_overflow !== null && b.prediction?.hours_until_overflow !== undefined)
        .sort((a, b) => (a.prediction!.hours_until_overflow || 999) - (b.prediction!.hours_until_overflow || 999));

    const urgent = predicted.filter(b => (b.prediction!.hours_until_overflow || 999) <= 6);
    const soon = predicted.filter(b => {
        const h = b.prediction!.hours_until_overflow || 999;
        return h > 6 && h <= 24;
    });
    const safe = predicted.filter(b => (b.prediction!.hours_until_overflow || 999) > 24);

    const getTimeLabel = (hours: number | null | undefined) => {
        if (hours === null || hours === undefined) return '—';
        if (hours < 1) return `${Math.round(hours * 60)}m`;
        if (hours < 24) return `${Math.round(hours)}h`;
        return `${Math.round(hours / 24)}d`;
    };

    return (
        <div className="prediction-widget">
            <div className="prediction-header">
                <h3>🔮 Overflow Predictions</h3>
                <span className="prediction-count">{predicted.length} tracked</span>
            </div>

            {predicted.length === 0 ? (
                <p className="no-predictions">No overflow predictions — bins are stable.</p>
            ) : (
                <>
                    {urgent.length > 0 && (
                        <div className="prediction-group">
                            <div className="group-label urgent">🔴 Critical (&lt;6h)</div>
                            {urgent.map(b => (
                                <div key={b.fullId || b.id} className="prediction-row urgent-row">
                                    <span className="pred-bin-id">Bin {(b.fullId || b.id).substring(0, 8)}</span>
                                    <div className="pred-bar-bg">
                                        <div className="pred-bar" style={{ width: `${b.level}%`, background: '#ef4444' }} />
                                    </div>
                                    <span className="pred-time">{getTimeLabel(b.prediction!.hours_until_overflow)}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {soon.length > 0 && (
                        <div className="prediction-group">
                            <div className="group-label warning">🟡 Soon (6-24h)</div>
                            {soon.map(b => (
                                <div key={b.fullId || b.id} className="prediction-row">
                                    <span className="pred-bin-id">Bin {(b.fullId || b.id).substring(0, 8)}</span>
                                    <div className="pred-bar-bg">
                                        <div className="pred-bar" style={{ width: `${b.level}%`, background: '#eab308' }} />
                                    </div>
                                    <span className="pred-time">{getTimeLabel(b.prediction!.hours_until_overflow)}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {safe.length > 0 && (
                        <div className="prediction-group">
                            <div className="group-label safe">🟢 Safe (&gt;24h)</div>
                            {safe.slice(0, 5).map(b => (
                                <div key={b.fullId || b.id} className="prediction-row">
                                    <span className="pred-bin-id">Bin {(b.fullId || b.id).substring(0, 8)}</span>
                                    <div className="pred-bar-bg">
                                        <div className="pred-bar" style={{ width: `${b.level}%`, background: '#22c55e' }} />
                                    </div>
                                    <span className="pred-time">{getTimeLabel(b.prediction!.hours_until_overflow)}</span>
                                </div>
                            ))}
                            {safe.length > 5 && (
                                <p className="more-bins">+{safe.length - 5} more bins safe</p>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PredictionTimeline;
