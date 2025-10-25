import Papa from 'papaparse';
import { saveAs } from 'file-saver';

// Exportar tareas a CSV
export const exportToCSV = (tasks, projectName = 'Todas') => {
  if (!tasks || tasks.length === 0) {
    alert('No hay tareas para exportar');
    return;
  }

  // Preparar datos para CSV
  const csvData = tasks.map(task => ({
    'Título': task.title,
    'Descripción': task.description || '',
    'Estado': task.status,
    'Prioridad': task.priority,
    'Proyecto': task.project?.name || '',
    'Asignado a': task.assignedTo?.name || 'Sin asignar',
    'Creado por': task.createdBy?.name || '',
    'Etiquetas': task.tags?.join(', ') || '',
    'Fecha límite': task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-ES') : '',
    'Fecha creación': new Date(task.createdAt).toLocaleDateString('es-ES'),
    'Última actualización': new Date(task.updatedAt).toLocaleDateString('es-ES')
  }));

  // Convertir a CSV
  const csv = Papa.unparse(csvData, {
    quotes: true,
    delimiter: ',',
    header: true
  });

  // Crear Blob y descargar
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const fileName = `tareas_${projectName}_${new Date().toISOString().split('T')[0]}.csv`;
  saveAs(blob, fileName);
};

// Exportar tareas a formato Excel (CSV optimizado para Excel)
export const exportToExcel = (tasks, projectName = 'Todas') => {
  if (!tasks || tasks.length === 0) {
    alert('No hay tareas para exportar');
    return;
  }

  // Preparar datos con formato más rico para Excel
  const excelData = tasks.map(task => ({
    'ID': task._id.substring(0, 8),
    'Título': task.title,
    'Descripción': task.description || '',
    'Estado': getStatusLabel(task.status),
    'Prioridad': getPriorityLabel(task.priority),
    'Proyecto': task.project?.name || '',
    'Proyecto Icono': task.project?.icon || '',
    'Asignado a': task.assignedTo?.name || 'Sin asignar',
    'Email asignado': task.assignedTo?.email || '',
    'Creado por': task.createdBy?.name || '',
    'Email creador': task.createdBy?.email || '',
    'Etiquetas': task.tags?.join(', ') || 'Sin etiquetas',
    'Fecha límite': task.dueDate ? formatDateForExcel(task.dueDate) : 'Sin fecha',
    'Días restantes': task.dueDate ? getDaysRemaining(task.dueDate) : '',
    'Fecha creación': formatDateForExcel(task.createdAt),
    'Última actualización': formatDateForExcel(task.updatedAt),
    'Tiempo desde creación': getTimeSinceCreation(task.createdAt)
  }));

  // Convertir a CSV con configuración para Excel
  const csv = Papa.unparse(excelData, {
    quotes: true,
    delimiter: ';', // Excel en español prefiere punto y coma
    header: true
  });

  // BOM para UTF-8 en Excel
  const blob = new Blob(['\ufeff' + csv], { 
    type: 'text/csv;charset=utf-8;' 
  });
  
  const fileName = `tareas_${projectName}_${new Date().toISOString().split('T')[0]}.csv`;
  saveAs(blob, fileName);
};

// Exportar estadísticas del proyecto
export const exportProjectStats = (tasks, projects, projectName = 'Global') => {
  const stats = {
    'Resumen General': '',
    'Proyecto': projectName,
    'Total de tareas': tasks.length,
    'Pendientes': tasks.filter(t => t.status === 'pendiente').length,
    'En progreso': tasks.filter(t => t.status === 'en-progreso').length,
    'Completadas': tasks.filter(t => t.status === 'completada').length,
    'Prioridad alta': tasks.filter(t => t.priority === 'alta').length,
    'Prioridad media': tasks.filter(t => t.priority === 'media').length,
    'Prioridad baja': tasks.filter(t => t.priority === 'baja').length,
    'Tareas vencidas': tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completada').length,
    'Tasa de completitud': tasks.length > 0 ? `${((tasks.filter(t => t.status === 'completada').length / tasks.length) * 100).toFixed(1)}%` : '0%',
    'Fecha del reporte': new Date().toLocaleString('es-ES')
  };

  const statsArray = Object.entries(stats).map(([key, value]) => ({
    'Métrica': key,
    'Valor': value
  }));

  const csv = Papa.unparse(statsArray, {
    quotes: true,
    delimiter: ';',
    header: true
  });

  const blob = new Blob(['\ufeff' + csv], { 
    type: 'text/csv;charset=utf-8;' 
  });
  
  const fileName = `estadisticas_${projectName}_${new Date().toISOString().split('T')[0]}.csv`;
  saveAs(blob, fileName);
};

// Funciones auxiliares
const getStatusLabel = (status) => {
  const labels = {
    'pendiente': 'Pendiente',
    'en-progreso': 'En Progreso',
    'completada': 'Completada'
  };
  return labels[status] || status;
};

const getPriorityLabel = (priority) => {
  const labels = {
    'baja': 'Baja',
    'media': 'Media',
    'alta': 'Alta'
  };
  return labels[priority] || priority;
};

const formatDateForExcel = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getDaysRemaining = (dueDate) => {
  if (!dueDate) return '';
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return `Vencida hace ${Math.abs(diffDays)} días`;
  if (diffDays === 0) return 'Vence hoy';
  if (diffDays === 1) return 'Vence mañana';
  return `${diffDays} días restantes`;
};

const getTimeSinceCreation = (createdAt) => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffTime = now - created;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Hace 1 día';
  if (diffDays < 30) return `Hace ${diffDays} días`;
  
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return 'Hace 1 mes';
  return `Hace ${diffMonths} meses`;
};
