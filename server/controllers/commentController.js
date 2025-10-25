const Comment = require('../models/Comment');
const Task = require('../models/Task');
const { createNotification } = require('./notificationController');

// Obtener todos los comentarios de una tarea
exports.getCommentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const comments = await Comment.find({ task: taskId })
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener comentarios', error: error.message });
  }
};

// Crear un nuevo comentario
exports.createComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'El comentario no puede estar vacío' });
    }
    
    const newComment = new Comment({
      content,
      task: taskId,
      author: req.userId
    });
    
    const savedComment = await newComment.save();
    const populatedComment = await Comment.findById(savedComment._id)
      .populate('author', 'name email avatar');
    
    // Obtener la tarea para notificar al creador y asignado
    const task = await Task.findById(taskId).populate('createdBy assignedTo');
    
    if (task) {
      // Notificar al creador si no es el que comentó
      if (task.createdBy && task.createdBy._id.toString() !== req.userId) {
        await createNotification(
          'task_comment',
          task.createdBy._id,
          taskId,
          req.userId,
          `${populatedComment.author.name} comentó en "${task.title}"`
        );
        
        const io = req.app.get('io');
        io.emit('newNotification', { userId: task.createdBy._id.toString() });
      }
      
      // Notificar al asignado si existe y no es el que comentó ni el creador
      if (task.assignedTo && 
          task.assignedTo._id.toString() !== req.userId && 
          task.assignedTo._id.toString() !== task.createdBy._id.toString()) {
        await createNotification(
          'task_comment',
          task.assignedTo._id,
          taskId,
          req.userId,
          `${populatedComment.author.name} comentó en "${task.title}"`
        );
        
        const io = req.app.get('io');
        io.emit('newNotification', { userId: task.assignedTo._id.toString() });
      }
    }
    
    // Emitir evento de Socket.io
    const io = req.app.get('io');
    io.emit('commentCreated', { taskId, comment: populatedComment });
    
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear comentario', error: error.message });
  }
};

// Actualizar un comentario
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comentario no encontrado' });
    }
    
    // Solo el autor puede editar
    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Solo el autor puede editar este comentario' });
    }
    
    comment.content = content;
    comment.updatedAt = Date.now();
    await comment.save();
    
    const updatedComment = await Comment.findById(commentId)
      .populate('author', 'name email avatar');
    
    // Emitir evento de Socket.io
    const io = req.app.get('io');
    io.emit('commentUpdated', updatedComment);
    
    res.json(updatedComment);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar comentario', error: error.message });
  }
};

// Eliminar un comentario
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comentario no encontrado' });
    }
    
    // Solo el autor puede eliminar
    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Solo el autor puede eliminar este comentario' });
    }
    
    await Comment.findByIdAndDelete(commentId);
    
    // Emitir evento de Socket.io
    const io = req.app.get('io');
    io.emit('commentDeleted', { commentId, taskId: comment.task });
    
    res.json({ message: 'Comentario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar comentario', error: error.message });
  }
};
