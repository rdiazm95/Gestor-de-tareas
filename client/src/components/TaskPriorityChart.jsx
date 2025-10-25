import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TaskPriorityChart = ({ tasks }) => {
  const alta = tasks.filter(t => t.priority === 'alta').length;
  const media = tasks.filter(t => t.priority === 'media').length;
  const baja = tasks.filter(t => t.priority === 'baja').length;

  const data = {
    labels: ['Baja', 'Media', 'Alta'],
    datasets: [
      {
        label: 'Cantidad de Tareas',
        data: [baja, media, alta],
        backgroundColor: [
          'rgba(156, 163, 175, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(156, 163, 175, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 h-80">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Tareas por Prioridad</h3>
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default TaskPriorityChart;
