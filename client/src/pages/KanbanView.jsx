import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import toast from 'react-hot-toast';
import { taskService, userService } from '../services/api';
import { projectService } from '../services/projectService';
import socket from '../services/socket';
import { useAuth } from '../context/AuthContext';
import ProjectSidebar from '../components/ProjectSidebar';
import ProjectModal from '../components/ProjectModal';
import KanbanColumn from '../components/KanbanColumn';
import KanbanCard from '../components/KanbanCard';
import TaskForm from '../components/TaskForm';
import Stats from '../components/Stats';
import ThemeToggle from '../components/ThemeToggle';
import OnlineUsers from '../components/OnlineUsers';
import SearchAndFilters from '../components/SearchAndFilters';
import ExportMenu from '../components/ExportMenu';
import NotificationBell from '../components/NotificationBell';
import TaskDetailModal from '../components/TaskDetailModal';

const KanbanView = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);

  // Estados para búsqueda y filtros avanzados
  const [searchTerm, setSearchTerm] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState({
    status: 'todas',
    priority: 'todas',
    assignedTo: 'todos',
    tag: 'todas'
  });

  // Estados para modal de detalles
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadProjects();
    loadUsers();
    setupSocketListeners();

    return () => {
      socket.off('taskCreated');
      socket.off('taskUpdated');
      socket.off('taskDeleted');
      socket.off('projectCreated');
      socket.off('projectUpdated');
      socket.off('projectDeleted');
    };
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadTasks(selectedProject._id);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const response = await projectService.getAll();
      setProjects(response.data);
      
      if (response.data.length > 0 && !selectedProject) {
        setSelectedProject(response.data[0]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
      toast.error('Error al cargar proyectos');
      setLoading(false);
    }
  };

  const loadTasks = async (projectId) => {
    try {
      const response = await taskService.getAll();
      const projectTasks = response.data.filter(task => task.project?._id === projectId);
      setTasks(projectTasks);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      toast.error('Error al cargar las tareas');
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userService.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  // Obtener todas las etiquetas únicas
  const getAllTags = () => {
    const allTags = new Set();
    tasks.forEach(task => {
      if (task.tags) {
        task.tags.forEach(tag => allTags.add(tag));
      }
    });
    return Array.from(allTags).sort();
  };

  const setupSocketListeners = () => {
    socket.on('taskCreated', (newTask) => {
      if (newTask.project?._id === selectedProject?._id) {
        setTasks((prevTasks) => [newTask, ...prevTasks]);
        toast.success('Nueva tarea creada');
      }
    });

    socket.on('taskUpdated', (updatedTask) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === updatedTask._id ? updatedTask : task
        )
      );
      
      // Actualizar tarea seleccionada si está abierta
      if (selectedTask?._id === updatedTask._id) {
        setSelectedTask(updatedTask);
      }
      
      toast.success('Tarea actualizada');
    });

    socket.on('taskDeleted', (deletedTaskId) => {
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task._id !== deletedTaskId)
      );
      toast.success('Tarea eliminada');
    });

    socket.on('projectCreated', (newProject) => {
      setProjects((prev) => [...prev, newProject]);
      toast.success('Proyecto creado');
    });

    socket.on('projectUpdated', (updatedProject) => {
      setProjects((prev) =>
        prev.map((p) => (p._id === updatedProject._id ? updatedProject : p))
      );
      if (selectedProject?._id === updatedProject._id) {
        setSelectedProject(updatedProject);
      }
      toast.success('Proyecto actualizado');
    });

    socket.on('projectDeleted', (deletedProjectId) => {
      setProjects((prev) => prev.filter((p) => p._id !== deletedProjectId));
      if (selectedProject?._id === deletedProjectId) {
        setSelectedProject(projects[0] || null);
      }
      toast.success('Proyecto eliminado');
    });
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const taskId = active.id;
    const newStatus = over.id;

    const validStatuses = ['pendiente', 'en-progreso', 'completada'];
    if (!validStatuses.includes(newStatus)) {
      setActiveId(null);
      return;
    }

    const task = tasks.find(t => t._id === taskId);
    if (task && task.status !== newStatus) {
      try {
        await taskService.update(taskId, { status: newStatus });
        toast.success(`Tarea movida a ${newStatus}`);
      } catch (error) {
        console.error('Error al actualizar estado:', error);
        toast.error('Error al mover la tarea');
      }
    }

    setActiveId(null);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingTask) {
        await taskService.update(editingTask._id, formData);
        toast.success('Tarea actualizada correctamente');
      } else {
        const taskData = {
          ...formData,
          createdBy: user?._id,
          project: formData.project || selectedProject?._id
        };
        await taskService.create(taskData);
        toast.success('Tarea creada correctamente');
      }
      setShowForm(false);
      setEditingTask(null);
      
      if (selectedProject) {
        loadTasks(selectedProject._id);
      }
    } catch (error) {
      console.error('Error al guardar tarea:', error);
      toast.error(error.response?.data?.message || 'Error al guardar la tarea');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        await taskService.delete(taskId);
        toast.success('Tarea eliminada correctamente');
        if (selectedProject) {
          loadTasks(selectedProject._id);
        }
      } catch (error) {
        console.error('Error al eliminar tarea:', error);
        toast.error('Error al eliminar la tarea');
      }
    }
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.update(taskId, { status: newStatus });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast.error('Error al actualizar estado');
    }
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowProjectModal(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowProjectModal(true);
  };

  const handleDeleteProject = async (project) => {
    if (project.taskCount > 0) {
      toast.error(`No se puede eliminar el proyecto porque tiene ${project.taskCount} tarea(s)`);
      return;
    }

    if (window.confirm(`¿Estás seguro de que quieres eliminar el proyecto "${project.name}"?`)) {
      try {
        await projectService.delete(project._id);
        toast.success('Proyecto eliminado');
        loadProjects();
      } catch (error) {
        console.error('Error al eliminar proyecto:', error);
        toast.error(error.response?.data?.message || 'Error al eliminar proyecto');
      }
    }
  };

  const handleSaveProject = async (projectData) => {
    try {
      if (editingProject) {
        await projectService.update(editingProject._id, projectData);
        toast.success('Proyecto actualizado');
      } else {
        await projectService.create(projectData);
        toast.success('Proyecto creado');
      }
      setShowProjectModal(false);
      setEditingProject(null);
      loadProjects();
    } catch (error) {
      console.error('Error al guardar proyecto:', error);
      toast.error(error.response?.data?.message || 'Error al guardar proyecto');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Filtrado y búsqueda avanzada
  const filteredTasks = tasks.filter((task) => {
    // Búsqueda por texto
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(searchLower);
      const matchesDescription = task.description?.toLowerCase().includes(searchLower);
      if (!matchesTitle && !matchesDescription) return false;
    }

    // Filtros avanzados
    if (advancedFilters.status !== 'todas' && task.status !== advancedFilters.status) {
      return false;
    }

    if (advancedFilters.priority !== 'todas' && task.priority !== advancedFilters.priority) {
      return false;
    }

    if (advancedFilters.assignedTo !== 'todos') {
      if (!task.assignedTo || task.assignedTo._id !== advancedFilters.assignedTo) {
        return false;
      }
    }

    if (advancedFilters.tag !== 'todas') {
      if (!task.tags || !task.tags.includes(advancedFilters.tag)) {
        return false;
      }
    }

    return true;
  });

  // Agrupar tareas filtradas por estado
  const tasksByStatus = {
    'pendiente': filteredTasks.filter(t => t.status === 'pendiente'),
    'en-progreso': filteredTasks.filter(t => t.status === 'en-progreso'),
    'completada': filteredTasks.filter(t => t.status === 'completada')
  };

  const activeTask = activeId ? tasks.find(t => t._id === activeId) : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar de proyectos */}
      <ProjectSidebar
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        onCreateProject={handleCreateProject}
        onEditProject={handleEditProject}
        onDeleteProject={handleDeleteProject}
      />

      {/* Contenido principal */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                {selectedProject?.icon} {selectedProject?.name || 'Vista Kanban'}
              </h1>
              <p className="text-gray-600">
                Bienvenido, <span className="font-medium">{user?.name}</span>
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <NotificationBell />
              <ThemeToggle />
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/tasks')}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Vista Lista
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>

          <OnlineUsers />

          <Stats tasks={tasks} />

          {/* Botones de Nueva Tarea y Exportar */}
          {!showForm && (
            <div className="mb-6 flex gap-3">
              <button
                onClick={() => {
                  setEditingTask(null);
                  setShowForm(true);
                }}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium shadow-md"
              >
                + Nueva Tarea
              </button>

              {/* Botón de exportación */}
              <ExportMenu 
                tasks={filteredTasks} 
                projects={projects}
                selectedProject={selectedProject}
              />
            </div>
          )}

          {showForm && (
            <div className="mb-8">
              <TaskForm
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingTask(null);
                }}
                initialData={editingTask}
                users={users}
                projects={projects}
                selectedProject={selectedProject}
              />
            </div>
          )}

          {/* Buscador y filtros avanzados */}
          <SearchAndFilters
            onSearch={setSearchTerm}
            onFilterChange={setAdvancedFilters}
            filters={advancedFilters}
            allTags={getAllTags()}
            users={users}
          />

          {/* Contador de tareas filtradas */}
          <div className="mb-4 text-sm text-gray-600">
            Mostrando {filteredTasks.length} de {tasks.length} tareas
            {(searchTerm || Object.values(advancedFilters).some(v => v !== 'todas' && v !== 'todos')) && (
              <span className="ml-2 text-blue-600 font-medium">(filtradas)</span>
            )}
          </div>

          {!selectedProject ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              Selecciona un proyecto para ver las tareas
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex gap-4 overflow-x-auto pb-4">
                <KanbanColumn
                  status="pendiente"
                  tasks={tasksByStatus['pendiente']}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onViewDetails={handleViewDetails}
                />
                <KanbanColumn
                  status="en-progreso"
                  tasks={tasksByStatus['en-progreso']}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onViewDetails={handleViewDetails}
                />
                <KanbanColumn
                  status="completada"
                  tasks={tasksByStatus['completada']}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onViewDetails={handleViewDetails}
                />
              </div>

              <DragOverlay>
                {activeTask ? (
                  <div className="rotate-3 opacity-80">
                    <KanbanCard 
                      task={activeTask} 
                      onEdit={() => {}} 
                      onDelete={() => {}} 
                      onViewDetails={() => {}}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </div>

      {/* Modal de proyecto */}
      {showProjectModal && (
        <ProjectModal
          project={editingProject}
          users={users}
          onClose={() => {
            setShowProjectModal(false);
            setEditingProject(null);
          }}
          onSave={handleSaveProject}
        />
      )}

      {/* Modal de detalles de tarea con comentarios */}
      {showDetailModal && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTask(null);
          }}
          onEdit={(task) => {
            setEditingTask(task);
            setShowForm(true);
            setShowDetailModal(false);
            setSelectedTask(null);
          }}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default KanbanView;
