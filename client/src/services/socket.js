import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

// Inicializamos el socket con configuración ampliada
export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket'], // Prioriza WebSocket nativo
  reconnection: true,
  reconnectionDelay: 2000,
  reconnectionAttempts: 10,
  timeout: 10000 // Evita bloqueos si el servidor no responde
});

// Funciones auxiliares
export const connectSocket = () => {
  if (!socket.connected) {
    console.log('🔌 Conectando al servidor Socket.io...');
    socket.connect();
  } else {
    console.log('✅ Socket.io ya está conectado');
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    console.log('🔌 Desconectando de Socket.io...');
    socket.disconnect();
  } else {
    console.log('⚠️ Socket.io ya estaba desconectado');
  }
};

// Event listeners básicos (solo informativos)
socket.on('connect', () => {
  console.log(`🟢 Conectado al servidor Socket.io (${socket.id})`);
});

socket.on('disconnect', (reason) => {
  console.log(`🔴 Desconectado de Socket.io: ${reason}`);
});

socket.on('connect_error', (error) => {
  console.error('❌ Error de conexión con Socket.io:', error.message);
});

// Eventos globales para sincronización
// Estos son los tipos de eventos compartidos entre todos los usuarios
socket.on('taskCreated', ({ projectId, task }) => {
  console.log(`📦 Nueva tarea en proyecto ${projectId}:`, task.title);
});

socket.on('taskUpdated', ({ projectId, task }) => {
  console.log(`✏️ Tarea actualizada (${task._id}) en proyecto ${projectId}`);
});

socket.on('taskDeleted', ({ projectId, taskId }) => {
  console.log(`🗑️ Tarea eliminada (${taskId}) del proyecto ${projectId}`);
});

socket.on('projectCreated', (project) => {
  console.log(`📁 Nuevo proyecto creado: ${project.name}`);
});

socket.on('projectUpdated', (project) => {
  console.log(`🔧 Proyecto actualizado: ${project.name}`);
});

socket.on('projectDeleted', (projectId) => {
  console.log(`🗂️ Proyecto eliminado: ${projectId}`);
});

socket.on('newNotification', ({ userId }) => {
  console.log(`🔔 Nueva notificación para usuario ${userId}`);
});

// Exportación por defecto
export default socket;