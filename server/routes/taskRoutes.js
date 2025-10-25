const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Todas las rutas requieren autenticación
router.use(auth);

// Rutas de tareas
router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

// Rutas de archivos adjuntos
router.post('/:id/attachments', upload.single('file'), taskController.uploadAttachment);

router.delete('/:taskId/attachments/:attachmentId', taskController.deleteAttachment);

module.exports = router;
