const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Auth endpoints
router.post('/login', authController.login);
router.post('/register', authController.register);

// Employee endpoints (mapped to functions in authController as per Develop branch structure)
router.get('/employees', auth, authController.getAllEmployees);
router.get('/employees/:id', auth, authController.getEmployeeById);
router.post('/employees', auth, authorize('Admin'), authController.createEmployee);
router.put('/employees/:id', auth, authorize('Admin'), authController.updateEmployee);
router.delete('/employees/:id', auth, authorize('Admin'), authController.deleteEmployee);

router.put('/profile', auth, authController.updateProfile);
router.put('/change-password', auth, authController.changePassword);

module.exports = router;