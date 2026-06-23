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

router.get(
    '/employees',
    auth,
    employeeController.getAllEmployees
);
router.get(
    '/employees/:id',
    auth,
    employeeController.getEmployeeById
);
router.post(
    '/employees',
    auth,
    authorize('Admin'),
    employeeController.createEmployee
);
router.put(
    '/employees/:id',
    auth,
    authorize('Admin'),
    employeeController.updateEmployee
);
router.delete(
    '/employees/:id',
    auth,
    authorize('Admin'),
    employeeController.deleteEmployee
);
module.exports = router;