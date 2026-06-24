const db = require('../config/db');
const { formatDateOnly } = require('../utils/date');

// GET dashboard statistics
exports.getStats = async (req, res) => {
    try {
        // Total employees
        const [empCount] = await db.execute('SELECT COUNT(*) as total FROM employee');
        
        // Today date
        const today = new Date().toISOString().split('T')[0];
        
        // Total shifts today (schedules for today)
        const [shiftsToday] = await db.execute(
            'SELECT COUNT(*) as total FROM schedule WHERE work_date = ?',
            [today]
        );
        
        // Employees working now (checked in today but not checked out)
        const [workingNow] = await db.execute(
            `SELECT COUNT(DISTINCT employee_id) as total 
             FROM attendance 
             WHERE DATE(check_in) = ? AND check_out IS NULL`,
            [today]
        );
        
        // Pending leave requests
        const [pendingLeaves] = await db.execute(
            "SELECT COUNT(*) as total FROM leave_request WHERE status = 'Cho_duyet'"
        );

        return res.status(200).json({
            totalEmployees: empCount[0].total,
            totalShiftsToday: shiftsToday[0].total,
            employeesWorking: workingNow[0].total,
            pendingLeaveRequests: pendingLeaves[0].total,
        });
    } catch (error) {
        console.error('getStats error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};

// GET attendance chart data (last 7 days)
exports.getAttendanceChart = async (req, res) => {
    try {
        const chartData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dateDisplay = date.toLocaleDateString('vi-VN', { 
                day: '2-digit', 
                month: '2-digit' 
            });
            
            // Get attendance for this date
            const [attendance] = await db.execute(
                `SELECT status, COUNT(*) as count 
                 FROM attendance 
                 WHERE DATE(check_in) = ?
                 GROUP BY status`,
                [dateStr]
            );
            
            let present = 0;
            let late = 0;
            let absent = 0;
            
            attendance.forEach(row => {
                if (row.status === 'Dung_gio') present += parseInt(row.count);
                else if (row.status === 'Di_muon') late += parseInt(row.count);
                else if (row.status === 'Nghi_lam') absent += parseInt(row.count);
            });
            
            chartData.push({
                date: dateDisplay,
                present,
                late,
                absent,
            });
        }

        return res.status(200).json(chartData);
    } catch (error) {
        console.error('getAttendanceChart error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};

// GET today's schedule
exports.getTodaySchedule = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const [rows] = await db.execute(
            `SELECT 
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
            WHERE s.work_date = ?
            ORDER BY sh.start_time`,
            [today]
        );

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
        console.error('getTodaySchedule error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};
