import React from 'react';

const UpcomingTasks = ({ tasks }) => {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcomingTasks = tasks
    .filter(t => {
      if (!t.dueDate || t.status === 'completada') return false;
      const dueDate = new Date(t.dueDate);
      return dueDate >= now && dueDate <= sevenDaysFromNow;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) return 'Hoy';
    if (d.toDateString() === tomorrow.toDateString()) return 'Mañana';
    
    return d.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const priorityColors = {
    'alta': 'bg-red-100 text-red-700 border-red-300',
    'media': 'bg-orange-100 text-orange-700 border-orange-300',
    'baja': 'bg-gray-100 text-gray-700 border-gray-300'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span>⏳</span> Próximas a Vencer (7 días)
      </h3>
      
      {upcomingTasks.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No hay tareas próximas a vencer</p>
      ) : (
        <div className="space-y-3">
          {upcomingTasks.map(task => (
            <div
              key={task._id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{task.title}</div>
                <div className="text-xs text-gray-500">
                  {task.project?.icon} {task.project?.name}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <span className={`text-xs px-2 py-1 rounded-full border ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  {formatDate(task.dueDate)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingTasks;
