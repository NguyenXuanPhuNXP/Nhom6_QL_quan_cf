const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// All routes require Admin role
// GET /api/accounts - List all accounts
router.get('/', auth, authorize('Admin'), accountController.getAll);

// GET /api/accounts/roles - List all roles (for dropdown)
router.get('/roles', auth, authorize('Admin'), accountController.getRoles);

// GET /api/accounts/:id - Get single account
router.get('/:id', auth, authorize('Admin'), accountController.getById);

// POST /api/accounts - Create account (reuse authController.createAccount)
router.post('/', auth, authorize('Admin'), authController.createAccount);

// PUT /api/accounts/:id - Update account (role, status, password)
router.put('/:id', auth, authorize('Admin'), accountController.update);

// DELETE /api/accounts/:id - Delete account
router.delete('/:id', auth, authorize('Admin'), accountController.remove);

module.exports = router;
