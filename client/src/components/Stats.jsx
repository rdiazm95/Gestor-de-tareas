import React from 'react';

const Stats = ({ tasks }) => {
  const totalTasks = tasks.length;
  const pendientes = tasks.filter(t => t.status === 'pendiente').length;
  const enProgreso = tasks.filter(t => t.status === 'en-progreso').length;
  const completadas = tasks.filter(t => t.status === 'completada').length;
  
  const completionRate = totalTasks > 0 
    ? Math.round((completadas / totalTasks) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
        <div className="text-2xl font-bold text-gray-800 dark:text-white">{totalTasks}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Total de Tareas</div>
      </div>
      
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow p-4 border border-yellow-200 dark:border-yellow-800">
        <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">{pendientes}</div>
        <div className="text-sm text-yellow-700 dark:text-yellow-400">Pendientes</div>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow p-4 border border-blue-200 dark:border-blue-800">
        <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">{enProgreso}</div>
        <div className="text-sm text-blue-700 dark:text-blue-400">En Progreso</div>
      </div>
      
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow p-4 border border-green-200 dark:border-green-800">
        <div className="text-2xl font-bold text-green-800 dark:text-green-300">{completionRate}%</div>
        <div className="text-sm text-green-700 dark:text-green-400">Completadas</div>
      </div>
    </div>
  );
};

export default Stats;
