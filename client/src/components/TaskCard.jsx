import React from 'react';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange, onViewDetails }) => {
  const statusColors = {
    'pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'en-progreso': 'bg-blue-100 text-blue-800 border-blue-300',
    'completada': 'bg-green-100 text-green-800 border-green-300'
  };

  const priorityColors = {
    'baja': 'bg-gray-100 text-gray-700',
    'media': 'bg-orange-100 text-orange-700',
    'alta': 'bg-red-100 text-red-700'
  };

  const getTagColor = (tag) => {
    const TAG_COLORS = [
      'bg-red-100 text-red-700 border-red-300',
      'bg-blue-100 text-blue-700 border-blue-300',
      'bg-green-100 text-green-700 border-green-300',
      'bg-yellow-100 text-yellow-700 border-yellow-300',
      'bg-purple-100 text-purple-700 border-purple-300',
      'bg-pink-100 text-pink-700 border-pink-300',
      'bg-indigo-100 text-indigo-700 border-indigo-300',
      'bg-orange-100 text-orange-700 border-orange-300',
    ];
    const index = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return TAG_COLORS[index % TAG_COLORS.length];
  };

  const formatDate = (date) => {
    if (!date) return 'Sin fecha';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`border-2 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white ${statusColors[task.status]}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 
          className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => onViewDetails(task)}
        >
          {task.title}
        </h3>
        <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      
      {task.description && (
        <p className="text-sm mb-3 text-gray-700">{task.description}</p>
      )}
      
      <div className="flex flex-col gap-2 text-xs mb-3 text-gray-600">
        <div>
          <span className="font-medium">Creado por:</span> {task.createdBy?.name || 'Desconocido'}
        </div>
        {task.assignedTo && (
          <div>
            <span className="font-medium">Asignado a:</span> {task.assignedTo.name}
          </div>
        )}
        <div>
          <span className="font-medium">Fecha límite:</span> {formatDate(task.dueDate)}
        </div>
      </div>

      {/* Etiquetas */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map((tag, index) => (
            <span
              key={index}
              className={`text-xs px-2 py-1 rounded-full border font-medium ${getTagColor(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      <div className="flex gap-2">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value)}
          className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-900 border-gray-300"
        >
          <option value="pendiente">Pendiente</option>
          <option value="en-progreso">En Progreso</option>
          <option value="completada">Completada</option>
        </select>
        
        <button
          onClick={() => onEdit(task)}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Editar
        </button>
        
        <button
          onClick={() => onDelete(task._id)}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
