const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Public for all authenticated users - view schedules
router.get('/', auth, scheduleController.getAll);
router.get('/week', auth, scheduleController.getByWeek);
router.get('/shifts', auth, scheduleController.getAllShifts);
router.get('/employees', auth, scheduleController.getEmployees);

// Only Admin & Quản lý can create/update/delete
router.post('/', auth, authorize('Admin', 'Quản lý'), scheduleController.create);
router.put('/:id', auth, authorize('Admin', 'Quản lý'), scheduleController.update);
router.delete('/:id', auth, authorize('Admin', 'Quản lý'), scheduleController.remove);

module.exports = router;
