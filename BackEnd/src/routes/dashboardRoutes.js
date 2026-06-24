const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

// All dashboard routes require authentication
router.get('/stats', auth, dashboardController.getStats);
router.get('/attendance-chart', auth, dashboardController.getAttendanceChart);
router.get('/today-schedule', auth, dashboardController.getTodaySchedule);

module.exports = router;
