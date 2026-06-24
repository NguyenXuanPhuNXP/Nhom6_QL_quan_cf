const db = require('../config/db');
const { isManagerRole } = require('../utils/roles');

const formatPayroll = (row) => ({
    payroll_id: row.payroll_id,
    employee_id: row.employee_id,
    month: row.month,
    year: row.year,
    total_hours: row.total_hours,
    bonus: row.bonus,
    penalty: row.penalty,
    total_salary: row.total_salary,
    created_at: row.created_at,
    updated_at: row.updated_at,
    employee: row.full_name
        ? { employee_id: row.employee_id, full_name: row.full_name }
        : undefined,
});

// Get all payroll records (admin/manager only)
exports.getAll = async (req, res) => {
    try {
        if (!isManagerRole(req.user.role_name)) {
            return res.status(403).json({ message: 'Không có quyền truy cập' });
        }

        const [rows] = await db.execute(
            `SELECT p.*, e.full_name
             FROM payroll p
             INNER JOIN employee e ON p.employee_id = e.employee_id
             ORDER BY p.year DESC, p.month DESC, e.full_name`
        );

        const formatted = rows.map(row => formatPayroll(row));
        return res.status(200).json(formatted);
    } catch (error) {
        console.error('getAll payroll error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};

// Get payroll by month/year
exports.getByMonth = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ message: 'Thiếu tháng hoặc năm' });
        }

        if (!isManagerRole(req.user.role_name)) {
            return res.status(403).json({ message: 'Không có quyền truy cập' });
        }

        const [rows] = await db.execute(
            `SELECT p.*, e.full_name
             FROM payroll p
             INNER JOIN employee e ON p.employee_id = e.employee_id
             WHERE p.month = ? AND p.year = ?
             ORDER BY e.full_name`,
            [month, year]
        );

        const formatted = rows.map(row => formatPayroll(row));
        return res.status(200).json(formatted);
    } catch (error) {
        console.error('getByMonth payroll error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};

// Get payroll for a specific employee
exports.getByEmployee = async (req, res) => {
    try {
        const { employee_id } = req.params;

        // Employee can only view their own payroll
        if (!isManagerRole(req.user.role_name) && req.user.employee_id !== parseInt(employee_id)) {
            return res.status(403).json({ message: 'Không có quyền truy cập' });
        }

        const [rows] = await db.execute(
            `SELECT p.*, e.full_name
             FROM payroll p
             INNER JOIN employee e ON p.employee_id = e.employee_id
             WHERE p.employee_id = ?
             ORDER BY p.year DESC, p.month DESC`,
            [employee_id]
        );

        const formatted = rows.map(row => formatPayroll(row));
        return res.status(200).json(formatted);
    } catch (error) {
        console.error('getByEmployee payroll error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};

// Create payroll record (admin/manager only)
exports.create = async (req, res) => {
    try {
        const { employee_id, month, year, total_hours, bonus, penalty, total_salary } = req.body;

        if (!isManagerRole(req.user.role_name)) {
            return res.status(403).json({ message: 'Không có quyền tạo bảng lương' });
        }

        if (!employee_id || !month || !year || total_salary === undefined) {
            return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc' });
        }

        // Check if payroll already exists for this month/year
        const [existing] = await db.execute(
            'SELECT payroll_id FROM payroll WHERE employee_id = ? AND month = ? AND year = ?',
            [employee_id, month, year]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Bảng lương tháng/năm này đã tồn tại' });
        }

        const [result] = await db.execute(
            `INSERT INTO payroll (employee_id, month, year, total_hours, bonus, penalty, total_salary)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [employee_id, month, year, total_hours || 0, bonus || 0, penalty || 0, total_salary]
        );

        return res.status(201).json({
            message: 'Tạo bảng lương thành công',
            payroll_id: result.insertId,
        });
    } catch (error) {
        console.error('create payroll error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};

// Update payroll record
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { month, year, total_hours, bonus, penalty, total_salary } = req.body;

        if (!isManagerRole(req.user.role_name)) {
            return res.status(403).json({ message: 'Không có quyền cập nhật bảng lương' });
        }

        const [rows] = await db.execute(
            'SELECT payroll_id FROM payroll WHERE payroll_id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bảng lương' });
        }

        const updates = [];
        const params = [];

        if (month !== undefined) { updates.push('month = ?'); params.push(month); }
        if (year !== undefined) { updates.push('year = ?'); params.push(year); }
        if (total_hours !== undefined) { updates.push('total_hours = ?'); params.push(total_hours); }
        if (bonus !== undefined) { updates.push('bonus = ?'); params.push(bonus); }
        if (penalty !== undefined) { updates.push('penalty = ?'); params.push(penalty); }
        if (total_salary !== undefined) { updates.push('total_salary = ?'); params.push(total_salary); }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'Không có dữ liệu cần cập nhật' });
        }

        params.push(id);
        await db.execute(
            `UPDATE payroll SET ${updates.join(', ')} WHERE payroll_id = ?`,
            params
        );

        return res.status(200).json({ message: 'Cập nhật bảng lương thành công' });
    } catch (error) {
        console.error('update payroll error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};

// Delete payroll record
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isManagerRole(req.user.role_name)) {
            return res.status(403).json({ message: 'Không có quyền xóa bảng lương' });
        }

        const [rows] = await db.execute(
            'SELECT payroll_id FROM payroll WHERE payroll_id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bảng lương' });
        }

        await db.execute('DELETE FROM payroll WHERE payroll_id = ?', [id]);
        return res.status(200).json({ message: 'Xóa bảng lương thành công' });
    } catch (error) {
        console.error('delete payroll error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};
