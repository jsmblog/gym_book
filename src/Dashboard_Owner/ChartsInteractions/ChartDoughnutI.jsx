// ChartDoughnut.jsx
import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const ChartDoughnutI = React.memo(({ chartItems, chartData, title }) => {
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
            backgroundColor: [
              'rgba(255, 99, 132, 0.4)',
              'rgba(54, 162, 235, 0.4)',
              'rgba(255, 206, 86, 0.4)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
            ],
            borderWidth: 1,
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
      title: { display: true, text: title || 'Gráfico Doughnut' },
    },
  };

  return (
    <div className="charts">
      <Doughnut data={computedData} options={options} />
    </div>
  );
});

export default ChartDoughnutI;
