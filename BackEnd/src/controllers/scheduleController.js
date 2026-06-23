const db = require('../config/db');

// GET all schedules (with employee + shift info)
exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                s.schedule_id,
                s.employee_id,
                s.shift_id,
                s.work_date,
                s.status,
                e.full_name,
                sh.shift_name,
                sh.start_time,
                sh.end_time,
                sh.salary_multiplier
            FROM schedule s
            INNER JOIN employee e ON s.employee_id = e.employee_id
            INNER JOIN shift sh ON s.shift_id = sh.shift_id
            ORDER BY s.work_date DESC, e.full_name
        `);
        
        // Format for frontend compatibility
        const formatted = rows.map(row => ({
            schedule_id: row.schedule_id,
            employee_id: row.employee_id,
            shift_id: row.shift_id,
            work_date: row.work_date instanceof Date 
                ? row.work_date.toISOString().split('T')[0] 
                : String(row.work_date).split('T')[0],
            status: row.status,
            employee: { employee_id: row.employee_id, full_name: row.full_name },
            shift: { 
                shift_id: row.shift_id, 
                shift_name: row.shift_name, 
                start_time: row.start_time, 
                end_time: row.end_time,
                salary_multiplier: row.salary_multiplier
            }
        }));

        return res.status(200).json(formatted);
    } catch (error) {
        console.error('getAll schedules error:', error);
        return res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

// GET schedules by date range
exports.getByWeek = async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) {
            return res.status(400).json({ message: 'Cần truyền start và end date' });
        }

        const [rows] = await db.execute(`
            SELECT 
                s.schedule_id,
                s.employee_id,
                s.shift_id,
                s.work_date,
                s.status,
                e.full_name,
                sh.shift_name,
                sh.start_time,
                sh.end_time,
                sh.salary_multiplier
            FROM schedule s
            INNER JOIN employee e ON s.employee_id = e.employee_id
            INNER JOIN shift sh ON s.shift_id = sh.shift_id
            WHERE s.work_date BETWEEN ? AND ?
            ORDER BY s.work_date, e.full_name
        `, [start, end]);

        const formatted = rows.map(row => ({
            schedule_id: row.schedule_id,
            employee_id: row.employee_id,
            shift_id: row.shift_id,
            work_date: row.work_date instanceof Date 
                ? row.work_date.toISOString().split('T')[0] 
                : String(row.work_date).split('T')[0],
            status: row.status,
            employee: { employee_id: row.employee_id, full_name: row.full_name },
            shift: { 
                shift_id: row.shift_id, 
                shift_name: row.shift_name, 
                start_time: row.start_time, 
                end_time: row.end_time,
                salary_multiplier: row.salary_multiplier
            }
        }));

        return res.status(200).json(formatted);
    } catch (error) {
        console.error('getByWeek schedules error:', error);
        return res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

// POST create schedule
exports.create = async (req, res) => {
    try {
        const { employee_id, shift_id, work_date } = req.body;

        if (!employee_id || !shift_id || !work_date) {
            return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc' });
        }

        // Check duplicate
        const [existing] = await db.execute(
            'SELECT schedule_id FROM schedule WHERE employee_id = ? AND shift_id = ? AND work_date = ?',
            [employee_id, shift_id, work_date]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Nhân viên đã được phân ca này trong ngày' });
        }

        const [result] = await db.execute(
            `INSERT INTO schedule (employee_id, shift_id, work_date, status) 
             VALUES (?, ?, ?, 'Da_phan_cong')`,
            [employee_id, shift_id, work_date]
        );

        return res.status(201).json({ 
            message: 'Thêm lịch thành công',
            schedule_id: result.insertId 
        });
    } catch (error) {
        console.error('create schedule error:', error);
        return res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

// PUT update schedule
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { employee_id, shift_id, work_date, status } = req.body;

        const [exists] = await db.execute(
            'SELECT schedule_id FROM schedule WHERE schedule_id = ?', [id]
        );
        if (exists.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy lịch làm việc' });
        }

        const updates = [];
        const params = [];

        if (employee_id) { updates.push('employee_id = ?'); params.push(employee_id); }
        if (shift_id) { updates.push('shift_id = ?'); params.push(shift_id); }
        if (work_date) { updates.push('work_date = ?'); params.push(work_date); }
        if (status) { updates.push('status = ?'); params.push(status); }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'Không có dữ liệu cần cập nhật' });
        }

        params.push(id);
        await db.execute(
            `UPDATE schedule SET ${updates.join(', ')} WHERE schedule_id = ?`,
            params
        );

        return res.status(200).json({ message: 'Cập nhật lịch thành công' });
    } catch (error) {
        console.error('update schedule error:', error);
        return res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

// DELETE schedule
exports.remove = async (req, res) => {
    try {
        const id = req.params.id;
        const [exists] = await db.execute(
            'SELECT schedule_id FROM schedule WHERE schedule_id = ?', [id]
        );
        if (exists.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy lịch làm việc' });
        }

        await db.execute('DELETE FROM schedule WHERE schedule_id = ?', [id]);
        return res.status(200).json({ message: 'Xóa lịch thành công' });
    } catch (error) {
        console.error('remove schedule error:', error);
        return res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

// GET all shifts
exports.getAllShifts = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT shift_id, shift_name, start_time, end_time, salary_multiplier FROM shift ORDER BY start_time'
        );
        return res.status(200).json(rows);
    } catch (error) {
        console.error('getAllShifts error:', error);
        return res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

// GET all employees (for dropdown)
exports.getEmployees = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT e.employee_id, e.full_name, p.position_name 
            FROM employee e
            LEFT JOIN positions p ON e.position_id = p.position_id
            ORDER BY e.full_name
        `);
        return res.status(200).json(rows);
    } catch (error) {
        console.error('getEmployees error:', error);
        return res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};
