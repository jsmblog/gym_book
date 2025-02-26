// GenderAgeChart.jsx
import React, { useMemo } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GenderAgeChart = React.memo((({ chartItems }) => {
    // Tamaño del intervalo en años
    const binSize = 10;
  
    // Extraer edades válidas para determinar el rango
    const validAges = chartItems
      .map(item => item.age)
      .filter(age => age !== undefined && age !== null && !isNaN(age));
      
    if (validAges.length === 0) {
      return <p>No hay datos de edades disponibles.</p>;
    }
    
    const minAge = Math.min(...validAges);
    const maxAge = Math.max(...validAges);
    
    // Definir inicio y fin de los intervalos
    const start = Math.floor(minAge / binSize) * binSize;
    const end = Math.ceil(maxAge / binSize) * binSize;
    
    // Crear etiquetas para cada intervalo (por ejemplo: "20-29", "30-39", etc.)
    const bins = [];
    for (let age = start; age < end; age += binSize) {
      bins.push(`${age}-${age + binSize - 1}`);
    }
    
    // Inicializar contadores para cada género en cada intervalo
    const genderGroups = {
      Masculino: new Array(bins.length).fill(0),
      Femenino: new Array(bins.length).fill(0),
      Otro: new Array(bins.length).fill(0),
    };
    
    // Recorrer los datos para asignar cada edad a su intervalo y aumentar el contador según el género
    chartItems.forEach(item => {
      const age = item.age;
      if (age === undefined || isNaN(age)) return;
      
      // Convertir el género a minúsculas para comparaciones sencillas
      const genderLower = item.gender ? item.gender.toLowerCase() : '';
      let group = 'Otro';
      if (genderLower.includes('masc')) {
        group = 'Masculino';
      } else if (genderLower.includes('fem')) {
        group = 'Femenino';
      }
      
      const binIndex = Math.floor((age - start) / binSize);
      if (binIndex >= 0 && binIndex < bins.length) {
        genderGroups[group][binIndex]++;
      }
    });
    
    // Preparar la data para el gráfico de barras agrupadas
    const data = {
      labels: bins,
      datasets: [
        {
          label: 'Masculino',
          data: genderGroups.Masculino,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: 'Femenino',
          data: genderGroups.Femenino,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
        {
          label: 'Otro',
          data: genderGroups.Otro,
          backgroundColor: 'rgba(201, 203, 207, 0.6)',
          borderColor: 'rgba(201, 203, 207, 1)',
          borderWidth: 1,
        },
      ],
    };
    
    const options = {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Distribución de Edades por Género' },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 },
        },
      },
    };
    
    return (
      <div className='charts'>
        <Bar data={data} options={options} />
      </div>
    );
  }));

export default GenderAgeChart;
