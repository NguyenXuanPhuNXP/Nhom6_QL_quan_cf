const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

router.post(
    '/accounts',
    auth,
    authorize('Admin'),
    accountController.createAccount
);

router.post('/login', authController.login);

module.exports = router;