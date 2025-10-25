const Task = require('../models/Task');
const { deleteFile, cloudinary } = require('../config/cloudinary');
const { createNotification } = require('./notificationController');
const { createActivity } = require('./activityController');

// Obtener todas las tareas
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('project', 'name color icon')
      .populate('attachments.uploadedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las tareas', error: error.message });
  }
};

// Obtener tarea por ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('project', 'name color icon')
      .populate('attachments.uploadedBy', 'name');
    
    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la tarea', error: error.message });
  }
};

// Crear tarea CON REGISTRO DE ACTIVIDAD
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo, createdBy, dueDate, project, tags } = req.body;
    
    if (!project) {
      return res.status(400).json({ message: 'El proyecto es obligatorio' });
    }
    
    const newTask = new Task({
      title,
      description,
      status,
      priority,
      assignedTo,
      createdBy,
      dueDate,
      project,
      tags
    });
    
    const savedTask = await newTask.save();
    const populatedTask = await Task.findById(savedTask._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('project', 'name color icon');
    
    // REGISTRAR ACTIVIDAD: Tarea creada
    await createActivity(
      'task_created',
      savedTask._id,
      createdBy,
      null,
      { title, project }
    );
    
    // Si se asigna a alguien, registrar actividad de asignación
    if (assignedTo) {
      await createActivity(
        'assigned',
        savedTask._id,
        createdBy,
        { field: 'assignedTo', oldValue: null, newValue: assignedTo }
      );
      
      // Crear notificación
      if (assignedTo !== createdBy) {
        await createNotification(
          'task_assigned',
          assignedTo,
          savedTask._id,
          createdBy,
          `${populatedTask.createdBy.name} te ha asignado la tarea: ${title}`
        );
        
        const io = req.app.get('io');
        io.emit('newNotification', { userId: assignedTo });
      }
    }
    
    // Emitir evento de Socket.io
    const io = req.app.get('io');
   io.emit(`project:${project}:taskCreated`, { projectId: project, task: populatedTask });

// Si hay un usuario asignado y no es el creador, emitírselo también directamente
if (assignedTo && assignedTo.toString() !== createdBy.toString()) {
  io.emit(`user:${assignedTo}:taskAssigned`, { task: populatedTask });
}
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear la tarea', error: error.message });
  }
};

