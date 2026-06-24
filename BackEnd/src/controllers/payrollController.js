const db = require('../config/db');
const { isManagerRole } = require('../utils/roles');

// Calculate salary based on hours worked
const calculateSalary = (totalHours, hourlyRate = 37500) => {
    const regularHours = Math.min(totalHours, 160);
    const overtimeHours = Math.max(0, totalHours - 160);
    
    const regularSalary = regularHours * hourlyRate;
    const overtimeSalary = overtimeHours * (hourlyRate * 1.5);
    
    return regularSalary + overtimeSalary;
};

const formatPayroll = (row) => ({
    payroll_id: row.payroll_id,
    employee_id: row.employee_id,
    month: row.month,
    year: row.year,
    total_hours: parseFloat(row.total_hours),
    base_salary: parseFloat(row.base_salary || 0),
    bonus: parseFloat(row.bonus || 0),
    penalty: parseFloat(row.penalty || 0),
    total_salary: parseFloat(row.total_salary),
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

// Calculate salary for a month (automatic)
// This is the key endpoint for salary calculation
exports.calculatePayroll = async (req, res) => {
    try {
        const { month, year, employee_id } = req.body;

        if (!isManagerRole(req.user.role_name)) {
            return res.status(403).json({ message: 'Không có quyền tính lương' });
        }

        if (!month || !year) {
            return res.status(400).json({ message: 'Thiếu tháng hoặc năm' });
        }

        let query = `
            SELECT 
                SUM(TIMESTAMPDIFF(HOUR, a.check_in, a.check_out)) as total_hours,
                a.employee_id,
                e.full_name
            FROM attendance a
            INNER JOIN employee e ON a.employee_id = e.employee_id
            WHERE MONTH(a.check_in) = ? AND YEAR(a.check_in) = ?
        `;
        let params = [month, year];

        if (employee_id) {
            query += ' AND a.employee_id = ?';
            params.push(employee_id);
        }

        query += ` GROUP BY a.employee_id, e.full_name`;

        const [attendanceData] = await db.execute(query, params);

        if (!attendanceData || attendanceData.length === 0) {
            return res.status(404).json({ message: 'Không có dữ liệu chấm công cho tháng này' });
        }

        // Calculate salary for each employee
        const payrollRecords = attendanceData.map(record => {
            const totalHours = record.total_hours || 0;
            const baseSalary = calculateSalary(totalHours);
            
            return {
                employee_id: record.employee_id,
                month: month,
                year: year,
                total_hours: totalHours,
                base_salary: baseSalary,
                bonus: 0,
                penalty: 0,
                total_salary: baseSalary,
                full_name: record.full_name
            };
        });

        return res.status(200).json({
            message: 'Tính lương thành công',
            payroll: payrollRecords,
            count: payrollRecords.length
        });
    } catch (error) {
        console.error('calculatePayroll error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};

// Create payroll record
exports.create = async (req, res) => {
    try {
        const { employee_id, month, year, total_hours, bonus, penalty, total_salary } = req.body;

        if (!isManagerRole(req.user.role_name)) {
            return res.status(403).json({ message: 'Không có quyền tạo bảng lương' });
        }

        if (!employee_id || !month || !year) {
            return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc (employee_id, month, year)' });
        }

        // Check if payroll already exists for this month/year
        const [existing] = await db.execute(
            'SELECT payroll_id FROM payroll WHERE employee_id = ? AND month = ? AND year = ?',
            [employee_id, month, year]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Bảng lương tháng/năm này đã tồn tại' });
        }

        // Calculate base salary from hours or use provided total_salary
        let baseSalary = 0;
        if (total_hours !== undefined && total_hours > 0) {
            baseSalary = calculateSalary(total_hours);
        } else if (total_salary !== undefined && total_salary > 0) {
            baseSalary = total_salary;
        }

        const finalSalary = baseSalary + (bonus || 0) - (penalty || 0);

        const [result] = await db.execute(
            `INSERT INTO payroll (employee_id, month, year, total_hours, base_salary, bonus, penalty, total_salary)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [employee_id, month, year, total_hours || 0, baseSalary, bonus || 0, penalty || 0, finalSalary]
        );

        return res.status(201).json({
            message: 'Tạo bảng lương thành công',
            payroll_id: result.insertId,
            base_salary: baseSalary,
            total_salary: finalSalary
        });
    } catch (error) {
        console.error('create payroll error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};

// Update payroll record with salary calculation
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { month, year, total_hours, bonus, penalty } = req.body;

        if (!isManagerRole(req.user.role_name)) {
            return res.status(403).json({ message: 'Không có quyền cập nhật bảng lương' });
        }

        const [currentRecords] = await db.execute(
            'SELECT payroll_id, total_hours, base_salary, bonus, penalty FROM payroll WHERE payroll_id = ?',
            [id]
        );

        if (currentRecords.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bảng lương' });
        }

        const currentRecord = currentRecords[0];
        const updates = [];
        const params = [];

        if (month !== undefined) { updates.push('month = ?'); params.push(month); }
        if (year !== undefined) { updates.push('year = ?'); params.push(year); }
        
        // Calculate new values with existing ones as defaults
        let newBaseSalary = currentRecord.base_salary;
        let newBonus = bonus !== undefined ? bonus : currentRecord.bonus;
        let newPenalty = penalty !== undefined ? penalty : currentRecord.penalty;

        // Recalculate base salary if hours change
        if (total_hours !== undefined) { 
            updates.push('total_hours = ?'); 
            params.push(total_hours);
            newBaseSalary = calculateSalary(total_hours);
            updates.push('base_salary = ?');
            params.push(newBaseSalary);
        }
        
        if (bonus !== undefined) { updates.push('bonus = ?'); params.push(bonus); }
        if (penalty !== undefined) { updates.push('penalty = ?'); params.push(penalty); }

        // Recalculate total_salary
        if (updates.length > 0) {
            const totalSalary = newBaseSalary + newBonus - newPenalty;
            updates.push('total_salary = ?');
            params.push(totalSalary);
        }

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
