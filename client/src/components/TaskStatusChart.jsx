import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const TaskStatusChart = ({ tasks }) => {
  const pendientes = tasks.filter(t => t.status === 'pendiente').length;
  const enProgreso = tasks.filter(t => t.status === 'en-progreso').length;
  const completadas = tasks.filter(t => t.status === 'completada').length;

  const data = {
    labels: ['Pendientes', 'En Progreso', 'Completadas'],
    datasets: [
      {
        label: 'Tareas',
        data: [pendientes, enProgreso, completadas],
        backgroundColor: [
          'rgba(234, 179, 8, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderColor: [
          'rgba(234, 179, 8, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
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
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 h-80">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribución por Estado</h3>
      <div className="h-64">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default TaskStatusChart;
