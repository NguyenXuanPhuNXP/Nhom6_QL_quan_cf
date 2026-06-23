const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');

// Route mẫu: trả về thông tin user từ token
router.get('/profile', authMiddleware, (req, res) => {
    res.status(200).json({
        message: 'Protected profile',
        user: req.user
    });
});

module.exports = router;
