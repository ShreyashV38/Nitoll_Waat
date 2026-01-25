const { predictBinOverflow } = require('./predictionEngine');

// 🔧 CONFIGURATION
const NEXT_COLLECTION_HOURS = 24; 

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

function generateRoute(startLocation, endLocation, bins) {
    const selectedBins = [];
    const excludedBins = [];
    const blockedBins = [];

    bins.forEach(bin => {
        // Handle case where readings might be null
        const readings = bin.readings || [];
        const analysis = predictBinOverflow(bin.id, readings);
        
        // Attach analysis to bin for UI

        bin.fill = parseFloat(bin.current_fill_percent) || 0.0;
        bin.weight = parseFloat(readings[0]?.weight) || 0.0;

        if (analysis.status === "BLOCKED_VIEW") {
            bin.reason = "SENSOR_BLOCKED";
            blockedBins.push(bin);
        } else if (analysis.status === "CRITICAL" || analysis.status === "PREDICTED_OVERFLOW") {
            bin.reason = analysis.status;
            selectedBins.push(bin);
        } else {
            excludedBins.push(bin);
        }
    });

    // --- NEAREST NEIGHBOR ALGORITHM ---
    let currentPos = startLocation;
    let unvisited = [...selectedBins];
    const finalRoute = [];

    // Start Point
    finalRoute.push({
        type: 'START',
        name: 'Start Location',
        latitude: startLocation.latitude,
        longitude: startLocation.longitude
    });

    while (unvisited.length > 0) {
        let nearest = null;
        let minDist = Infinity;
        let nearestIdx = -1;

        unvisited.forEach((bin, idx) => {
            const d = getDistance(currentPos.latitude, currentPos.longitude, bin.latitude, bin.longitude);
            if (d < minDist) {
                minDist = d;
                nearest = bin;
                nearestIdx = idx;
            }
        });

        if (nearest) {
            finalRoute.push({
                type: 'COLLECTION_POINT',
                bin_id: nearest.id,
                name: nearest.area_name || "Bin",
                latitude: nearest.latitude,
                longitude: nearest.longitude,
                fill: nearest.fill,
                weight: nearest.weight,
                reason: nearest.reason
            });
            currentPos = { latitude: nearest.latitude, longitude: nearest.longitude };
            unvisited.splice(nearestIdx, 1);
        }
    }

    // End Point (Dynamic Dumping Zone)
    finalRoute.push({
        type: 'END',
        name: endLocation.name || "Dumping Zone",
        latitude: endLocation.latitude,
        longitude: endLocation.longitude
    });

    // ✅ FIXED: Return all lists to prevent Android Crash
return {
        route_points: finalRoute,
        other_bins: excludedBins.map(b => ({
            bin_id: b.id,
            name: b.area_name || "Bin",
            latitude: b.latitude,
            longitude: b.longitude,
            fill: b.fill,
            weight: b.weight,
            reason: "Not Critical"
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
            bins_collected: selectedBins.length,
            bins_blocked: blockedBins.length
        }
    };
}

module.exports = { generateRoute };