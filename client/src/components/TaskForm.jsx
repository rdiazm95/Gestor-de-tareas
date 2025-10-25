import React, { useState, useEffect } from 'react';
import TagSelector from './TagSelector';

const TaskForm = ({ onSubmit, onCancel, initialData, users, projects, selectedProject }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pendiente',
    priority: 'media',
    assignedTo: '',
    dueDate: '',
    project: selectedProject?._id || '',
    tags: []  // NUEVO
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        status: initialData.status || 'pendiente',
        priority: initialData.priority || 'media',
        assignedTo: initialData.assignedTo?._id || '',
        dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : '',
        project: initialData.project?._id || selectedProject?._id || '',
        tags: initialData.tags || []  // NUEVO
      });
    } else if (selectedProject) {
      setFormData(prev => ({ ...prev, project: selectedProject._id }));
    }
  }, [initialData, selectedProject]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">
        {initialData ? 'Editar Tarea' : 'Nueva Tarea'}
      </h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700">Título *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-900 border-gray-300"
          placeholder="Escribe el título de la tarea"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700">Descripción</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-900 border-gray-300"
          placeholder="Describe la tarea (opcional)"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700">Proyecto *</label>
        <select
          name="project"
          value={formData.project}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-900 border-gray-300"
        >
          <option value="">Selecciona un proyecto</option>
          {projects.map(project => (
            <option key={project._id} value={project._id}>
              {project.icon} {project.name}
            </option>
          ))}
        </select>
      </div>

      {/* NUEVO: Selector de etiquetas */}
      <div className="mb-4">
        <TagSelector
          selectedTags={formData.tags}
          onChange={(tags) => setFormData({ ...formData, tags })}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Estado</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-900 border-gray-300"
          >
            <option value="pendiente">Pendiente</option>
            <option value="en-progreso">En Progreso</option>
            <option value="completada">Completada</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Prioridad</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-900 border-gray-300"
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Asignar a</label>
          <select
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-900 border-gray-300"
          >
            <option value="">Sin asignar</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>{user.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Fecha límite</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-900 border-gray-300"
          />
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          {initialData ? 'Actualizar' : 'Crear'} Tarea
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

export default TaskForm;
