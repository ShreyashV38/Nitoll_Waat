import React from "react";
import type { Bin } from "../../pages/MapsBinsPage"; 
import "../../style/MapsBinsPage.css"; 

interface Props {
  bins: Bin[];
}

// --- HELPER: Format Weight ---
const formatWeight = (grams: number) => {
    if (grams >= 1000) {
        // Convert to kg if 1000g or more
        return `${(grams / 1000).toFixed(2)} kg`;
    }
    // Show grams otherwise
    return `${Math.round(grams)} g`;
};

const BinDirectory: React.FC<Props> = ({ bins }) => {
  return (
    <div className="directory-container" style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
      <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#334155" }}>Bin Directory ({bins.length})</h3>
      
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
            <th style={{ padding: "12px", color: "#64748b" }}>ID</th>
            <th style={{ padding: "12px", color: "#64748b" }}>Location</th>
            <th style={{ padding: "12px", color: "#64748b" }}>Fill Level</th>
            {/* REMOVED (kg) FROM HEADER */}
            <th style={{ padding: "12px", color: "#64748b" }}>Weight</th> 
            <th style={{ padding: "12px", color: "#64748b" }}>Lid</th>
            <th style={{ padding: "12px", color: "#64748b" }}>Status</th>
            <th style={{ padding: "12px", color: "#64748b" }}>Updated</th>
          </tr>
        </thead>
        <tbody>
          {bins.map((bin) => (
            <tr key={bin.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "12px", fontFamily: "monospace" }}>{bin.id.substring(0, 6)}...</td>
              <td style={{ padding: "12px" }}>{bin.address}</td>
              
              <td style={{ padding: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "40px", height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ 
                            width: `${bin.level}%`, height: "100%", 
                            background: bin.level > 90 ? "#ef4444" : bin.level > 70 ? "#f97316" : "#22c55e" 
                        }} />
                    </div>
                    <span>{bin.level}%</span>
                </div>
              </td>

              {/* APPLIED DYNAMIC FORMATTING */}
              <td style={{ padding: "12px", fontWeight: "bold" }}>{formatWeight(bin.weight)}</td>

              <td style={{ padding: "12px" }}>
                  <span style={{ 
                      padding: "2px 8px", borderRadius: "12px", fontSize: "12px",
                      background: bin.lid === "OPEN" ? "#fff7ed" : "#f0fdf4",
                      color: bin.lid === "OPEN" ? "#c2410c" : "#15803d",
                      border: `1px solid ${bin.lid === "OPEN" ? "#ffedd5" : "#dcfce7"}`
                  }}>
                      {bin.lid}
                  </span>
              </td>

              <td style={{ padding: "12px" }}>
                <span className={`status-badge ${bin.status.toLowerCase()}`}>{bin.status}</span>
              </td>
              
              <td style={{ padding: "12px", color: "#94a3b8", fontSize: "13px" }}>{bin.lastUpdated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BinDirectory;