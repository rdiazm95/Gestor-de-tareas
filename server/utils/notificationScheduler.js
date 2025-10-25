const cron = require('node-cron');
const Task = require('../models/Task');
const { createNotification } = require('../controllers/notificationController');

// Verificar tareas próximas a vencer cada día a las 9:00 AM
const checkDueSoonTasks = () => {
  cron.schedule('0 9 * * *', async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Buscar tareas que vencen en las próximas 24 horas
      const dueSoonTasks = await Task.find({
        dueDate: {
          $gte: today,
          $lte: tomorrow
        },
        status: { $ne: 'completada' }
      }).populate('assignedTo createdBy');

      // Crear notificaciones
      for (const task of dueSoonTasks) {
        if (task.assignedTo) {
          await createNotification(
            'task_due_soon',
            task.assignedTo._id,
            task._id,
            null,
            `La tarea "${task.title}" vence mañana`
          );
        }
      }

      console.log(`✅ Verificación de tareas: ${dueSoonTasks.length} notificaciones enviadas`);
    } catch (error) {
      console.error('❌ Error al verificar tareas:', error);
    }
  });

  console.log('📅 Scheduler de notificaciones iniciado');
};

module.exports = { checkDueSoonTasks };
