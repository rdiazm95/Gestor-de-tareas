import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const KanbanCard = ({ task, onEdit, onDelete, onViewDetails }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-move border border-gray-200"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 
          className="font-semibold text-gray-800 flex-1 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(task);
          }}
        >
          {task.title}
        </h4>
        <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]} ml-2`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex flex-col gap-1 text-xs text-gray-500 mb-3">
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
          className="flex-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Editar
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task._id);
          }}
          className="flex-1 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default KanbanCard;
