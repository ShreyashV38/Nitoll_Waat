import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import '../../style/Dashboard.css'; // Re-use dashboard styles for the card

interface WasteData {
  day: string;
  total_weight: number;
}

interface Props {
  data: WasteData[];
}

const WasteChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="dashboard-card" style={{ height: '400px' }}>
      <div className="card-header">
        <h3>Waste Collection Trends</h3>
        <select style={{ padding: '6px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '12px' }}>
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
        </select>
      </div>

      <div style={{ flex: 1, width: '100%', minHeight: '300px' }}>
        {data.length === 0 ? (
          <div className="empty-feed" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            No data available for this week
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
              />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar 
                dataKey="total_weight" 
                fill="#22c55e" 
                radius={[6, 6, 0, 0]} 
                barSize={40}
                name="Waste (kg)"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default WasteChart;