const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const auth = require('../middleware/auth');

// Get all payroll records
router.get('/', auth, payrollController.getAll);

// Get payroll by month/year
router.get('/month', auth, payrollController.getByMonth);

// Get payroll for specific employee
router.get('/employee/:employee_id', auth, payrollController.getByEmployee);

// Create payroll record
router.post('/', auth, payrollController.create);

// Update payroll record
router.put('/:id', auth, payrollController.update);

// Delete payroll record
router.delete('/:id', auth, payrollController.delete);

module.exports = router;
