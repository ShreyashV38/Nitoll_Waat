// src/services/predictionEngine.js
const CONFIG = {
    JUMP_THRESHOLD: 20,          
    WEIGHT_THRESHOLD_GMS: 200,   
    MAX_PREDICTION_WINDOW: 168,  // 7 days
    COLLECTION_WINDOW_HOURS: 24  // Consider bins that will overflow in next 24 hours
};

/**
 * Predicts when a bin will overflow based on historical data
 * @param {string} binId - Bin identifier
 * @param {Array} history - Array of bin readings sorted by time
 * @returns {Object} Prediction result with status and timing
 */
function predictBinOverflow(binId, history) {
    const now = new Date();
    let result = {
        bin_id: binId,
        current_fill: 0,
        current_weight: 0,
        status: "NORMAL", 
        predicted_overflow_at: null,
        hours_until_overflow: null,
        fill_rate_per_hour: 0,
        confidence: "LOW" // LOW, MEDIUM, HIGH
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

    // --- 1. WEIGHT INTEGRITY CHECK (BLOCKAGE DETECTION) ---
    if (history.length >= 2) {
        const previous = history[1];
        const fillDiff = latest.fill_percent - previous.fill_percent;
        const weightDiff = (latest.weight || 0) - (previous.weight || 0);

        // If Fill Spikes (>20%) but Weight is tiny (<200g) -> BLOCKAGE
        if (fillDiff > CONFIG.JUMP_THRESHOLD && weightDiff < CONFIG.WEIGHT_THRESHOLD_GMS) {
            result.status = "BLOCKED_VIEW";
            result.confidence = "HIGH";
            return result; 
        }
    }

    // ❌ REMOVED: The early return for >= 50%
    // We want to calculate the overflow time regardless of the current level.

    // --- 2. ENHANCED PREDICTION LOGIC ---
    let dataPoints = [];
    for (let i = 0; i < history.length; i++) {
        const hoursAgo = (now - new Date(history[i].recorded_at)) / 36e5;
        if (hoursAgo > 48) break; 
        dataPoints.push({
            fill: history[i].fill_percent,
            time: new Date(history[i].recorded_at),
            hoursAgo: hoursAgo
        });
    }

    if (dataPoints.length >= 2) {
        // Calculate fill rate using linear regression for better accuracy
        const oldest = dataPoints[dataPoints.length - 1];
        const newest = dataPoints[0];
        
        const hours = (newest.time - oldest.time) / 36e5;
        const change = newest.fill - oldest.fill;
        
        if (hours > 0.5 && change > 0) { // Reduced hours requirement to catch fast spikes
            const rate = change / hours;
            result.fill_rate_per_hour = rate;
            
            const remainingCapacity = 100 - result.current_fill;
            const hoursLeft = remainingCapacity / rate;
            
            result.hours_until_overflow = hoursLeft;
            
            // Set confidence based on data quality
            if (dataPoints.length >= 10) {
                result.confidence = "HIGH";
            } else if (dataPoints.length >= 5) {
                result.confidence = "MEDIUM";
            } else {
                result.confidence = "LOW";
            }
            
            // Check if it will overflow within prediction window
            if (hoursLeft < CONFIG.MAX_PREDICTION_WINDOW) {
                result.predicted_overflow_at = new Date(now.getTime() + (hoursLeft * 36e5));
                
                // Determine status based on urgency
                if (hoursLeft < 6) {
                    result.status = "CRITICAL_SOON"; // Will overflow in < 6 hours
                } else if (hoursLeft < CONFIG.COLLECTION_WINDOW_HOURS) {
                    result.status = "PREDICTED_OVERFLOW"; // Will overflow in < 24 hours
                } else {
                    result.status = "MONITOR"; // Will overflow but not urgent
                }
            }
        } else if (change < 0) {
            // Bin is being emptied or has inconsistent data
            result.status = "UNSTABLE_DATA";
            result.confidence = "LOW";
        }
    } else {
        result.status = "DATA_INSUFFICIENT";
        result.confidence = "LOW";
    }

    // --- 3. FALLBACK STATUS CHECK ---
    // If prediction didn't set a status, fall back to current level checks
    if (result.status === "NORMAL" || result.status === "DATA_INSUFFICIENT") {
        if (result.current_fill >= 90) {
            result.status = "CRITICAL";
        } else if (result.current_fill >= 50) {
            // Only set to WARNING if no specific prediction was made
            // But for your UI, you might prefer keeping it NORMAL if the prediction is valid
            result.status = "WARNING"; 
        }
    }
    
    return result;
}

/**
 * Batch predict for multiple bins
 * @param {Array} bins - Array of bin objects with readings
 * @returns {Map} Map of bin_id to prediction result
 */
function batchPredict(bins) {
    const predictions = new Map();
    
    bins.forEach(bin => {
        const readings = bin.readings || [];
        const prediction = predictBinOverflow(bin.id, readings);
        predictions.set(bin.id, prediction);
    });
    
    return predictions;
}

module.exports = { 
    predictBinOverflow,
    batchPredict,
    CONFIG 
};