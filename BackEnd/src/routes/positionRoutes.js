const express = require('express');
const router = express.Router();
const positionController = require('../controllers/positionController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// GET /api/positions - Authenticated users can view
router.get('/', auth, positionController.getAll);

// GET /api/positions/:id - Authenticated users can view
router.get('/:id', auth, positionController.getById);

// POST /api/positions - Only Admin can create
router.post('/', auth, authorize('Admin'), positionController.create);

// PUT /api/positions/:id - Only Admin can update
router.put('/:id', auth, authorize('Admin'), positionController.update);

// DELETE /api/positions/:id - Only Admin can delete
router.delete('/:id', auth, authorize('Admin'), positionController.remove);

module.exports = router;
