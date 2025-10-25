require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Configuración de Socket.io con CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Hacer io accesible en las rutas
app.set('io', io);

// Conexión a MongoDB usando variable de entorno
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/taskmanager';

mongoose.connect(MONGO_URI)
.then(() => console.log('✅ Conectado a MongoDB Atlas exitosamente'))
.catch((error) => {
  console.error('❌ Error al conectar a MongoDB:', error);
  console.log('💡 Verifica que tu archivo .env tenga la variable MONGO_URI correcta');
});

// Modelos
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

// Rutas
app.get('/', (req, res) => {
  res.json({ message: 'API del Gestor de Tareas funcionando' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));

// -------------------------
// 💬 SOCKET.IO - Tiempo real
// -------------------------
io.on('connection', (socket) => {
  console.log(`🔌 Usuario conectado: ${socket.id}`);

  // Usuario entra al sistema
  socket.on('join', async (userId) => {
    socket.userId = userId;
    socket.join(userId);
    
    try {
      await User.findByIdAndUpdate(userId, { isOnline: true });
      io.emit('userOnline', { userId });
    } catch (error) {
      console.error('Error al marcar usuario online:', error);
    }
  });

  // Escuchar eventos globales de proyectos y tareas
  socket.on('createProject', (project) => {
    io.emit('projectCreated', project);
  });

  socket.on('updateProject', (project) => {
    io.emit('projectUpdated', project);
  });

  socket.on('deleteProject', (projectId) => {
    io.emit('projectDeleted', projectId);
  });

  // Eventos de tareas
  socket.on('createTask', (data) => {
    io.emit('taskCreated', data);
  });

  socket.on('updateTask', (data) => {
    io.emit('taskUpdated', data);
  });

  socket.on('deleteTask', (data) => {
    io.emit('taskDeleted', data);
  });

  // Usuario se desconecta
  socket.on('disconnect', async () => {
    console.log(`❌ Usuario desconectado: ${socket.id}`);
    
    if (socket.userId) {
      try {
        await User.findByIdAndUpdate(socket.userId, { isOnline: false });
        io.emit('userOffline', { userId: socket.userId });
      } catch (error) {
        console.error('Error al actualizar usuario offline:', error);
      }
    }
  });
});

// -------------------------
// 🔔 Scheduler de notificaciones
// -------------------------
const { checkDueSoonTasks } = require('./utils/notificationScheduler');
checkDueSoonTasks();

// -------------------------
// ⚠️ Manejo global de errores
// -------------------------
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// -------------------------
// 🚀 Inicialización del servidor
// -------------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 Socket.io listo para eventos en tiempo real`);
  console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
});
