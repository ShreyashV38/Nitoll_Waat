import React from 'react';
import '../style/StateCard.css';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  danger?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, danger }) => {
  return (
    <div className={`stat-card ${danger ? 'danger' : ''}`}>
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-subtitle">{subtitle}</div>
    </div>
  );
};

export default StatCard;