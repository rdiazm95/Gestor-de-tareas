import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { taskService } from '../services/api';
import { projectService } from '../services/projectService';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import NotificationBell from '../components/NotificationBell';
import AdvancedStats from '../components/AdvancedStats';
import TaskStatusChart from '../components/TaskStatusChart';
import TaskPriorityChart from '../components/TaskPriorityChart';
import UpcomingTasks from '../components/UpcomingTasks';
import RecentActivity from '../components/RecentActivity';

const DashboardPage = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksResponse, projectsResponse] = await Promise.all([
        taskService.getAll(),
        projectService.getAll()
      ]);
      
      setTasks(tasksResponse.data);
      setProjects(projectsResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar datos del dashboard');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              📊 Dashboard
            </h1>
            <p className="text-gray-600">
              Bienvenido, <span className="font-medium">{user?.name}</span>
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <NotificationBell />
            <ThemeToggle />
            <button
              onClick={() => navigate('/tasks')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Ver Tareas
            </button>
            <button
              onClick={() => navigate('/kanban')}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
            >
              Vista Kanban
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Estadísticas avanzadas */}
        <AdvancedStats tasks={tasks} projects={projects} />

        {/* Gráficas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <TaskStatusChart tasks={tasks} />
          <TaskPriorityChart tasks={tasks} />
        </div>

        {/* Tareas próximas y actividad reciente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UpcomingTasks tasks={tasks} />
          <RecentActivity tasks={tasks} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
