import React from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

// ✅ 1. Define Props Interface
interface Props {
    data: number[];      // e.g., [120, 150, 180...]
    labels: string[];    // e.g., ["Mon", "Tue", "Wed"...]
}

const WasteChart: React.FC<Props> = ({ data, labels }) => {
    // ✅ 2. Dynamic Options
    const options: ApexOptions = {
        chart: {
            type: 'area',
            height: 350,
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif'
        },
        colors: ['#22c55e'], // Green color for waste/recycling
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        xaxis: {
            categories: labels, // ⬅️ Dynamic Labels
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            title: { text: 'Waste Collected (kg)' }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.3,
                stops: [0, 90, 100]
            }
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return val + " kg";
                }
            }
        }
    };

    // ✅ 3. Dynamic Series
    const series = [{
        name: 'Total Waste',
        data: data // ⬅️ Dynamic Data
    }];

    return (
        <div className="dashboard-card" style={{ height: '100%' }}>
            <h3>Waste Collection Trends</h3>
            <div className="chart-container">
                <ReactApexChart 
                    options={options} 
                    series={series} 
                    type="area" 
                    height={320} 
                />
            </div>
        </div>
    );
};

export default WasteChart;