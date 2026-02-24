import React, { useState } from "react";
import type { Bin } from "../../pages/MapsBinsPage";
import CalibrationModal from "./CalibrationModal";
import "../../style/MapsBinsPage.css";

interface Props {
  bins: Bin[];
  onRefresh?: () => void;
}

const formatWeight = (grams: number) => {
  if (grams >= 1000) return `${(grams / 1000).toFixed(2)} kg`;
  return `${Math.round(grams)} g`;
};

const BinDirectory: React.FC<Props> = ({ bins, onRefresh }) => {
  const [calibBin, setCalibBin] = useState<any>(null);

  return (
    <div className="directory-container" style={{ background: "var(--card-bg)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
      <h3 style={{ marginTop: 0, marginBottom: "20px", color: "var(--text-primary)" }}>Bin Directory ({bins.length})</h3>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--border-color)", textAlign: "left" }}>
            <th style={{ padding: "12px", color: "var(--text-muted)" }}>ID</th>
            <th style={{ padding: "12px", color: "var(--text-muted)" }}>Location</th>
            <th style={{ padding: "12px", color: "var(--text-muted)" }}>Fill Level</th>
            <th style={{ padding: "12px", color: "var(--text-muted)" }}>Weight</th>
            <th style={{ padding: "12px", color: "var(--text-muted)" }}>Lid</th>
            <th style={{ padding: "12px", color: "var(--text-muted)" }}>Status</th>
            <th style={{ padding: "12px", color: "var(--text-muted)" }}>Updated</th>
            <th style={{ padding: "12px", color: "var(--text-muted)" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bins.map((bin) => (
            <tr key={bin.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
              <td style={{ padding: "12px", fontFamily: "monospace", color: "var(--text-primary)" }}>{bin.id.substring(0, 6)}...</td>
              <td style={{ padding: "12px", color: "var(--text-secondary)" }}>{bin.address}</td>

              <td style={{ padding: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "40px", height: "6px", background: "var(--border-color)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{
                      width: `${bin.level}%`, height: "100%",
                      background: bin.level > 90 ? "#ef4444" : bin.level > 70 ? "#f97316" : "#22c55e"
                    }} />
                  </div>
                  <span style={{ color: "var(--text-primary)" }}>{bin.level}%</span>
                </div>
              </td>

              <td style={{ padding: "12px", fontWeight: "bold", color: "var(--text-primary)" }}>{formatWeight(bin.weight)}</td>

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

              <td style={{ padding: "12px", color: "var(--text-muted)", fontSize: "13px" }}>{bin.lastUpdated}</td>

              <td style={{ padding: "12px" }}>
                <button
                  onClick={() => setCalibBin(bin)}
                  title="Calibrate sensor"
                  style={{
                    padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border-color)',
                    background: 'transparent', cursor: 'pointer', fontSize: 13,
                    color: 'var(--text-muted)'
                  }}
                >
                  📐
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {calibBin && (
        <CalibrationModal
          bin={calibBin}
          onClose={() => setCalibBin(null)}
          onSaved={() => { setCalibBin(null); onRefresh?.(); }}
        />
      )}
    </div>
  );
};

export default BinDirectory;