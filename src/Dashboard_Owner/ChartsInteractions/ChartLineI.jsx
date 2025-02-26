// ChartLine.jsx
import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const ChartLineI = React.memo(({ chartItems, chartData, title }) => {
  const computedData = useMemo(() => {
    if (chartData) return chartData;
    if (chartItems) {
      const labels = chartItems.map((item) => item.label);
      const data = chartItems.map((item) => item.visits);
      return {
        labels,
        datasets: [
          {
            label: 'Visitas',
            data,
            fill: false,
            borderColor: 'rgba(75,192,192,1)',
          },
        ],
      };
    }
    return { labels: [], datasets: [] };
  }, [chartItems, chartData]);

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: title || 'Gráfico de Línea' },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
      },
    },
  };

  return (
    <div className="charts">
      <Line data={computedData} options={options} />
    </div>
  );
});

export default ChartLineI;
