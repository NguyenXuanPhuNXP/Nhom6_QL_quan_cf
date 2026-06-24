const normalizeRole = (role = '') =>
    String(role)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

module.exports = (...roles) => {
    const allowedRoles = roles.map(normalizeRole);

    return (req, res, next) => {
        if (!allowedRoles.includes(normalizeRole(req.user.role_name))) {
            return res.status(403).json({
                message: 'Không có quyền truy cập'
            });
        }

        next();
    };
};
