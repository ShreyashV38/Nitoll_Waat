// ==============================================
// GOA TALUKA BOUNDARY POLYGONS
// Approximate boundary coordinates for Leaflet Polygon
// Colors are curated for visual distinction
// ==============================================

export interface TalukaBoundary {
    name: string;
    color: string;
    fillColor: string;
    coordinates: [number, number][]; // [lat, lng] pairs
}

const GOA_BOUNDARIES: Record<string, TalukaBoundary> = {
    // ============ NORTH GOA ============
    "Tiswadi": {
        name: "Tiswadi",
        color: "#2563eb",   // Blue
        fillColor: "#3b82f6",
        coordinates: [
            [15.5400, 73.8200], [15.5200, 73.7800], [15.4900, 73.7700],
            [15.4600, 73.7900], [15.4400, 73.8200], [15.4500, 73.8600],
            [15.4700, 73.8900], [15.5000, 73.9100], [15.5200, 73.8800],
            [15.5400, 73.8500], [15.5400, 73.8200]
        ]
    },
    "Bardez": {
        name: "Bardez",
        color: "#059669",   // Emerald
        fillColor: "#10b981",
        coordinates: [
            [15.6200, 73.7400], [15.5900, 73.7200], [15.5500, 73.7300],
            [15.5200, 73.7500], [15.5100, 73.7800], [15.5200, 73.8200],
            [15.5400, 73.8200], [15.5700, 73.8100], [15.5900, 73.7900],
            [15.6100, 73.7700], [15.6200, 73.7400]
        ]
    },
    "Pernem": {
        name: "Pernem",
        color: "#7c3aed",   // Violet
        fillColor: "#8b5cf6",
        coordinates: [
            [15.7500, 73.7200], [15.7300, 73.6800], [15.7000, 73.6600],
            [15.6600, 73.6800], [15.6300, 73.7000], [15.6100, 73.7400],
            [15.6200, 73.7600], [15.6500, 73.7800], [15.6900, 73.7700],
            [15.7200, 73.7500], [15.7500, 73.7200]
        ]
    },
    "Bicholim": {
        name: "Bicholim",
        color: "#dc2626",   // Red
        fillColor: "#ef4444",
        coordinates: [
            [15.6200, 73.9600], [15.6000, 73.9200], [15.5700, 73.8900],
            [15.5400, 73.8800], [15.5200, 73.9000], [15.5100, 73.9400],
            [15.5300, 73.9800], [15.5600, 74.0000], [15.5900, 73.9900],
            [15.6100, 73.9800], [15.6200, 73.9600]
        ]
    },
    "Sattari": {
        name: "Sattari",
        color: "#ca8a04",   // Yellow-dark
        fillColor: "#eab308",
        coordinates: [
            [15.6500, 74.1000], [15.6300, 74.0600], [15.6000, 74.0200],
            [15.5700, 74.0000], [15.5400, 74.0100], [15.5200, 74.0400],
            [15.5100, 74.0800], [15.5300, 74.1200], [15.5600, 74.1400],
            [15.5900, 74.1300], [15.6200, 74.1200], [15.6500, 74.1000]
        ]
    },
    "Ponda": {
        name: "Ponda",
        color: "#ea580c",   // Orange
        fillColor: "#f97316",
        coordinates: [
            [15.4800, 74.0200], [15.4600, 73.9800], [15.4300, 73.9600],
            [15.4000, 73.9700], [15.3800, 74.0000], [15.3700, 74.0400],
            [15.3900, 74.0700], [15.4200, 74.0800], [15.4500, 74.0600],
            [15.4700, 74.0400], [15.4800, 74.0200]
        ]
    },

    // ============ SOUTH GOA ============
    "Salcete": {
        name: "Salcete",
        color: "#0891b2",   // Cyan
        fillColor: "#06b6d4",
        coordinates: [
            [15.3800, 73.8800], [15.3600, 73.8500], [15.3300, 73.8300],
            [15.3000, 73.8400], [15.2700, 73.8600], [15.2600, 73.8900],
            [15.2700, 73.9200], [15.3000, 73.9500], [15.3300, 73.9600],
            [15.3600, 73.9400], [15.3800, 73.9100], [15.3800, 73.8800]
        ]
    },
    "Mormugao": {
        name: "Mormugao",
        color: "#be185d",   // Pink
        fillColor: "#ec4899",
        coordinates: [
            [15.4200, 73.8200], [15.4000, 73.7900], [15.3800, 73.7700],
            [15.3600, 73.7800], [15.3500, 73.8000], [15.3600, 73.8300],
            [15.3800, 73.8500], [15.4000, 73.8500], [15.4100, 73.8400],
            [15.4200, 73.8200]
        ]
    },
    "Quepem": {
        name: "Quepem",
        color: "#4f46e5",   // Indigo
        fillColor: "#6366f1",
        coordinates: [
            [15.2800, 73.9800], [15.2600, 73.9500], [15.2300, 73.9300],
            [15.2000, 73.9400], [15.1800, 73.9700], [15.1700, 74.0100],
            [15.1900, 74.0400], [15.2200, 74.0500], [15.2500, 74.0300],
            [15.2700, 74.0100], [15.2800, 73.9800]
        ]
    },
    "Canacona": {
        name: "Canacona",
        color: "#0d9488",   // Teal
        fillColor: "#14b8a6",
        coordinates: [
            [15.0500, 74.0800], [15.0300, 74.0400], [15.0000, 74.0200],
            [14.9700, 74.0300], [14.9500, 74.0600], [14.9400, 74.1000],
            [14.9600, 74.1300], [14.9900, 74.1400], [15.0200, 74.1200],
            [15.0400, 74.1000], [15.0500, 74.0800]
        ]
    },
    "Sanguem": {
        name: "Sanguem",
        color: "#65a30d",   // Lime
        fillColor: "#84cc16",
        coordinates: [
            [15.3000, 74.1200], [15.2800, 74.0800], [15.2500, 74.0500],
            [15.2200, 74.0600], [15.1900, 74.0900], [15.1700, 74.1300],
            [15.1500, 74.1700], [15.1700, 74.2000], [15.2000, 74.2100],
            [15.2400, 74.1900], [15.2700, 74.1600], [15.3000, 74.1200]
        ]
    },
    "Dharbandora": {
        name: "Dharbandora",
        color: "#9333ea",   // Purple
        fillColor: "#a855f7",
        coordinates: [
            [15.3800, 74.1200], [15.3600, 74.0800], [15.3300, 74.0600],
            [15.3000, 74.0700], [15.2800, 74.1000], [15.2700, 74.1400],
            [15.2900, 74.1700], [15.3200, 74.1800], [15.3500, 74.1600],
            [15.3700, 74.1400], [15.3800, 74.1200]
        ]
    }
};

export default GOA_BOUNDARIES;

// Helper: find the boundary for a given area name by matching its taluka
export function findBoundaryForArea(taluka: string): TalukaBoundary | null {
    return GOA_BOUNDARIES[taluka] || null;
}

/**
 * Ray-casting algorithm to check if a point is inside a polygon.
 * Returns true if [lat, lng] is inside the given taluka boundary.
 */
export function isPointInBoundary(lat: number, lng: number, taluka: string): boolean {
    const boundary = GOA_BOUNDARIES[taluka];
    if (!boundary) return true; // If no boundary defined, allow placement

    const polygon = boundary.coordinates;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [yi, xi] = polygon[i];
        const [yj, xj] = polygon[j];

        const intersect = ((yi > lat) !== (yj > lat))
            && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}
