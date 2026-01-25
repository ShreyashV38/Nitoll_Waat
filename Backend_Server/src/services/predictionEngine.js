// src/services/predictionEngine.js
const CONFIG = {
    JUMP_THRESHOLD: 20,          
    WEIGHT_THRESHOLD_GMS: 200,   
    MAX_PREDICTION_WINDOW: 168   
};

function predictBinOverflow(binId, history) {
    const now = new Date();
    let result = {
        bin_id: binId,
        current_fill: 0,
        current_weight: 0,
        status: "NORMAL", 
        predicted_overflow_at: null
    };

    if (!history || history.length === 0) {
        result.status = "DATA_INSUFFICIENT";
        return result;
    }
    
    // Sort: Newest First
    history.sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
    const latest = history[0];
    
    result.current_fill = latest.fill_percent;
    result.current_weight = latest.weight || 0;

    // --- 🛡️ 1. WEIGHT INTEGRITY CHECK (BLOCKAGE DETECTION) ---
    if (history.length >= 2) {
        const previous = history[1];
        const fillDiff = latest.fill_percent - previous.fill_percent;
        const weightDiff = (latest.weight || 0) - (previous.weight || 0);

        // If Fill Spikes (>20%) but Weight is tiny (<200g) -> BLOCKAGE
        if (fillDiff > CONFIG.JUMP_THRESHOLD && weightDiff < CONFIG.WEIGHT_THRESHOLD_GMS) {
            result.status = "BLOCKED_VIEW";
            return result; 
        }
    }

    // --- 2. CRITICAL CHECK ---
    if (result.current_fill >= 90) {
        result.status = "CRITICAL";
        return result;
    }

    // --- 3. PREDICTION LOGIC ---
    let oldest = null;
    for (let i = 1; i < history.length; i++) {
        const hoursAgo = (now - new Date(history[i].recorded_at)) / 36e5;
        if (hoursAgo > 48) break; 
        oldest = history[i];
    }

    if (oldest) {
        const hours = (new Date(latest.recorded_at) - new Date(oldest.recorded_at)) / 36e5;
        const change = latest.fill_percent - oldest.fill_percent;
        
        if (hours > 1 && change > 0) {
            const rate = change / hours;
            const hoursLeft = (100 - result.current_fill) / rate;
            if (hoursLeft < CONFIG.MAX_PREDICTION_WINDOW) {
                result.predicted_overflow_at = new Date(now.getTime() + (hoursLeft * 36e5));
                result.status = "PREDICTED_OVERFLOW";
            }
        }
    }
    
    return result;
}

module.exports = { predictBinOverflow };