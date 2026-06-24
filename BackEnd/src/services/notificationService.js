const db = require('../config/db');

let io = null;

const setIO = (socketIO) => {
    io = socketIO;
};

const emitToEmployee = (employeeId, notification) => {
    if (io) {
        io.to(`employee_${employeeId}`).emit('notification', notification);
    }
};

const createNotification = async (employeeId, title, content) => {
    const [result] = await db.execute(
        `INSERT INTO notification (employee_id, title, content)
         VALUES (?, ?, ?)`,
        [employeeId, title, content]
    );

    const [rows] = await db.execute(
        `SELECT notification_id, employee_id, title, content, is_read, created_at
         FROM notification
         WHERE notification_id = ?`,
        [result.insertId]
    );

    const notification = {
        ...rows[0],
        is_read: Boolean(rows[0].is_read),
    };
    emitToEmployee(employeeId, notification);
    return notification;
};

const getManagerEmployeeIds = async () => {
    const [rows] = await db.execute(`
        SELECT DISTINCT a.employee_id
        FROM account a
        INNER JOIN role r ON a.role_id = r.role_id
        WHERE r.role_name IN ('Admin', 'Quản lý')
          AND a.status = 'Active'
    `);
    return rows.map((row) => row.employee_id);
};

const notifyManagers = async (title, content) => {
    const managerIds = await getManagerEmployeeIds();
    const notifications = [];
    for (const employeeId of managerIds) {
        notifications.push(await createNotification(employeeId, title, content));
    }
    return notifications;
};

module.exports = {
    setIO,
    createNotification,
    notifyManagers,
};
