const { predictBinOverflow } = require('./predictionEngine');

// Configuration
const CONFIG = {
    COLLECTION_WINDOW_HOURS: 24,  // Include bins that will overflow in next 24 hours
    PRIORITY_WEIGHTS: {
        CRITICAL: 100,           // Currently >= 90%
        CRITICAL_SOON: 80,       // Will overflow in < 6 hours
        PREDICTED_OVERFLOW: 60,  // Will overflow in < 24 hours
        BLOCKED_VIEW: 40         // Sensor blocked
    }
};

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; 
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
}

/**
 * Generates optimized collection route based on predictions
 * @param {Object} startLocation - Driver's current location
 * @param {Object} endLocation - Dumping zone location
 * @param {Array} bins - Array of bin objects with readings
 * @returns {Object} Optimized route with categorized bins
 */
function generateRoute(startLocation, endLocation, bins) {
    const selectedBins = [];
    const excludedBins = [];
    const blockedBins = [];
    const predictions = new Map();

    console.log(`\n=== Route Generation Started ===`);
    console.log(`Total bins to analyze: ${bins.length}`);

    // Analyze each bin
    bins.forEach(bin => {
        const readings = bin.readings || [];
        const analysis = predictBinOverflow(bin.id, readings);
        predictions.set(bin.id, analysis);

        // Prepare bin data
        bin.fill = parseFloat(bin.current_fill_percent) || 0.0;
        bin.weight = parseFloat(readings[0]?.weight) || 0.0;
        bin.prediction = analysis;

        console.log(`Bin ${bin.id.substring(0, 8)}: Fill=${bin.fill}%, Status=${analysis.status}, Hours until overflow=${analysis.hours_until_overflow?.toFixed(1) || 'N/A'}`);

        // Categorize bins based on prediction
        if (analysis.status === "BLOCKED_VIEW") {
            bin.reason = "SENSOR_BLOCKED";
            bin.priority = CONFIG.PRIORITY_WEIGHTS.BLOCKED_VIEW;
            blockedBins.push(bin);
        } 
        else if (analysis.status === "CRITICAL") {
            bin.reason = "CRITICAL_NOW";
            bin.priority = CONFIG.PRIORITY_WEIGHTS.CRITICAL;
            bin.urgency = "HIGH";
            selectedBins.push(bin);
        } 
        else if (analysis.status === "CRITICAL_SOON") {
            // Will overflow in < 6 hours - HIGH PRIORITY
            bin.reason = `CRITICAL_IN_${Math.ceil(analysis.hours_until_overflow)}H`;
            bin.priority = CONFIG.PRIORITY_WEIGHTS.CRITICAL_SOON;
            bin.urgency = "HIGH";
            selectedBins.push(bin);
        }
        else if (analysis.status === "PREDICTED_OVERFLOW") {
            // Will overflow within collection window (24h)
            bin.reason = `OVERFLOW_IN_${Math.ceil(analysis.hours_until_overflow)}H`;
            bin.priority = CONFIG.PRIORITY_WEIGHTS.PREDICTED_OVERFLOW;
            bin.urgency = "MEDIUM";
            selectedBins.push(bin);
        }
        else {
            // Normal bins - not urgent
            bin.reason = "NOT_URGENT";
            bin.priority = 0;
            excludedBins.push(bin);
        }
    });

    console.log(`\nBins selected for collection: ${selectedBins.length}`);
    console.log(`Blocked bins: ${blockedBins.length}`);
    console.log(`Excluded bins: ${excludedBins.length}`);

    // Sort selected bins by priority (highest first)
    selectedBins.sort((a, b) => b.priority - a.priority);

    // --- OPTIMIZED NEAREST NEIGHBOR WITH PRIORITY ---
    let currentPos = startLocation;
    let unvisited = [...selectedBins];
    const finalRoute = [];

    // Add start point
    finalRoute.push({
        type: 'START',
        name: 'Your Location',
        latitude: startLocation.latitude,
        longitude: startLocation.longitude
    });

    while (unvisited.length > 0) {
        let selectedBin = null;
        let selectedIdx = -1;
        let bestScore = -Infinity;

        // Find best bin using weighted score (priority + proximity)
        unvisited.forEach((bin, idx) => {
            const distance = getDistance(
                currentPos.latitude, 
                currentPos.longitude, 
                bin.latitude, 
                bin.longitude
            );

            // Normalize distance (assume max 10km for normalization)
            const normalizedDistance = Math.min(distance / 10000, 1);
            
            // Score = Priority - Distance Penalty
            // Higher priority bins preferred, but distance matters
            const distancePenalty = normalizedDistance * 20;
            const score = bin.priority - distancePenalty;

            if (score > bestScore) {
                bestScore = score;
                selectedBin = bin;
                selectedIdx = idx;
            }
        });

        if (selectedBin) {
            finalRoute.push({
                type: 'COLLECTION_POINT',
                bin_id: selectedBin.id,
                name: selectedBin.area_name || "Bin",
                latitude: selectedBin.latitude,
                longitude: selectedBin.longitude,
                fill: selectedBin.fill,
                weight: selectedBin.weight,
                reason: selectedBin.reason,
                urgency: selectedBin.urgency || "MEDIUM",
                predicted_overflow_at: selectedBin.prediction.predicted_overflow_at,
                hours_until_overflow: selectedBin.prediction.hours_until_overflow
            });
            
            currentPos = { 
                latitude: selectedBin.latitude, 
                longitude: selectedBin.longitude 
            };
            unvisited.splice(selectedIdx, 1);
        }
    }

    // Add end point
    finalRoute.push({
        type: 'END',
        name: endLocation.name || "Dumping Zone",
        latitude: endLocation.latitude,
        longitude: endLocation.longitude
    });

    console.log(`\nFinal route has ${finalRoute.length} stops (including start/end)`);
    console.log(`=== Route Generation Complete ===\n`);

    // Return comprehensive route data
    return {
        route_points: finalRoute,
        other_bins: excludedBins.map(b => ({
            bin_id: b.id,
            name: b.area_name || "Bin",
            latitude: b.latitude,
            longitude: b.longitude,
            fill: b.fill,
            weight: b.weight,
            reason: "Not Critical",
            current_status: b.prediction.status,
            hours_until_overflow: b.prediction.hours_until_overflow
        })),
        blocked_bins: blockedBins.map(b => ({
            bin_id: b.id,
            name: b.area_name || "Bin",
            latitude: b.latitude,
            longitude: b.longitude,
            fill: b.fill,
            weight: b.weight,
            reason: "Sensor Blocked"
        })),
        meta: {
            total_stops: finalRoute.length,
            bins_to_collect: selectedBins.length,
            bins_blocked: blockedBins.length,
            bins_monitored: excludedBins.length,
            critical_now: selectedBins.filter(b => b.urgency === "HIGH").length,
            predicted_soon: selectedBins.filter(b => b.urgency === "MEDIUM").length
        }
    };
}

module.exports = { generateRoute };