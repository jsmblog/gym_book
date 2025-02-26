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
import { Pie } from 'react-chartjs-2';
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

const ChartPie = React.memo((({chartItems}) => {
    // ================================
  // Gráfico 4: Pie - Distribución por Género
  // ================================
  const genderDistribution = useMemo(() => {
    const distribution = {
      Masculino: 0,
      Femenino: 0,
      Otro: 0,
      Desconocido: 0,
    };
    chartItems.forEach((item) => {
      if (item.gender.toLowerCase() === 'masculino') {
        distribution.Masculino += 1;
      } else if (item.gender.toLowerCase() === 'femenino') {
        distribution.Femenino += 1;
      } else if (item.gender.toLowerCase() === 'Prefiero no decirlo') {
        distribution.Otro += 1;
      } else {
        distribution.Desconocido += 1;
      }
    });
    return distribution;
  }, [chartItems]);

  const chartDataPie = useMemo(() => ({
    labels: ['Masculino', 'Femenino', 'Otro', 'Desconocido'],
    datasets: [
      {
        label: 'Usuarios por género',
        data: [
          genderDistribution.Masculino,
          genderDistribution.Femenino,
          genderDistribution.Otro,
          genderDistribution.Desconocido,
        ],
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#999999'],
        borderColor: ['#1E88E5', '#D81B60', '#F4C542', '#666666'],
        borderWidth: 1,
      },
    ],
  }), [genderDistribution]);

  const chartOptionsPie = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { display: true, position: 'bottom' },
      title: { display: true, text: 'Distribución de usuarios por género' },
    },
  }), []);

    return (
        <div className="charts">
        <Pie data={chartDataPie} options={chartOptionsPie} />
      </div>
    )
}))

export default ChartPie