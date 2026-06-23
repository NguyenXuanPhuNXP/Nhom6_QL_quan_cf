const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

router.post(
    '/accounts',
    auth,
    authorize('Admin'),
    accountController.createAccount
);

router.put(
    '/accounts/:id',
    auth,
    authorize('Admin'),
    accountController.updateAccount
);
router.patch(
    '/accounts/:id/status',
    auth,
    authorize('Admin'),
    accountController.changeStatus
);

router.post('/login', authController.login);

module.exports = router;