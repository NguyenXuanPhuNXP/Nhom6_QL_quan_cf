const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Public endpoints
router.post('/login', authController.login);
router.post('/register', authController.register);

// Admin endpoints
router.post(
    '/accounts',
    auth,
    authorize('Admin'),
    authController.createAccount
);


module.exports = router;