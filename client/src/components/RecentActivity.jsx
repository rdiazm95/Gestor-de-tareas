import React from 'react';

const RecentActivity = ({ tasks }) => {
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Hace unos segundos';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} horas`;
    return `Hace ${Math.floor(seconds / 86400)} días`;
  };

  const statusIcons = {
    'pendiente': '⏸️',
    'en-progreso': '▶️',
    'completada': '✅'
  };

  const statusColors = {
    'pendiente': 'text-yellow-600',
    'en-progreso': 'text-blue-600',
    'completada': 'text-green-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span>📊</span> Actividad Reciente
      </h3>
      
      {recentTasks.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No hay actividad reciente</p>
      ) : (
        <div className="space-y-3">
          {recentTasks.map(task => (
            <div
              key={task._id}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <span className={`text-xl ${statusColors[task.status]}`}>
                {statusIcons[task.status]}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{task.title}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {task.project?.icon} {task.project?.name} • {getTimeAgo(task.updatedAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
