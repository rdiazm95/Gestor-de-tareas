const Project = require('../models/Project');
const Task = require('../models/Task');

// ✅ Obtener todos los proyectos del usuario
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.userId }, { members: req.userId }]
    })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    // Contar tareas asociadas a cada proyecto
    const projectsWithCount = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({ project: project._id });
        return { ...project.toObject(), taskCount };
      })
    );

    res.json(projectsWithCount);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener proyectos', error: error.message });
  }
};

// ✅ Obtener un proyecto por ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    const hasAccess =
      project.owner._id.toString() === req.userId ||
      project.members.some((m) => m._id.toString() === req.userId);

    if (!hasAccess) {
      return res.status(403).json({ message: 'No tienes acceso a este proyecto' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener proyecto', error: error.message });
  }
};

// ✅ Crear un nuevo proyecto
exports.createProject = async (req, res) => {
  try {
    const { name, description, color, icon, members } = req.body;

    const newProject = new Project({
      name,
      description,
      color,
      icon,
      owner: req.userId,
      members: members || []
    });

    const savedProject = await newProject.save();
    const populatedProject = await Project.findById(savedProject._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    // Emitir evento de Socket.io
    const io = req.app.get('io');
    io.emit('projectCreated', populatedProject);

    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear proyecto', error: error.message });
  }
};

// ✅ Actualizar proyecto
exports.updateProject = async (req, res) => {
  try {
    const { name, description, color, icon, members } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Solo el propietario puede actualizar el proyecto' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, color, icon, members, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
      .populate('owner', 'name email')
      .populate('members', 'name email');

    const io = req.app.get('io');
    io.emit('projectUpdated', updatedProject);

    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar proyecto', error: error.message });
  }
};

// ✅ Eliminar proyecto con notificación en tiempo real
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Solo el propietario puede eliminar el proyecto' });
    }

    if (project.isDefault) {
      return res.status(400).json({ message: 'No se puede eliminar el proyecto por defecto' });
    }

    const taskCount = await Task.countDocuments({ project: project._id });
    if (taskCount > 0) {
      return res.status(400).json({
        message: `No se puede eliminar el proyecto porque tiene ${taskCount} tarea(s) asociada(s)`
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    const io = req.app.get('io');
    io.emit('projectDeleted', req.params.id);

    res.json({ message: 'Proyecto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar proyecto', error: error.message });
  }
};

// ✅ Crear proyecto por defecto
exports.createDefaultProject = async (userId) => {
  try {
    const defaultProject = new Project({
      name: 'General',
      description: 'Proyecto por defecto',
      color: '#3b82f6',
      icon: '📋',
      owner: userId,
      isDefault: true
    });

    await defaultProject.save();
    return defaultProject;
  } catch (error) {
    console.error('Error al crear proyecto por defecto:', error);
    throw error;
  }
};
