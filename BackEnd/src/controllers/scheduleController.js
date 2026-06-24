const db = require('../config/db');
const { createNotification } = require('../services/notificationService');
const { formatDateOnly } = require('../utils/date');

const DEFAULT_SHIFTS = [
    { shift_name: 'Ca sáng', start_time: '06:00:00', end_time: '11:00:00', salary_multiplier: 1 },
    { shift_name: 'Ca trưa', start_time: '11:00:00', end_time: '16:00:00', salary_multiplier: 1 },
    { shift_name: 'Ca chiều', start_time: '16:00:00', end_time: '22:00:00', salary_multiplier: 1 }
];

const ensureDefaultShifts = async () => {
    const [existingLunchShift] = await db.execute(
        'SELECT shift_id FROM shift WHERE shift_name = ? LIMIT 1',
        ['Ca trưa']
    );
    if (existingLunchShift.length === 0) {
        const [oldNightShift] = await db.execute(
            'SELECT shift_id FROM shift WHERE shift_name = ? LIMIT 1',
            ['Ca tối']
        );
        if (oldNightShift.length > 0) {
            await db.execute(
                `UPDATE shift
                 SET shift_name = ?, start_time = ?, end_time = ?, salary_multiplier = ?
                 WHERE shift_id = ?`,
                ['Ca trưa', '11:00:00', '16:00:00', 1, oldNightShift[0].shift_id]
            );
        }
    }
    for (const shift of DEFAULT_SHIFTS) {
        const [existingByName] = await db.execute(
            'SELECT shift_id FROM shift WHERE shift_name = ? LIMIT 1',
            [shift.shift_name]
        );
        if (existingByName.length > 0) {
            await db.execute(
                `UPDATE shift
                 SET start_time = ?, end_time = ?, salary_multiplier = ?
                 WHERE shift_id = ?`,
                [
                    shift.start_time,
                    shift.end_time,
                    shift.salary_multiplier,
                    existingByName[0].shift_id
                ]
            );
            continue;
        }
        const [existingByTime] = await db.execute(
            'SELECT shift_id FROM shift WHERE start_time = ? AND end_time = ? LIMIT 1',
            [shift.start_time, shift.end_time]
        );
        if (existingByTime.length > 0) {
            await db.execute(
                `UPDATE shift
                 SET shift_name = ?, salary_multiplier = ?
                 WHERE shift_id = ?`,
                [shift.shift_name, shift.salary_multiplier, existingByTime[0].shift_id]
            );
            continue;
        }
        await db.execute(
            `INSERT INTO shift (shift_name, start_time, end_time, salary_multiplier)
             VALUES (?, ?, ?, ?)`,
            [shift.shift_name, shift.start_time, shift.end_time, shift.salary_multiplier]
        );
    }
};

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
            work_date: formatDateOnly(row.work_date),
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
            work_date: formatDateOnly(row.work_date),
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

