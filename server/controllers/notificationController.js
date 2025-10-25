const Notification = require('../models/Notification');

// Obtener notificaciones del usuario
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.userId })
      .populate('task', 'title')
      .populate('relatedUser', 'name')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener notificaciones', error: error.message });
  }
};

// Marcar notificación como leída
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }
    
    if (notification.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    
    notification.read = true;
    await notification.save();
    
    res.json(notification);
  } catch (error) {
    res.status(400).json({ message: 'Error al marcar notificación', error: error.message });
  }
};

// Marcar todas como leídas
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.userId, read: false },
      { read: true }
    );
    
    res.json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    res.status(400).json({ message: 'Error al marcar notificaciones', error: error.message });
  }
};

// Obtener contador de no leídas
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.userId,
      read: false
    });
    
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error al contar notificaciones', error: error.message });
  }
};

// Eliminar notificación
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }
    
    if (notification.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    
    await Notification.findByIdAndDelete(notificationId);
    
    res.json({ message: 'Notificación eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar notificación', error: error.message });
  }
};

// Función auxiliar para crear notificaciones
exports.createNotification = async (type, userId, taskId, relatedUserId, customMessage = null) => {
  try {
    const messages = {
      'task_assigned': 'Te han asignado una nueva tarea',
      'task_comment': 'Nuevo comentario en tu tarea',
      'task_updated': 'Una tarea ha sido actualizada',
      'task_due_soon': 'Una tarea está próxima a vencer',
      'task_completed': 'Una tarea ha sido completada'
    };
    
    const notification = new Notification({
      type,
      message: customMessage || messages[type],
      user: userId,
      task: taskId,
      relatedUser: relatedUserId
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error al crear notificación:', error);
  }
};
