// API Service Layer
// This would connect to NodeJS + Express backend in production
// Currently using mock data for demonstration

import {
  mockEmployees,
  mockShifts,
  mockSchedules,
  mockAttendance,
  mockPayroll,
  mockLeaveRequests,
  mockNotifications,
  mockAccounts,
  getEmployeeById,
  getShiftById,
} from '../data/mockData';

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Auth API
export const authAPI = {
  login: async (username, password) => {
    await delay(800);
    const account = mockAccounts.find(
      (acc) => acc.username === username && acc.password === password
    );
    if (account) {
      const employee = getEmployeeById(account.employee_id);
      if (employee) {
        return {
          id: account.account_id,
          username: account.username,
          role: account.role,
          employee,
        };
      }
    }
    return null;
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    await delay(500);
    const today = new Date().toISOString().split('T')[0];
    const todaySchedules = mockSchedules.filter((s) => s.work_date === today);
    const workingNow = mockAttendance.filter(
      (a) => a.work_date === today && !a.check_out
    );
    const pendingLeaves = mockLeaveRequests.filter((l) => l.status === 'Chờ duyệt');

    return {
      totalEmployees: mockEmployees.length,
      totalShiftsToday: todaySchedules.length,
      employeesWorking: workingNow.length,
      pendingLeaveRequests: pendingLeaves.length,
    };
  },

  getAttendanceChart: async () => {
    await delay(500);
    // Mock chart data for last 7 days
    return [
      { date: '17/05', present: 12, late: 2, absent: 1 },
      { date: '18/05', present: 14, late: 1, absent: 0 },
      { date: '19/05', present: 13, late: 3, absent: 1 },
      { date: '20/05', present: 15, late: 0, absent: 0 },
      { date: '21/05', present: 12, late: 2, absent: 2 },
      { date: '22/05', present: 14, late: 1, absent: 1 },
      { date: '23/05', present: 13, late: 2, absent: 0 },
    ];
  },

  getTodaySchedule: async () => {
    await delay(500);
    const today = '2026-05-23';
    const todaySchedules = mockSchedules.filter((s) => s.work_date === today);
    return todaySchedules.map((schedule) => ({
      ...schedule,
      employee: getEmployeeById(schedule.employee_id),
      shift: getShiftById(schedule.shift_id),
    }));
  },
};

// Employee API
export const employeeAPI = {
  getAll: async () => {
    await delay(600);
    return mockEmployees;
  },

  getById: async (id) => {
    await delay(400);
    return getEmployeeById(id);
  },

  create: async (employee) => {
    await delay(800);
    const newEmployee = {
      ...employee,
      employee_id: Math.max(...mockEmployees.map((e) => e.employee_id)) + 1,
      created_at: new Date().toISOString(),
    };
    mockEmployees.push(newEmployee);
    return newEmployee;
  },

  update: async (id, employee) => {
    await delay(800);
    const index = mockEmployees.findIndex((e) => e.employee_id === id);
    if (index !== -1) {
      mockEmployees[index] = { ...mockEmployees[index], ...employee };
      return mockEmployees[index];
    }
    throw new Error('Employee not found');
  },

  delete: async (id) => {
    await delay(600);
    const index = mockEmployees.findIndex((e) => e.employee_id === id);
    if (index !== -1) {
      mockEmployees.splice(index, 1);
    }
  },
};

// Shift API
export const shiftAPI = {
  getAll: async () => {
    await delay(500);
    return mockShifts;
  },
};

// Schedule API
export const scheduleAPI = {
  getAll: async () => {
    await delay(600);
    return mockSchedules.map((schedule) => ({
      ...schedule,
      employee: getEmployeeById(schedule.employee_id),
      shift: getShiftById(schedule.shift_id),
    }));
  },

  getByDate: async (date) => {
    await delay(500);
    return mockSchedules
      .filter((s) => s.work_date === date)
      .map((schedule) => ({
        ...schedule,
        employee: getEmployeeById(schedule.employee_id),
        shift: getShiftById(schedule.shift_id),
      }));
  },

  create: async (schedule) => {
    await delay(800);
    const newSchedule = {
      ...schedule,
      schedule_id: Math.max(...mockSchedules.map((s) => s.schedule_id)) + 1,
    };
    mockSchedules.push(newSchedule);
    return newSchedule;
  },

  delete: async (id) => {
    await delay(600);
    const index = mockSchedules.findIndex((s) => s.schedule_id === id);
    if (index !== -1) {
      mockSchedules.splice(index, 1);
    }
  },
};

// Attendance API
export const attendanceAPI = {
  getAll: async () => {
    await delay(600);
    return mockAttendance.map((att) => ({
      ...att,
      employee: getEmployeeById(att.employee_id),
    }));
  },

  checkIn: async (employeeId) => {
    await delay(800);
    const newAttendance = {
      attendance_id: Math.max(...mockAttendance.map((a) => a.attendance_id)) + 1,
      employee_id: employeeId,
      check_in: new Date().toISOString(),
      check_out: null,
      status: 'Đúng giờ',
      work_date: new Date().toISOString().split('T')[0],
    };
    mockAttendance.push(newAttendance);
    return newAttendance;
  },

  checkOut: async (attendanceId) => {
    await delay(800);
    const index = mockAttendance.findIndex((a) => a.attendance_id === attendanceId);
    if (index !== -1) {
      mockAttendance[index].check_out = new Date().toISOString();
      return mockAttendance[index];
    }
    throw new Error('Attendance not found');
  },
};

// Payroll API
export const payrollAPI = {
  getAll: async () => {
    await delay(600);
    return mockPayroll.map((pay) => ({
      ...pay,
      employee: getEmployeeById(pay.employee_id),
    }));
  },

  getByMonth: async (month, year) => {
    await delay(500);
    return mockPayroll
      .filter((p) => p.month === month && p.year === year)
      .map((pay) => ({
        ...pay,
        employee: getEmployeeById(pay.employee_id),
      }));
  },
};

// Leave Request API
export const leaveRequestAPI = {
  getAll: async () => {
    await delay(600);
    return mockLeaveRequests.map((leave) => ({
      ...leave,
      employee: getEmployeeById(leave.employee_id),
    }));
  },

  create: async (
    leave
  ) => {
    await delay(800);
    const newLeave = {
      ...leave,
      leave_id: Math.max(...mockLeaveRequests.map((l) => l.leave_id)) + 1,
      status: 'Chờ duyệt',
      created_at: new Date().toISOString(),
    };
    mockLeaveRequests.push(newLeave);
    return newLeave;
  },

  approve: async (id) => {
    await delay(800);
    const index = mockLeaveRequests.findIndex((l) => l.leave_id === id);
    if (index !== -1) {
      mockLeaveRequests[index].status = 'Đã duyệt';
      return mockLeaveRequests[index];
    }
    throw new Error('Leave request not found');
  },

  reject: async (id) => {
    await delay(800);
    const index = mockLeaveRequests.findIndex((l) => l.leave_id === id);
    if (index !== -1) {
      mockLeaveRequests[index].status = 'Từ chối';
      return mockLeaveRequests[index];
    }
    throw new Error('Leave request not found');
  },
};

// Notification API
export const notificationAPI = {
  getAll: async (employeeId) => {
    await delay(500);
    return mockNotifications.filter((n) => n.employee_id === employeeId);
  },

  markAsRead: async (id) => {
    await delay(400);
    const index = mockNotifications.findIndex((n) => n.notification_id === id);
    if (index !== -1) {
      mockNotifications[index].is_read = true;
    }
  },
};
