const db = require('../config/db');
//cone code for notification controller
exports.getMyNotifications = async (req, res) => {
    try {
        const employeeId = req.user.employee_id;

        const [rows] = await db.execute(
            `SELECT notification_id, employee_id, title, content, is_read, created_at
             FROM notification
             WHERE employee_id = ?
             ORDER BY created_at DESC`,
            [employeeId]
        );

        const normalized = rows.map((row) => ({
            ...row,
            is_read: Boolean(row.is_read),
        }));

        return res.status(200).json(normalized);
    } catch (error) {
        console.error('getMyNotifications error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const employeeId = req.user.employee_id;

        const [existing] = await db.execute(
            `SELECT notification_id FROM notification
             WHERE notification_id = ? AND employee_id = ?`,
            [id, employeeId]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy thông báo' });
        }

        await db.execute(
            `UPDATE notification SET is_read = TRUE WHERE notification_id = ?`,
            [id]
        );

        return res.status(200).json({ message: 'Đã đánh dấu đã đọc' });
    } catch (error) {
        console.error('markAsRead error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const employeeId = req.user.employee_id;

        const [rows] = await db.execute(
            `SELECT COUNT(*) AS count
             FROM notification
             WHERE employee_id = ? AND is_read = FALSE`,
            [employeeId]
        );

        return res.status(200).json({ count: rows[0].count });
    } catch (error) {
        console.error('getUnreadCount error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};
