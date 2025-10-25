import React, { useState } from 'react';

const ProjectSidebar = ({ 
  projects, 
  selectedProject, 
  onSelectProject, 
  onCreateProject, 
  onEditProject, 
  onDeleteProject 
}) => {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">Proyectos</h2>
      </div>

      {/* Lista de proyectos */}
      <div className="flex-1 overflow-y-auto p-2">
        {projects.map(project => (
          <div
            key={project._id}
            onClick={() => onSelectProject(project)}
            className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
              selectedProject?._id === project._id
                ? 'bg-blue-50 border-2 border-blue-500'
                : 'hover:bg-gray-100 border-2 border-transparent'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-2xl">{project.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {project.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {project.taskCount || 0} tareas
                  </div>
                </div>
              </div>
              
              {!project.isDefault && (
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditProject(project);
                    }}
                    className="p-1 hover:bg-blue-100 rounded"
                    title="Editar"
                  >
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProject(project);
                    }}
                    className="p-1 hover:bg-red-100 rounded"
                    title="Eliminar"
                  >
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            
            {project.description && (
              <p className="text-xs text-gray-500 mt-1 truncate">
                {project.description}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Botón crear proyecto */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onCreateProject}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Proyecto
        </button>
      </div>
    </div>
  );
};

export default ProjectSidebar;
