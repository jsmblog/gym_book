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
import formatDate from './../../Js/formatDate';

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

const ChartBar = React.memo(({ chartItems }) => {
    // ================================
    // Gráfico 1: Barras - Visitas por usuario
    // ================================
    const chartData = useMemo(() => {
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
    }, [chartItems]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        plugins: {
            legend: { display: true },
            title: { display: true, text: 'Visitas por usuario' },
            // Tooltip personalizado para mostrar imagen y otros datos
            tooltip: {
                enabled: false,
                external: (context) => {
                    const { chart, tooltip } = context;
                    let tooltipEl = chart.canvas.parentNode.querySelector('div.custom-tooltip');
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
                    const item = chartItems[index];
                    tooltipEl.innerHTML = `
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
              `;
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
    }), [chartItems]);

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Visitas Usuarios');

        // Agregar encabezado con estilos
        const headerRow = worksheet.addRow([ 'Id' ,'Usuario', 'Edad', 'Género', 'Teléfono', 'Visitas', 'Primera Visita', 'Última Visita', 'URL Imagen']);
        headerRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF1E88E5' },
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        chartItems.forEach((item,index) => {
            const row = worksheet.addRow([
                index + 1,
                item.label,
                item.age,
                item.gender,
                item.telf,
                item.visits,
                item.firstVisit,
                item.lastVisit,
                item.image,
            ]);
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
                cell.alignment = { vertical: 'middle', horizontal: 'left' };
            });
        });

        worksheet.columns.forEach((column) => {
            let maxLength = 10;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const columnLength = cell.value ? cell.value.toString().length : 10;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            column.width = maxLength + 2;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        const timeStamp = formatDate(new Date().toISOString());
        saveAs(blob, `Visitas_Usuarios_${timeStamp}.xlsx`);
    };
    const exportToPDF = async () => {
        // Preparar los datos de la tabla, incluyendo la conversión de la imagen a base64
        const tableData = await Promise.all(chartItems.map(async (item,index) => {
            return [
                index + 1 ,
                item.label, 
                item.age, 
                item.gender, 
                item.telf, 
                item.visits, 
                item.firstVisit, 
                item.lastVisit
            ];
        }));

        const doc = new jsPDF();
        // Crear la tabla con autoTable
        doc.autoTable({
            head: [[ '#','Usuario', 'Edad', 'Género', 'Teléfono', 'Visitas', 'Primera Visita', 'Última Visita']],
            body: tableData,
            headStyles: { fillColor: [22, 160, 133] },
            theme: 'grid',
        });
        doc.save("Reporte_Usuarios.pdf");
    };

    return (
        <div className="charts">
            <button id="donwload-data-excel" onClick={exportToExcel}>Descargar datos a Excel</button>
            <button onClick={exportToPDF}>Generar Reporte PDF</button>
            <Bar data={chartData} options={chartOptions} />
        </div>
    );
});

export default ChartBar;
