const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: 'Chưa đăng nhập'
            });
        }

        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Token không hợp lệ'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'my_super_secret_key'
        );

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            message: 'Token hết hạn hoặc không hợp lệ'
        });

    }
};