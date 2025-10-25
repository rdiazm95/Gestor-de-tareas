import React from 'react';

const AdvancedStats = ({ tasks, projects }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completada').length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'alta').length;
  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < new Date() && t.status !== 'completada';
  }).length;

  const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;

  const stats = [
    {
      title: 'Total de Tareas',
      value: totalTasks,
      icon: '📋',
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      title: 'Tareas Completadas',
      value: `${completionRate}%`,
      icon: '✅',
      color: 'bg-green-50 text-green-600 border-green-200'
    },
    {
      title: 'Alta Prioridad',
      value: highPriorityTasks,
      icon: '🔥',
      color: 'bg-red-50 text-red-600 border-red-200'
    },
    {
      title: 'Tareas Vencidas',
      value: overdueTasks,
      icon: '⏰',
      color: 'bg-orange-50 text-orange-600 border-orange-200'
    },
    {
      title: 'Proyectos Activos',
      value: projects.length,
      icon: '📁',
      color: 'bg-purple-50 text-purple-600 border-purple-200'
    },
    {
      title: 'En Progreso',
      value: tasks.filter(t => t.status === 'en-progreso').length,
      icon: '🚀',
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`${stat.color} rounded-lg shadow p-4 border-2`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-3xl font-bold">{stat.value}</div>
          </div>
          <div className="text-sm font-medium opacity-80">{stat.title}</div>
        </div>
      ))}
    </div>
  );
};

export default AdvancedStats;