// Actualizar tarea CON REGISTRO DE ACTIVIDAD
exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo, dueDate, project, tags } = req.body;

    const oldTask = await Task.findById(req.params.id);
    if (!oldTask) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    // DETECTAR CAMBIOS: estado, prioridad, asignación, etc.

    // Estado
    if (status && status !== oldTask.status) {
      await createActivity('status_changed', oldTask._id, req.userId, { field: 'status', oldValue: oldTask.status, newValue: status });
    }

    // Prioridad
    if (priority && priority !== oldTask.priority) {
      await createActivity('priority_changed', oldTask._id, req.userId, { field: 'priority', oldValue: oldTask.priority, newValue: priority });
    }

    // Asignación
    const oldAssignedId = oldTask.assignedTo?.toString();
    const newAssignedId = assignedTo;
    if (newAssignedId !== undefined && newAssignedId !== oldAssignedId) {
      if (!oldAssignedId && newAssignedId) {
        await createActivity('assigned', oldTask._id, req.userId, { field: 'assignedTo', oldValue: null, newValue: newAssignedId });
      } else if (oldAssignedId && !newAssignedId) {
        await createActivity('unassigned', oldTask._id, req.userId, { field: 'assignedTo', oldValue: oldAssignedId, newValue: null });
      } else if (oldAssignedId && newAssignedId) {
        await createActivity('reassigned', oldTask._id, req.userId, { field: 'assignedTo', oldValue: oldAssignedId, newValue: newAssignedId });
      }
    }

    // Fecha límite
    if (dueDate !== undefined) {
      const oldDueDate = oldTask.dueDate ? oldTask.dueDate.toISOString().split('T')[0] : null;
      const newDueDate = dueDate ? new Date(dueDate).toISOString().split('T')[0] : null;
      if (oldDueDate !== newDueDate) {
        await createActivity('due_date_changed', oldTask._id, req.userId, { field: 'dueDate', oldValue: oldDueDate, newValue: newDueDate });
      }
    }

    // Proyecto
    if (project && project !== oldTask.project?.toString()) {
      await createActivity('project_changed', oldTask._id, req.userId, { field: 'project', oldValue: oldTask.project?.toString(), newValue: project });
    }

    // Etiquetas (corregido para comparar correctamente sin falsos positivos)
    if (tags !== undefined) {
      const oldTags = Array.isArray(oldTask.tags) ? [...oldTask.tags] : [];
      const newTags = Array.isArray(tags) ? [...tags] : [];

      const normalizedOld = oldTags.map(t => t.trim()).filter(Boolean).sort();
      const normalizedNew = newTags.map(t => t.trim()).filter(Boolean).sort();

      // Detectar diferencias reales
      const addedTags = normalizedNew.filter(tag => !normalizedOld.includes(tag));
      const removedTags = normalizedOld.filter(tag => !normalizedNew.includes(tag));

      for (const tag of addedTags) {
        await createActivity('tag_added', oldTask._id, req.userId, { field: 'tags', oldValue: null, newValue: tag });
      }
      for (const tag of removedTags) {
        await createActivity('tag_removed', oldTask._id, req.userId, { field: 'tags', oldValue: tag, newValue: null });
      }
    }

    // --- SOLO ACTUALIZAR CAMPOS DEFINIDOS ---
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (status !== undefined) updateFields.status = status;
    if (priority !== undefined) updateFields.priority = priority;
    if (assignedTo !== undefined) updateFields.assignedTo = assignedTo;
    if (dueDate !== undefined) updateFields.dueDate = dueDate;
    if (project !== undefined) updateFields.project = project;
    if (tags !== undefined) updateFields.tags = tags;
    updateFields.updatedAt = Date.now();

    // Actualización segura usando $set → mantiene los campos no enviados
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('project', 'name color icon');

    // Notificación si se cambió asignación
    if (assignedTo && assignedTo !== oldAssignedId) {
      await createNotification('task_assigned', assignedTo, updatedTask._id, req.userId, `Te han reasignado la tarea: ${title}`);
      req.app.get('io').emit('newNotification', { userId: assignedTo });
    }

    // Notificación si se completó
    if (status === 'completada' && oldTask.status !== 'completada' && oldTask.createdBy.toString() !== req.userId) {
      await createNotification('task_completed', oldTask.createdBy, updatedTask._id, req.userId, `La tarea "${title}" ha sido completada`);
      req.app.get('io').emit('newNotification', { userId: oldTask.createdBy.toString() });
    }

    req.app.get('io').emit('taskUpdated', updatedTask);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error al actualizar la tarea:', error);
    res.status(400).json({ message: 'Error al actualizar la tarea', error: error.message });
  }
};


// Eliminar tarea CON REGISTRO DE ACTIVIDAD
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    
    // REGISTRAR ACTIVIDAD: Tarea eliminada (antes de eliminarla)
    await createActivity(
      'task_deleted',
      task._id,
      req.userId,
      null,
      { title: task.title }
    );
    
    // Eliminar archivos adjuntos de Cloudinary
    if (task.attachments && task.attachments.length > 0) {
      for (const attachment of task.attachments) {
        try {
          await deleteFile(attachment.publicId);
        } catch (error) {
          console.error('Error al eliminar archivo de Cloudinary:', error);
        }
      }
    }
    
    await Task.findByIdAndDelete(req.params.id);
    
    // Emitir evento de Socket.io
    const io = req.app.get('io');
    io.emit(`project:${task.project}:taskDeleted`, { projectId: task.project, taskId: task._id });

