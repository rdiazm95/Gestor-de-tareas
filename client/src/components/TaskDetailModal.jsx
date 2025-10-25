import React, { useState } from 'react';
import CommentsSection from './CommentsSection';
import AttachmentsSection from './AttachmentsSection';
import TimelineActivity from './TimelineActivity';

const TaskDetailModal = ({ task, onClose, onEdit, onDelete, onStatusChange, onTaskUpdate }) => {
  const [activeTab, setActiveTab] = useState('details');

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysRemaining = (date) => {
    if (!date) return null;
    const now = new Date();
    const due = new Date(date);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: `Vencida hace ${Math.abs(diffDays)} días`, color: 'text-red-600' };
    if (diffDays === 0) return { text: 'Vence hoy', color: 'text-orange-600' };
    if (diffDays === 1) return { text: 'Vence mañana', color: 'text-yellow-600' };
    if (diffDays <= 7) return { text: `${diffDays} días restantes`, color: 'text-yellow-600' };
    return { text: `${diffDays} días restantes`, color: 'text-green-600' };
  };

  const daysRemaining = getDaysRemaining(task.dueDate);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>📁 {task.project?.icon} {task.project?.name}</span>
              <span>👤 {task.createdBy?.name}</span>
              <span>📅 {formatDate(task.createdAt)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'details'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Detalles
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'comments'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Comentarios
          </button>
          <button
            onClick={() => setActiveTab('attachments')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'attachments'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Archivos ({task.attachments?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'activity'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Historial
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'details' ? (
            <div className="space-y-6">
              {task.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{task.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Estado:</span>
                      <select
                        value={task.status}
                        onChange={(e) => onStatusChange(task._id, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="en-progreso">En Progreso</option>
                        <option value="completada">Completada</option>
                      </select>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Prioridad:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        task.priority === 'alta' ? 'bg-red-100 text-red-700' :
                        task.priority === 'media' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Asignado a:</span>
                      <span className="text-gray-900">
                        {task.assignedTo?.name || 'Sin asignar'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Fecha límite:</span>
                      <div className="text-right">
                        <div className="text-gray-900">{formatDate(task.dueDate)}</div>
                        {daysRemaining && (
                          <div className={`text-sm ${daysRemaining.color}`}>
                            {daysRemaining.text}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Fechas</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Creada:</span>
                      <span className="text-gray-900">{formatDate(task.createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Última actualización:</span>
                      <span className="text-gray-900">{formatDate(task.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {task.tags && task.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Etiquetas</h3>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getTagColor(tag)}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => onEdit(task)}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Editar Tarea
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
                      onDelete(task._id);
                      onClose();
                    }
                  }}
                  className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ) : activeTab === 'comments' ? (
            <CommentsSection taskId={task._id} />
          ) : activeTab === 'attachments' ? (
            <AttachmentsSection 
              task={task} 
              onTaskUpdate={onTaskUpdate}
            />
          ) : (
            <TimelineActivity taskId={task._id} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
