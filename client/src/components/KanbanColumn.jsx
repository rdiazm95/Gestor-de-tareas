import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';

const KanbanColumn = ({ status, tasks, onEdit, onDelete, onViewDetails }) => {
  const { setNodeRef } = useDroppable({ id: status });

  const statusConfig = {
    'pendiente': {
      title: 'Pendiente',
      color: 'bg-yellow-100 border-yellow-300',
      icon: '⏸️'
    },
    'en-progreso': {
      title: 'En Progreso',
      color: 'bg-blue-100 border-blue-300',
      icon: '▶️'
    },
    'completada': {
      title: 'Completada',
      color: 'bg-green-100 border-green-300',
      icon: '✅'
    }
  };

  const config = statusConfig[status];

  return (
    <div className="flex-shrink-0 w-80">
      <div className={`rounded-lg border-2 ${config.color} p-4 h-full flex flex-col`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span>{config.icon}</span>
            {config.title}
          </h3>
          <span className="bg-white px-2 py-1 rounded-full text-sm font-medium">
            {tasks.length}
          </span>
        </div>

        <div
          ref={setNodeRef}
          className="flex-1 overflow-y-auto space-y-3 min-h-[200px]"
        >
          <SortableContext
            items={tasks.map(t => t._id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map(task => (
              <KanbanCard
                key={task._id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewDetails={onViewDetails}
              />
            ))}
          </SortableContext>

          {tasks.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              No hay tareas
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KanbanColumn;