// Si la tarea eliminada estaba asignada a alguien, enviarle evento directo
if (task.assignedTo) {
  io.emit(`user:${task.assignedTo._id}:taskDeleted`, { taskId: task._id });
}
    
    res.json({ message: 'Tarea eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la tarea', error: error.message });
  }
};

// Subir archivo adjunto CON REGISTRO DE ACTIVIDAD
exports.uploadAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No se proporcionó ningún archivo' });
    }
    
    const task = await Task.findById(id);
    
    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    
    // Determinar tipo de archivo
    let fileType = 'other';
    if (req.file.mimetype.startsWith('image/')) {
      fileType = 'image';
    } else if (
      req.file.mimetype.includes('pdf') ||
      req.file.mimetype.includes('document') ||
      req.file.mimetype.includes('word') ||
      req.file.mimetype.includes('excel') ||
      req.file.mimetype.includes('spreadsheet')
    ) {
      fileType = 'document';
    }
    
    // Crear objeto de adjunto
    const attachment = {
      filename: req.file.originalname,
      url: req.file.path,
      downloadUrl: req.file.path,
      publicId: req.file.filename,
      fileType: fileType,
      size: req.file.size,
      uploadedBy: req.userId,
      uploadedAt: new Date()
    };
    
    task.attachments.push(attachment);
await task.save();

await createActivity('attachment_added', task._id, req.userId, null, {
  filename: req.file.originalname,
  fileType,
});

// Recargar la tarea actualizada tras guardar, asegurando todos los populate
const updatedTask = await Task.findById(id)
  .populate('createdBy', 'name email')
  .populate('assignedTo', 'name email')
  .populate('project', 'name color icon')
  .populate('attachments.uploadedBy', 'name');

// *** IMPORTANTE - Esperar a tener la versión completa antes de emitir ***
const io = req.app.get('io');

// Canal de proyecto (para todos los miembros)
io.emit(`project:${updatedTask.project._id}:taskUpdated`, {
  projectId: updatedTask.project._id,
  task: updatedTask,
});

// Si la tarea tiene asignado un usuario, notifícale también directamente
if (updatedTask.assignedTo) {
  io.emit(`user:${updatedTask.assignedTo._id}:taskUpdated`, { task: updatedTask });
}

// Canal del usuario que la creó (por si no está asignado a sí mismo)
if (
  updatedTask.createdBy &&
  updatedTask.createdBy._id.toString() !== req.userId
) {
  io.emit(`user:${updatedTask.createdBy._id}:taskUpdated`, { task: updatedTask });
}

// *** RESPUESTA FINAL SERVIDOR DESPUÉS DEL EMIT ***
return res.status(201).json({
  message: 'Archivo subido correctamente',
      attachment: attachment,
      task: updatedTask
});
  } catch (error) {
    console.error('Error al subir archivo:', error);
    res.status(500).json({ message: 'Error al subir archivo', error: error.message });
  }
};

// Eliminar archivo adjunto CON REGISTRO DE ACTIVIDAD
exports.deleteAttachment = async (req, res) => {
  try {
    const { taskId, attachmentId } = req.params;
    
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    
    const attachment = task.attachments.id(attachmentId);
    
    if (!attachment) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }
    
    const filename = attachment.filename;
    
    // Eliminar de Cloudinary
    await deleteFile(attachment.publicId);
    
    // Eliminar de la base de datos
    task.attachments.pull(attachmentId);
    await task.save();
    
    // REGISTRAR ACTIVIDAD: Archivo eliminado
    await createActivity(
      'attachment_removed',
      task._id,
      req.userId,
      null,
      { filename }
    );
    
    const updatedTask = await Task.findById(taskId)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('project', 'name color icon')
      .populate('attachments.uploadedBy', 'name');
    
    // Emitir evento de Socket.io
    const io = req.app.get('io');
    io.emit('taskUpdated', { projectId: task.project, task });
    
    res.json({
      message: 'Archivo eliminado correctamente',
      task: updatedTask
    });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({ message: 'Error al eliminar archivo', error: error.message });
  }
};
