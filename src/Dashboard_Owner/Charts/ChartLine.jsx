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
import {Line} from 'react-chartjs-2';

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

const ChartLine = React.memo((({chartItems}) => {
    // ================================
      // Gráfico 2: Línea - Nuevos visitantes por mes
      // Usamos la fecha de la primera visita (stat.c) para agrupar por mes
      // ================================
      const visitorsByMonth = useMemo(() => {
        const groups = {};
        chartItems.forEach((item) => {
          const date = new Date(item.firstVisit);
          if (!isNaN(date.getTime())) {
            const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;
            groups[monthYear] = (groups[monthYear] || 0) + 1;
          }
        });
        return groups;
      }, [chartItems]);
    
      const chartDataLine = useMemo(() => {
        const labels = Object.keys(visitorsByMonth).sort((a, b) => {
          const [monthA, yearA] = a.split('-').map(Number);
          const [monthB, yearB] = b.split('-').map(Number);
          if (yearA === yearB) return monthA - monthB;
          return yearA - yearB;
        });
        const data = labels.map((label) => visitorsByMonth[label]);
        return {
          labels,
          datasets: [
            {
              label: 'Nuevos visitantes',
              data,
              fill: false,
              borderColor: 'rgba(153, 102, 255, 1)',
              backgroundColor: 'rgba(153, 102, 255, 0.4)',
              tension: 0.2,
            },
          ],
        };
      }, [visitorsByMonth]);
    
      const chartOptionsLine = useMemo(() => ({
        responsive: true,
        plugins: {
          legend: { display: true },
          title: { display: true, text: 'Nuevos visitantes por mes' },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
          },
        },
      }), []);
    
      
  return (
    <div className="charts">
                <Line data={chartDataLine} options={chartOptionsLine} />
              </div>
  )
}))

export default ChartLine