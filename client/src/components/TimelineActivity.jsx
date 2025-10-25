import React, { useEffect, useState } from 'react';
import { activityService } from '../services/activityService';

const ICONS = {
  task_created: '🆕',
  task_deleted: '🗑️',
  status_changed: '🔄',
  priority_changed: '⚡',
  assigned: '👤',
  reassigned: '🔁',
  unassigned: '🚫',
  due_date_changed: '📅',
  comment_added: '💬',
  attachment_added: '📎',
  attachment_removed: '❌',
  tag_added: '🏷️',
  tag_removed: '⋮',
  project_changed: '📁'
};

// Traducción amigable de tipo de actividad en español
const getActivityLabel = (type, changes, metadata) => {
  switch (type) {
    case 'task_created':
      return 'Tarea creada';
    case 'task_deleted':
      return 'Tarea eliminada';
    case 'status_changed':
      return `Estado cambiado de "${changes.oldValue}" a "${changes.newValue}"`;
    case 'priority_changed':
      return `Prioridad cambiada de "${changes.oldValue}" a "${changes.newValue}"`;
    case 'assigned':
      return `Tarea asignada a nuevo usuario`;
    case 'reassigned':
      return `Reasignada a nuevo usuario`;
    case 'unassigned':
      return `Tarea desasignada`;
    case 'due_date_changed':
      return `Fecha límite actualizada a ${changes.newValue || 'sin fecha'}`;
    case 'comment_added':
      return 'Nuevo comentario añadido';
    case 'attachment_added':
      return `Archivo adjuntado: "${metadata?.filename || ''}"`;
    case 'attachment_removed':
      return `Archivo eliminado: "${metadata?.filename || ''}"`;
    case 'tag_added':
      return `Etiqueta añadida: ${changes.newValue}`;
    case 'tag_removed':
      return `Etiqueta eliminada: ${changes.oldValue}`;
    case 'project_changed':
      return 'Proyecto cambiado';
    default:
      return type;
  }
};

function formatTimeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = (now - date) / 1000;
  if (diff < 60) return 'Hace unos segundos';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return date.toLocaleString('es-ES', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
}

const TimelineActivity = ({ taskId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const { data } = await activityService.getByTask(taskId);
        setActivities(data);
      } catch (error) {
        setActivities([]);
      }
      setLoading(false);
    };

    fetchActivities();
  }, [taskId]);

  if (loading) {
    return <div className="text-center py-4 text-gray-500">Cargando historial...</div>;
  }

  if (activities.length === 0) {
    return <div className="text-center py-4 text-gray-500">Sin actividad registrada</div>;
  }

  return (
    <div className="relative pl-6">
      <div className="absolute left-0 top-0 h-full w-1 bg-gray-200 rounded-full"></div>
      <ul className="space-y-7">
        {activities.map((activity) => (
          <li key={activity._id} className="relative">
            <div className="absolute -left-6 top-1.5 flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-blue-400">
              <span className="text-lg">{ICONS[activity.type] || '⋯'}</span>
            </div>
            <div className="ml-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-blue-800">{activity.user?.name || 'Usuario'}</span>
                <span className="text-xs text-gray-400">{formatTimeAgo(activity.createdAt)}</span>
              </div>
              <div className="text-gray-800 text-sm">
                {getActivityLabel(activity.type, activity.changes || {}, activity.metadata || {})}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TimelineActivity;
