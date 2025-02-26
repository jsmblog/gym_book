// ChartBar.jsx
import React, { useMemo } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
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
import { Bar } from 'react-chartjs-2';

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

const ChartBarI = React.memo(({ chartItems, chartData, title }) => {
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
            backgroundColor: 'rgba(75,192,192,0.4)',
            borderColor: 'rgba(75,192,192,1)',
            borderWidth: 1,
          },
        ],
      };
    }
    return { labels: [], datasets: [] };
  }, [chartItems, chartData]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: { display: true },
        title: { display: true, text: title || 'Gráfico de Barras' },
        tooltip: {
          enabled: false,
          external: (context) => {
            const { chart, tooltip } = context;
            let tooltipEl = chart.canvas.parentNode.querySelector(
              'div.custom-tooltip'
            );
            if (!tooltipEl) {
              tooltipEl = document.createElement('div');
              tooltipEl.classList.add('custom-tooltip');
              tooltipEl.style.position = 'absolute';
              tooltipEl.style.background = '#fff';
              tooltipEl.style.border = '1px solid #ccc';
              tooltipEl.style.borderRadius = '6px';
              tooltipEl.style.padding = '8px';
              tooltipEl.style.pointerEvents = 'none';
              tooltipEl.style.zIndex = 999;
              chart.canvas.parentNode.appendChild(tooltipEl);
            }
            if (tooltip.opacity === 0) {
              tooltipEl.style.opacity = 0;
              return;
            }
            const index = tooltip.dataPoints[0].dataIndex;
            const item = chartItems ? chartItems[index] : null;
            tooltipEl.innerHTML = item
              ? `
                <div style="display: flex; align-items: center;">
                  <img 
                    src="${item.image}" 
                    alt="Foto usuario" 
                    style="width: 50px; height: 50px; object-fit: cover; margin-right: 8px; border-radius: 50%;" 
                  />
                  <div>
                    <strong>${item.label} - ${item.age} años</strong><br/>
                    Sexo: ${item.gender}<br/>
                    Contacto: ${item.telf}<br/>
                    Visitas: ${item.visits}<br/>
                    Primer visita: ${item.firstVisit}<br/>
                    Última visita: ${item.lastVisit}
                  </div>
                </div>
              `
              : `<div>${title}</div>`;
            const { offsetLeft, offsetTop } = chart.canvas;
            tooltipEl.style.opacity = 1;
            tooltipEl.style.left = offsetLeft + tooltip.caretX + 'px';
            tooltipEl.style.top = offsetTop + tooltip.caretY + 'px';
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 },
        },
      },
    }),
    [chartItems, title]
  );
  return (
    <div className="charts">
      <Bar data={computedData} options={chartOptions} />
    </div>
  );
});

export default ChartBarI;