// POST create schedule (API phân ca)
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
            //Create Schedule
            `INSERT INTO schedule (employee_id, shift_id, work_date, status) 
             VALUES (?, ?, ?, 'Da_phan_cong')`,
            [employee_id, shift_id, work_date]
        );

        const [shiftRows] = await db.execute(
            `SELECT shift_name, start_time, end_time FROM shift WHERE shift_id = ?`,
            [shift_id]
        );
        const shift = shiftRows[0];
        const shiftLabel = shift
            ? `${shift.shift_name} (${String(shift.start_time).slice(0, 5)} - ${String(shift.end_time).slice(0, 5)})`
            : 'ca làm việc';

        await createNotification(
            employee_id,
            'Lịch làm việc mới',
            `Bạn được phân ${shiftLabel} vào ngày ${work_date}.`
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
        await ensureDefaultShifts();

        const [rows] = await db.execute(
            `SELECT shift_id, shift_name, start_time, end_time, salary_multiplier
             FROM shift
             WHERE shift_name IN (?, ?, ?)
             ORDER BY start_time`,
            DEFAULT_SHIFTS.map((shift) => shift.shift_name)
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

// POST create new shift (ĐÃ BỔ SUNG VALIDATE)
exports.createShift = async (req, res) => {
    try {
        const { shift_name, start_time, end_time, salary_multiplier = 1 } = req.body;

        if (!shift_name || !start_time || !end_time) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }

        // --- BẮT ĐẦU HOÀN THIỆN VALIDATE ---
        if (start_time === end_time) {
            return res.status(400).json({ message: 'Thời gian bắt đầu và kết thúc ca không được trùng nhau' });
        }

        if (Number(salary_multiplier) < 1 || Number(salary_multiplier) > 5) {
            return res.status(400).json({ message: 'Hệ số lương phải nằm trong khoảng từ 1 đến 5' });
        }
        // --- KẾT THÚC HOÀN THIỆN VALIDATE ---

        // Check duplicate name
        const [existing] = await db.execute(
            'SELECT shift_id FROM shift WHERE shift_name = ?',
            [shift_name]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Tên ca đã tồn tại' });
        }

        const [result] = await db.execute(
            `INSERT INTO shift (shift_name, start_time, end_time, salary_multiplier)
             VALUES (?, ?, ?, ?)`,
            [shift_name, start_time, end_time, salary_multiplier]
        );

        return res.status(201).json({
            message: 'Thêm ca thành công',
            shift_id: result.insertId
        });
    } catch (error) {
        console.error('createShift error:', error);
        return res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

// PUT update shift (ĐÃ BỔ SUNG VALIDATE)
exports.updateShift = async (req, res) => {
    try {
        const id = req.params.id;
        const { shift_name, start_time, end_time, salary_multiplier } = req.body;

        // Lấy thêm start_time và end_time hiện tại từ DB để phục vụ so sánh validate khi update lẻ trường
        const [exists] = await db.execute(
            'SELECT shift_id, start_time, end_time FROM shift WHERE shift_id = ?',
            [id]
        );
        if (exists.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy ca làm việc' });
        }

        // --- BẮT ĐẦU HOÀN THIỆN VALIDATE ---
        const finalStartTime = start_time || exists[0].start_time;
        const finalEndTime = end_time || exists[0].end_time;

        if (finalStartTime === finalEndTime) {
            return res.status(400).json({ message: 'Thời gian bắt đầu và kết thúc ca không được trùng nhau' });
        }

        if (salary_multiplier !== undefined) {
            if (Number(salary_multiplier) < 1 || Number(salary_multiplier) > 5) {
                return res.status(400).json({ message: 'Hệ số lương phải nằm trong khoảng từ 1 đến 5' });
            }
        }
        // --- KẾT THÚC HOÀN THIỆN VALIDATE ---

        // Check duplicate name (except current)
        if (shift_name) {
            const [existing] = await db.execute(
                'SELECT shift_id FROM shift WHERE shift_name = ? AND shift_id != ?',
                [shift_name, id]
            );
            if (existing.length > 0) {
                return res.status(400).json({ message: 'Tên ca đã tồn tại' });
            }
        }

        const updates = [];
        const params = [];

        if (shift_name) { updates.push('shift_name = ?'); params.push(shift_name); }
        if (start_time) { updates.push('start_time = ?'); params.push(start_time); }
        if (end_time) { updates.push('end_time = ?'); params.push(end_time); }
        if (salary_multiplier !== undefined) { updates.push('salary_multiplier = ?'); params.push(salary_multiplier); }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'Không có dữ liệu cần cập nhật' });
        }

        params.push(id);
        await db.execute(
            `UPDATE shift SET ${updates.join(', ')} WHERE shift_id = ?`,
            params
        );

        return res.status(200).json({ message: 'Cập nhật ca thành công' });
    } catch (error) {
        console.error('updateShift error:', error);
        return res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

// DELETE shift
exports.deleteShift = async (req, res) => {
    try {
        const id = req.params.id;

        const [exists] = await db.execute(
            'SELECT shift_id FROM shift WHERE shift_id = ?',
            [id]
        );
        if (exists.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy ca làm việc' });
        }

        // Check if shift is in use
        const [inUse] = await db.execute(
            'SELECT schedule_id FROM schedule WHERE shift_id = ? LIMIT 1',
            [id]
        );
        if (inUse.length > 0) {
            return res.status(400).json({ message: 'Ca đang được sử dụng, không thể xóa' });
        }

        await db.execute('DELETE FROM shift WHERE shift_id = ?', [id]);
        return res.status(200).json({ message: 'Xóa ca thành công' });
    } catch (error) {
        console.error('deleteShift error:', error);
        return res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

exports.getByEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const [schedules] = await db.execute(
            `SELECT
                s.schedule_id,
                s.work_date,
                s.status,
                sh.shift_id,
                sh.shift_name,
                sh.start_time,
                sh.end_time,
                sh.salary_multiplier
            FROM schedule s
            JOIN shift sh
                ON s.shift_id = sh.shift_id
            WHERE s.employee_id = ?
            ORDER BY
                s.work_date ASC,
                sh.start_time ASC`,
            [employeeId]
        );
        return res.status(200).json({
            success: true,
            data: schedules
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};