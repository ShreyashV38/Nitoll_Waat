// src/services/routeEngine.js
const { predictBinOverflow } = require('./predictionEngine');

// Configuration
const CONFIG = {
    COLLECTION_WINDOW_HOURS: 24,
    FILL_THRESHOLD_CRITICAL: 50, // User requested 50%
    FILL_THRESHOLD_WARNING: 45,  // Kept as a buffer (optional)
    PRIORITY_WEIGHTS: {
        CRITICAL: 100,
        CRITICAL_SOON: 80,
        WARNING: 70,
        PREDICTED_OVERFLOW: 60,
        BLOCKED_VIEW: 40
        // removed NORMAL priority
    }
};

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function generateRoute(startLocation, endLocation, bins) {
    const selectedBins = [];
    const excludedBins = [];
    const predictions = new Map();

    console.log(`\n=== Route Generation Started ===`);
    console.log(`Total bins to analyze: ${bins.length}`);

    // Analyze each bin
    bins.forEach(bin => {
        const readings = bin.readings || [];
        const analysis = predictBinOverflow(bin.id, readings);
        predictions.set(bin.id, analysis);

        bin.fill = parseFloat(bin.current_fill_percent) || 0.0;
        bin.weight = parseFloat((readings[0] && readings[0].weight) || 0);
        bin.prediction = analysis;

        // --- FILTERING LOGIC (STRICT) ---

        if (analysis.status === "BLOCKED_VIEW") {
            bin.reason = "SENSOR_BLOCKED";
            bin.priority = CONFIG.PRIORITY_WEIGHTS.BLOCKED_VIEW;
            bin.urgency = "MEDIUM";
            selectedBins.push(bin);
        }
        else if (analysis.status === "CRITICAL" || analysis.status === "CRITICAL_SOON") {
            // ✅ Include: AI predicts it will be full very soon (<6h) OR >90% full safely
            bin.reason = "PREDICTED_CRITICAL";
            bin.priority = CONFIG.PRIORITY_WEIGHTS.CRITICAL_SOON;
            bin.urgency = "HIGH";
            selectedBins.push(bin);
        }
        else if (analysis.status === "PREDICTED_OVERFLOW") {
            // ✅ Include: AI predicts overflow within 24h (today)
            bin.reason = "PREDICTED_OVERFLOW";
            bin.priority = CONFIG.PRIORITY_WEIGHTS.PREDICTED_OVERFLOW;
            bin.urgency = "MEDIUM";
            selectedBins.push(bin);
        }
        else if (bin.fill >= 90) {
            // Failsafe: If >90% full, collect it anyway
            bin.reason = `CRITICAL_FILL_${Math.round(bin.fill)}%`;
            bin.priority = CONFIG.PRIORITY_WEIGHTS.CRITICAL;
            bin.urgency = "HIGH";
            selectedBins.push(bin);
        }
        else {
            // ❌ EXCLUDE: If it won't overflow today, completely remove from route
            // Even if it's 50% or 60% full, we leave it for tomorrow's trip!
            bin.reason = "NOT_OVERFLOWING_TODAY";
            bin.priority = 0;
            excludedBins.push(bin);
        }
    });

    console.log(`Selected: ${selectedBins.length}, Skipped: ${excludedBins.length}`);

    // Sort selected bins by priority initially
    selectedBins.sort((a, b) => b.priority - a.priority);

    // --- NEAREST NEIGHBOR ALGORITHM ---
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

        unvisited.forEach((bin, idx) => {
            const distance = getDistance(
                currentPos.latitude,
                currentPos.longitude,
                bin.latitude,
                bin.longitude
            );

            // Normalize distance (5km baseline)
            const normalizedDistance = Math.min(distance / 5000, 1);

            // Priority vs Distance Weighting
            // Allows picking a "Predicted" bin nearby over a "Critical" bin far away
            const distancePenalty = normalizedDistance * 60;

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
        blocked_bins: [],
        meta: {
            total_stops: finalRoute.length,
            bins_to_collect: selectedBins.length,
            bins_blocked: 0,
            bins_monitored: excludedBins.length,
            critical_now: selectedBins.filter(b => b.urgency === "HIGH").length,
            predicted_soon: selectedBins.filter(b => b.urgency === "MEDIUM").length
        }
    };
}

module.exports = { generateRoute };