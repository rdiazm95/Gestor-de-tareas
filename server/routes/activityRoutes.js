const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/task/:taskId', activityController.getTaskActivities);

module.exports = router;
