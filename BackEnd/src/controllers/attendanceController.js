const db = require('../config/db');
const { notifyManagers } = require('../services/notificationService');
const { isManagerRole } = require('../utils/roles');

const formatAttendance = (row) => ({
    attendance_id: row.attendance_id,
    employee_id: row.employee_id,
    schedule_id: row.schedule_id,
    check_in: row.check_in,
    check_out: row.check_out,
    total_hours: row.total_hours,
    status: row.status,
    work_date: row.check_in instanceof Date
        ? row.check_in.toISOString().split('T')[0]
        : String(row.check_in).split('T')[0],
    employee: row.full_name
        ? { employee_id: row.employee_id, full_name: row.full_name }
        : undefined,
});

const STATUS_LABELS = {
    Dung_gio: 'Đúng giờ',
    Di_muon: 'Đi trễ',
    Ve_som: 'Về sớm',
    Nghi_lam: 'Nghỉ làm',
};

exports.getAll = async (req, res) => {
    try {
        let query = `
            SELECT a.*, e.full_name
            FROM attendance a
            INNER JOIN employee e ON a.employee_id = e.employee_id
        `;
        const params = [];

        if (!isManagerRole(req.user.role_name)) {
            query += ' WHERE a.employee_id = ?';
            params.push(req.user.employee_id);
        }

        query += ' ORDER BY a.check_in DESC';

        const [rows] = await db.execute(query, params);
        const formatted = rows.map((row) => {
            const item = formatAttendance(row);
            item.statusLabel = STATUS_LABELS[item.status] || item.status;
            return item;
        });

        return res.status(200).json(formatted);
    } catch (error) {
        console.error('getAll attendance error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.checkIn = async (req, res) => {
    try {
        const employeeId = req.body.employee_id || req.user.employee_id;

        if (!isManagerRole(req.user.role_name) && employeeId !== req.user.employee_id) {
            return res.status(403).json({ message: 'Không có quyền chấm công cho người khác' });
        }

        const [openSession] = await db.execute(
            `SELECT attendance_id FROM attendance
             WHERE employee_id = ? AND check_out IS NULL
             ORDER BY check_in DESC LIMIT 1`,
            [employeeId]
        );

        if (openSession.length > 0) {
            return res.status(400).json({ message: 'Nhân viên đã check-in, chưa check-out' });
        }

        const now = new Date();
        const [result] = await db.execute(
            `INSERT INTO attendance (employee_id, check_in, status)
             VALUES (?, ?, 'Dung_gio')`,
            [employeeId, now]
        );

        const [employeeRows] = await db.execute(
            `SELECT full_name FROM employee WHERE employee_id = ?`,
            [employeeId]
        );
        const employeeName = employeeRows[0]?.full_name || 'Nhân viên';
        const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

        await notifyManagers(
            'Chấm công check-in',
            `${employeeName} vừa check-in lúc ${timeStr}.`
        );

        return res.status(201).json({
            message: 'Check-in thành công',
            attendance_id: result.insertId,
        });
    } catch (error) {
        console.error('checkIn error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.checkOut = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.execute(
            `SELECT a.*, e.full_name
             FROM attendance a
             INNER JOIN employee e ON a.employee_id = e.employee_id
             WHERE a.attendance_id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bản ghi chấm công' });
        }

        const attendance = rows[0];

        if (!isManagerRole(req.user.role_name) && attendance.employee_id !== req.user.employee_id) {
            return res.status(403).json({ message: 'Không có quyền' });
        }

        if (attendance.check_out) {
            return res.status(400).json({ message: 'Đã check-out rồi' });
        }

        const checkOutTime = new Date();
        const checkInTime = new Date(attendance.check_in);
        const totalHours = ((checkOutTime - checkInTime) / (1000 * 60 * 60)).toFixed(2);

        await db.execute(
            `UPDATE attendance
             SET check_out = ?, total_hours = ?
             WHERE attendance_id = ?`,
            [checkOutTime, totalHours, id]
        );

        const timeStr = checkOutTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

        await notifyManagers(
            'Chấm công check-out',
            `${attendance.full_name} vừa check-out lúc ${timeStr} (${totalHours} giờ).`
        );

        return res.status(200).json({ message: 'Check-out thành công' });
    } catch (error) {
        console.error('checkOut error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};
