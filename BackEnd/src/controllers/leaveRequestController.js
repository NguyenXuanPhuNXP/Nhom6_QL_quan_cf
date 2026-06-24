const db = require('../config/db');
const { notifyManagers, createNotification } = require('../services/notificationService');
const { isManagerRole } = require('../utils/roles');

const formatLeaveRequest = (row) => ({
    leave_id: row.leave_id,
    employee_id: row.employee_id,
    start_date: row.start_date instanceof Date
        ? row.start_date.toISOString().split('T')[0]
        : String(row.start_date).split('T')[0],
    end_date: row.end_date instanceof Date
        ? row.end_date.toISOString().split('T')[0]
        : String(row.end_date).split('T')[0],
    reason: row.reason,
    status: row.status,
    approved_by: row.approved_by,
    approved_at: row.approved_at,
    created_at: row.created_at,
    employee: row.full_name
        ? {
            employee_id: row.employee_id,
            full_name: row.full_name,
            position: row.position_name,
        }
        : undefined,
});

const STATUS_LABELS = {
    Cho_duyet: 'Chờ duyệt',
    Da_duyet: 'Đã duyệt',
    Tu_choi: 'Từ chối',
};

exports.getAll = async (req, res) => {
    try {
        let query = `
            SELECT
                lr.*,
                e.full_name,
                p.position_name
            FROM leave_request lr
            INNER JOIN employee e ON lr.employee_id = e.employee_id
            LEFT JOIN positions p ON e.position_id = p.position_id
        `;
        const params = [];

        if (!isManagerRole(req.user.role_name)) {
            query += ' WHERE lr.employee_id = ?';
            params.push(req.user.employee_id);
        }

        query += ' ORDER BY lr.created_at DESC';

        const [rows] = await db.execute(query, params);
        const formatted = rows.map((row) => {
            const item = formatLeaveRequest(row);
            item.statusLabel = STATUS_LABELS[item.status] || item.status;
            return item;
        });

        return res.status(200).json(formatted);
    } catch (error) {
        console.error('getAll leave requests error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.create = async (req, res) => {
    try {
        const { start_date, end_date, reason, employee_id } = req.body;

        const targetEmployeeId = isManagerRole(req.user.role_name)
            ? employee_id || req.user.employee_id
            : req.user.employee_id;

        if (!start_date || !end_date || !reason) {
            return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc' });
        }

        const [result] = await db.execute(
            `INSERT INTO leave_request (employee_id, start_date, end_date, reason, status)
             VALUES (?, ?, ?, ?, 'Cho_duyet')`,
            [targetEmployeeId, start_date, end_date, reason]
        );

        const [employeeRows] = await db.execute(
            `SELECT full_name FROM employee WHERE employee_id = ?`,
            [targetEmployeeId]
        );
        const employeeName = employeeRows[0]?.full_name || 'Nhân viên';

        await notifyManagers(
            'Đơn nghỉ phép mới',
            `${employeeName} đã gửi đơn xin nghỉ từ ${start_date} đến ${end_date}. Lý do: ${reason}`
        );

        return res.status(201).json({
            message: 'Gửi đơn nghỉ phép thành công',
            leave_id: result.insertId,
        });
    } catch (error) {
        console.error('create leave request error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};
//cập nhật trạng thái đơn nghỉ phép
const updateLeaveStatus = async (req, res, status) => {
    try {
        const { id } = req.params;
        const approverId = req.user.employee_id;

        const [rows] = await db.execute(
            `SELECT lr.*, e.full_name
             FROM leave_request lr
             INNER JOIN employee e ON lr.employee_id = e.employee_id
             WHERE lr.leave_id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn nghỉ phép' });
        }

        const leave = rows[0];

        if (leave.status !== 'Cho_duyet') {
            return res.status(400).json({ message: 'Đơn này đã được xử lý' });
        }

        await db.execute(
            `UPDATE leave_request
             SET status = ?, approved_by = ?, approved_at = NOW()
             WHERE leave_id = ?`,
            [status, approverId, id]
        );

        const title = status === 'Da_duyet' ? 'Đơn nghỉ phép đã duyệt' : 'Đơn nghỉ phép bị từ chối';
        const content = status === 'Da_duyet'
            ? `Đơn nghỉ phép từ ${leave.start_date} đến ${leave.end_date} của bạn đã được duyệt.`
            : `Đơn nghỉ phép từ ${leave.start_date} đến ${leave.end_date} của bạn đã bị từ chối.`;

        await createNotification(leave.employee_id, title, content);

        return res.status(200).json({ message: status === 'Da_duyet' ? 'Đã duyệt đơn' : 'Đã từ chối đơn' });
    } catch (error) {
        console.error('update leave status error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.approve = (req, res) => updateLeaveStatus(req, res, 'Da_duyet');
exports.reject = (req, res) => updateLeaveStatus(req, res, 'Tu_choi');
