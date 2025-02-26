import React, { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut} from 'react-chartjs-2';
// Registrar los elementos necesarios
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ChartDoughnut = React.memo((({chartItems}) => {
     // ================================
  // Gráfico 3: Doughnut - Distribución de visitas por usuario
  // Clasificamos a los usuarios según su contador de visitas:
  //   - Bajas: menos de 5
  //   - Medias: entre 5 y 9
  //   - Altas: 10 o más
  // ================================
  const visitDistribution = useMemo(() => {
    const distribution = { Low: 0, Medium: 0, High: 0 };
    chartItems.forEach((item) => {
      const visits = item.visits;
      if (visits < 5) {
        distribution.Low += 1;
      } else if (visits < 10) {
        distribution.Medium += 1;
      } else {
        distribution.High += 1;
      }
    });
    return distribution;
  }, [chartItems]);

  const chartDataDoughnut = useMemo(() => ({
    labels: ['Bajas (<5)', 'Medias (5-9)', 'Altas (>=10)'],
    datasets: [
      {
        label: 'Distribución de visitas',
        data: [
          visitDistribution.Low,
          visitDistribution.Medium,
          visitDistribution.High,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }), [visitDistribution]);

  const chartOptionsDoughnut = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { display: true, position: 'bottom' },
      title: {
        display: true,
        text: 'Distribución de visitas por usuario',
      },
    },
  }), []);

    return (
      <div className="charts">
                  <Doughnut data={chartDataDoughnut} options={chartOptionsDoughnut} />
                </div>
    )
}))

export default ChartDoughnut