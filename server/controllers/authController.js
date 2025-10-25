const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { createDefaultProject } = require('./projectController');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_temporal_cambiar_en_produccion';

// Generar token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Registro de usuario
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validar campos
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }
    
    // Crear usuario
    const user = new User({ name, email, password });
    await user.save();
    
    // Crear proyecto por defecto
    await createDefaultProject(user._id);
    
    // Generar token
    const token = generateToken(user._id);
    
    // Responder con usuario y token
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
  }
};
// Login de usuario
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar campos
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
    }
    
    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Actualizar estado online
    user.isOnline = true;
    user.lastSeen = Date.now();
    await user.save();
    
    // Generar token
    const token = generateToken(user._id);
    
    // Emitir evento de Socket.io
    const io = req.app.get('io');
    io.emit('userOnline', { userId: user._id, name: user.name });
    
    // Responder con usuario y token
    res.json({
      message: 'Login exitoso',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isOnline: user.isOnline
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
};

// Obtener perfil del usuario autenticado
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener perfil', error: error.message });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user) {
      user.isOnline = false;
      user.lastSeen = Date.now();
      await user.save();
      
      // Emitir evento de Socket.io
      const io = req.app.get('io');
      io.emit('userOffline', { userId: user._id });
    }
    
    res.json({ message: 'Logout exitoso' });
  } catch (error) {
    res.status(500).json({ message: 'Error al cerrar sesión', error: error.message });
  }
};
