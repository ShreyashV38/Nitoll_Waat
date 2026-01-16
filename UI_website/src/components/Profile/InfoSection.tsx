import React from "react";
import "../../style/Profile.css";

interface InfoItem {
  label: string;
  value: string;
}

interface Props {
  title: string;
  items: InfoItem[];
}

const InfoSection: React.FC<Props> = ({ title, items }) => {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="info-row" style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {items.map((item, idx) => (
          <div key={idx} className="info-box">
            <label>{item.label}</label>
            <p>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoSection;