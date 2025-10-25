import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { taskService, userService } from '../services/api';
import { projectService } from '../services/projectService';
import socket from '../services/socket';
import { useAuth } from '../context/AuthContext';
import ProjectSidebar from '../components/ProjectSidebar';
import ProjectModal from '../components/ProjectModal';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import Stats from '../components/Stats';
import ThemeToggle from '../components/ThemeToggle';
import OnlineUsers from '../components/OnlineUsers';
import SearchAndFilters from '../components/SearchAndFilters';
import ExportMenu from '../components/ExportMenu';
import TaskDetailModal from '../components/TaskDetailModal';
import NotificationBell from '../components/NotificationBell';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState({
    status: 'todas',
    priority: 'todas',
    assignedTo: 'todos',
    tag: 'todas'
  });

  // Modal de detalles
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const socketInitialized = useRef(false);

  // ======== Ciclo de vida inicial ========
  useEffect(() => {
    const initializeData = async () => {
      try {
        await loadProjects();
        await loadUsers();
      } catch (error) {
        console.error('Error inicializando datos:', error);
      }
    };

    initializeData();

    if (!socketInitialized.current) {
      setupSocketListeners();
      socketInitialized.current = true;
    }

    return () => {
      socket.removeAllListeners();
      socketInitialized.current = false;
    };
  }, [selectedProject?._id, user?._id]);

  // ======== Cargar tareas al cambiar proyecto ========
  useEffect(() => {
    if (selectedProject) loadTasks(selectedProject._id);
    else setTasks([]);
  }, [selectedProject]);

  // ======== Cargar proyectos ========
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

  // ======== Cargar tareas ========
  const loadTasks = async (projectId) => {
    try {
      const response = await taskService.getAll();
      const projectTasks = response.data.filter((t) => t.project?._id === projectId);
      setTasks(projectTasks);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      toast.error('Error al cargar tareas');
    }
  };

  // ======== Cargar usuarios ========
  const loadUsers = async () => {
    try {
      const response = await userService.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  // ======== Setup de sockets ========
  const setupSocketListeners = () => {
    if (!user) return;

    socket.removeAllListeners();

    const userChannel = `user:${user._id}`;
    const projectChannel = selectedProject ? `project:${selectedProject._id}` : null;

    console.log('🧹 Listeners de socket reconfigurados');

    // ----- PROYECTOS -----
    socket.on('projectCreated', (newProject) => {
      setProjects((prev) => [...prev, newProject]);
    });

    socket.on('projectUpdated', (updatedProject) => {
      setProjects((prev) =>
        prev.map((p) => (p._id === updatedProject._id ? updatedProject : p))
      );
      if (selectedProject?._id === updatedProject._id) {
        setSelectedProject(updatedProject);
      }
    });

    socket.on('projectDeleted', (projectId) => {
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
      if (selectedProject?._id === projectId) {
        setSelectedProject(null);
        setTasks([]);
      }
    });

    // ----- TAREAS DEL PROYECTO -----
    if (projectChannel) {
      socket.on(`${projectChannel}:taskCreated`, ({ projectId, task }) => {
        if (selectedProject && selectedProject._id === projectId) {
          setTasks((prev) => (prev.some((t) => t._id === task._id) ? prev : [task, ...prev]));
        }
      });

     socket.on(`${projectChannel}:taskUpdated`, ({ projectId, task }) => {
  if (selectedProject && selectedProject._id === projectId) {
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, ...task } : t))
    );

    // Si el modal de detalles está abierto, actualízalo también
    if (selectedTask?._id === task._id) {
      setSelectedTask((prev) => ({
        ...prev,
        attachments: task.attachments, // actualiza los adjuntos
        comments: task.comments || prev.comments, // si manejas comentarios en el mismo objeto
      }));
    }

    toast.success(`Tarea actualizada: "${task.title}"`);
  }
});

      socket.on(`${projectChannel}:taskDeleted`, ({ projectId, taskId }) => {
        if (selectedProject && selectedProject._id === projectId) {
          setTasks((prev) => prev.filter((t) => t._id !== taskId));
        }
      });
    }

    // ----- TAREAS DIRECTAS AL USUARIO -----
    if (userChannel) {
      socket.on(`${userChannel}:taskAssigned`, ({ task }) => {
        setTasks((prev) => (prev.some((t) => t._id === task._id) ? prev : [task, ...prev]));
        toast.success(`Nueva tarea asignada: "${task.title}"`);
      });

      socket.on(`${userChannel}:taskUpdated`, ({ task }) => {
        setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, ...task } : t)));
      });

      socket.on(`${userChannel}:taskDeleted`, ({ taskId }) => {
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
      });
    }

    // ----- NOTIFICACIONES -----
    socket.on('newNotification', ({ userId }) => {
      if (user && user._id === userId) {
        toast('🔔 Nueva notificación', {
          icon: '🔔',
          duration: 2500,
        });
      }
    });
  };

  // ======== Manejadores de tareas ========
  const handleSubmitTask = async (formData) => {
    try {
      if (editingTask) {
        await taskService.update(editingTask._id, formData);
        toast.success('Tarea actualizada');
      } else {
        await taskService.create({
          ...formData,
          createdBy: user?._id,
          project: formData.project || selectedProject?._id,
        });
        toast.success('Tarea creada');
      }
      setShowForm(false);
      setEditingTask(null);
      if (selectedProject) loadTasks(selectedProject._id);
    } catch (error) {
      console.error('Error al guardar tarea:', error);
      toast.error(error.response?.data?.message || 'Error al guardar tarea');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // Actualización optimista en la UI
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
      await taskService.update(taskId, { status: newStatus });

      // Si hay modal abierto, actualiza también
      if (selectedTask?._id === taskId) {
        setSelectedTask((prev) => (prev ? { ...prev, status: newStatus } : prev));
      }

      toast.success('Estado actualizado');
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast.error('Error al actualizar estado');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('¿Eliminar esta tarea?')) {
      try {
        await taskService.delete(taskId);
        toast.success('Tarea eliminada');
        if (selectedProject) loadTasks(selectedProject._id);
      } catch (error) {
        console.error('Error al eliminar tarea:', error);
        toast.error('Error al eliminar tarea');
      }
    }
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  // ======== Manejadores de proyectos ========
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
      toast.error(`No se puede eliminar "${project.name}" porque tiene tareas`);
      return;
    }

    if (window.confirm(`¿Eliminar el proyecto "${project.name}"?`)) {
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

  // ======== Filtros ========
  const getAllTags = () => {
    const tags = new Set();
    tasks.forEach((task) => task.tags?.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter !== 'todas' && task.status !== filter) return false;
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()))
      return false;
    if (
      advancedFilters.status !== 'todas' &&
      task.status !== advancedFilters.status
    )
      return false;
    if (
      advancedFilters.priority !== 'todas' &&
      task.priority !== advancedFilters.priority
    )
      return false;
    if (
      advancedFilters.assignedTo !== 'todos' &&
      (!task.assignedTo || task.assignedTo._id !== advancedFilters.assignedTo)
    )
      return false;
    if (advancedFilters.tag !== 'todas' && !task.tags?.includes(advancedFilters.tag))
      return false;
    return true;
  });

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Cargando...</div>
      </div>
    );

  // ======== Render ========
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <ProjectSidebar
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        onCreateProject={handleCreateProject}
        onEditProject={handleEditProject}
        onDeleteProject={handleDeleteProject}
        refreshProjects={loadProjects}
      />

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                {selectedProject?.icon} {selectedProject?.name || 'Gestor de Tareas'}
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
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/kanban')}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
              >
                Vista Kanban
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>

          <OnlineUsers />
          <Stats tasks={tasks} />

          {/* Nueva tarea */}
          {!showForm && (
            <div className="mb-6 flex gap-3">
              <button
                onClick={() => {
                  setEditingTask(null);
                  setShowForm(true);
                }}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
              >
                + Nueva Tarea
              </button>
              <ExportMenu
                tasks={filteredTasks}
                projects={projects}
                selectedProject={selectedProject}
              />
            </div>
          )}

          {/* Formulario */}
          {showForm && (
            <div className="mb-8">
              <TaskForm
                onSubmit={handleSubmitTask}
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

          <SearchAndFilters
            onSearch={setSearchTerm}
            onFilterChange={setAdvancedFilters}
            filters={advancedFilters}
            allTags={getAllTags()}
            users={users}
          />

          {/* Tabs de estado */}
          <div className="mb-6 flex gap-2">
            {['todas', 'pendiente', 'en-progreso', 'completada'].map((estado) => (
              <button
                key={estado}
                onClick={() => setFilter(estado)}
                className={`px-4 py-2 rounded-lg ${
                  filter === estado
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {estado.charAt(0).toUpperCase() + estado.slice(1)} (
                {estado === 'todas'
                  ? tasks.length
                  : tasks.filter((t) => t.status === estado).length}
                )
              </button>
            ))}
          </div>

          {/* Lista de tareas */}
          {!selectedProject ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              Selecciona un proyecto para ver tareas
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              {searchTerm || Object.values(advancedFilters).some((v) => v !== 'todas' && v !== 'todos')
                ? 'No hay tareas que coincidan con los filtros'
                : `No hay tareas ${filter !== 'todas' ? `con estado "${filter}"` : ''}`}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
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

      {showDetailModal && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setShowDetailModal(false)}
          onEdit={(task) => {
            setEditingTask(task);
            setShowForm(true);
            setShowDetailModal(false);
          }}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onTaskUpdate={(updatedTask) =>
            setTasks((prevTasks) =>
              prevTasks.map((t) => (t._id === updatedTask._id ? updatedTask : t))
            )
          }
        />
      )}
    </div>
  );
};

export default TasksPage;
