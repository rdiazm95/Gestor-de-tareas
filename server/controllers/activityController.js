const Activity = require('../models/Activity');

// Obtener historial de una tarea
exports.getTaskActivities = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const activities = await Activity.find({ task: taskId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener historial', error: error.message });
  }
};

// Función auxiliar para crear actividad
exports.createActivity = async (type, taskId, userId, changes = null, metadata = null) => {
  try {
    const activity = new Activity({
      type,
      task: taskId,
      user: userId,
      changes: changes,
      metadata: metadata
    });
    
    await activity.save();
    return activity;
  } catch (error) {
    console.error('Error al crear actividad:', error);
  }
};

module.exports = {
  getTaskActivities: exports.getTaskActivities,
  createActivity: exports.createActivity
};
