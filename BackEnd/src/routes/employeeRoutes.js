const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// GET /api/employees - Authenticated users can view
router.get('/', auth, employeeController.getAll);

// GET /api/employees/:id - Authenticated users can view
router.get('/:id', auth, employeeController.getById);

// POST /api/employees - Only Admin can create
router.post('/', auth, authorize('Admin'), employeeController.create);

// PUT /api/employees/:id - Only Admin can update
router.put('/:id', auth, authorize('Admin'), employeeController.update);

// DELETE /api/employees/:id - Only Admin can delete
router.delete('/:id', auth, authorize('Admin'), employeeController.remove);

module.exports = router;
