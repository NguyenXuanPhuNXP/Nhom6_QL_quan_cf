const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const auth = require('../middleware/auth');

router.get('/', auth, attendanceController.getAll);
router.post('/check-in', auth, attendanceController.checkIn);
router.put('/:id/check-out', auth, attendanceController.checkOut);

module.exports = router;
