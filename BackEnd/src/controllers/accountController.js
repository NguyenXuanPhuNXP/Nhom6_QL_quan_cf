const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Get all accounts with employee and role info
exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                a.account_id,
                a.username,
                a.role_id,
                r.role_name,
                a.employee_id,
                e.full_name,
                e.phone,
                e.position_id,
                p.position_name,
                a.status
            FROM account a
            INNER JOIN role r ON a.role_id = r.role_id
            INNER JOIN employee e ON a.employee_id = e.employee_id
            LEFT JOIN positions p ON e.position_id = p.position_id
            ORDER BY a.account_id
        `);
        return res.status(200).json(rows);
    } catch (error) {
        console.error('getAll accounts error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};

// Get account by ID
exports.getById = async (req, res) => {
    try {
        const id = req.params.id;
        const [rows] = await db.execute(`
            SELECT 
                a.account_id,
                a.username,
                a.role_id,
                r.role_name,
                a.employee_id,
                e.full_name,
                e.phone,
                e.position_id,
                p.position_name,
                a.status
            FROM account a
            INNER JOIN role r ON a.role_id = r.role_id
            INNER JOIN employee e ON a.employee_id = e.employee_id
            LEFT JOIN positions p ON e.position_id = p.position_id
            WHERE a.account_id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
        }
        return res.status(200).json(rows[0]);
    } catch (error) {
        console.error('getById account error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};

// Update account (change role, status, or reset password)
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { role_id, status, password } = req.body;

        // Check account exists
        const [exists] = await db.execute(
            'SELECT account_id, role_id, status FROM account WHERE account_id = ?',
            [id]
        );
        if (exists.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
        }

        const current = exists[0];

        // Validate role if provided
        if (role_id) {
            const [roles] = await db.execute(
                'SELECT role_id FROM role WHERE role_id = ?',
                [role_id]
            );
            if (roles.length === 0) {
                return res.status(400).json({ message: 'Role không tồn tại' });
            }
        }

        // Validate status if provided
        if (status && !['Active', 'Locked'].includes(status)) {
            return res.status(400).json({ message: 'Trạng thái không hợp lệ (Active/Locked)' });
        }

        // Build update query dynamically
        const updates = [];
        const params = [];

        if (role_id) {
            updates.push('role_id = ?');
            params.push(role_id);
        }
        if (status) {
            updates.push('status = ?');
            params.push(status);
        }
        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push('password = ?');
            params.push(hashedPassword);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'Không có dữ liệu cần cập nhật' });
        }

        params.push(id);
        await db.execute(
            `UPDATE account SET ${updates.join(', ')} WHERE account_id = ?`,
            params
        );

        // Return updated account
        const [rows] = await db.execute(`
            SELECT 
                a.account_id,
                a.username,
                a.role_id,
                r.role_name,
                a.employee_id,
                e.full_name,
                e.phone,
                e.position_id,
                p.position_name,
                a.status
            FROM account a
            INNER JOIN role r ON a.role_id = r.role_id
            INNER JOIN employee e ON a.employee_id = e.employee_id
            LEFT JOIN positions p ON e.position_id = p.position_id
            WHERE a.account_id = ?
        `, [id]);

        return res.status(200).json(rows[0]);
    } catch (error) {
        console.error('update account error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};

// Delete account (does NOT delete the employee)
exports.remove = async (req, res) => {
    try {
        const id = req.params.id;
        const [exists] = await db.execute(
            'SELECT account_id FROM account WHERE account_id = ?',
            [id]
        );
        if (exists.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
        }

        await db.execute('DELETE FROM account WHERE account_id = ?', [id]);
        return res.status(200).json({ message: 'Xóa tài khoản thành công' });
    } catch (error) {
        console.error('remove account error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};

// Get all roles (for dropdowns)
exports.getRoles = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT role_id, role_name FROM role ORDER BY role_id');
        return res.status(200).json(rows);
    } catch (error) {
        console.error('getRoles error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};
