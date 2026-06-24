const express = require('express');
const router = express.Router();
const leaveRequestController = require('../controllers/leaveRequestController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', auth, leaveRequestController.getAll);
router.post('/', auth, leaveRequestController.create);
router.put('/:id/approve', auth, authorize('Admin', 'Quản lý'), leaveRequestController.approve);
router.put('/:id/reject', auth, authorize('Admin', 'Quản lý'), leaveRequestController.reject);

module.exports = router;
