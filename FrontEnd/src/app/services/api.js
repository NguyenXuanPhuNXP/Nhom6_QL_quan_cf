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

const API_URL = 'http://localhost:3000';

const getAuthHeaders = () => {
  const stored = localStorage.getItem('user');
  if (stored) {
    try {
      const user = JSON.parse(stored);
      if (user.token) {
        return {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        };
      }
    } catch (_) {}
  }
  return { 'Content-Type': 'application/json' };
};

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
    const res = await fetch(`${API_URL}/auth/employees`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi khi tải danh sách nhân viên');
    }
    const rows = await res.json();
    return rows.map((e) => ({
      ...e,
      position: e.position_name || e.position,
    }));
  },

  getById: async (id) => {
    const res = await fetch(`${API_URL}/auth/employees/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Không tìm thấy nhân viên');
    }
    const row = await res.json();
    return { ...row, position: row.position_name || row.position };
  },

  create: async (employee) => {
    const res = await fetch(`${API_URL}/auth/employees`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(employee),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi khi thêm nhân viên');
    }
    return res.json();
  },

  update: async (id, employee) => {
    const res = await fetch(`${API_URL}/auth/employees/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(employee),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi khi cập nhật nhân viên');
    }
    const row = await res.json();
    return { ...row, position: row.position_name || row.position };
  },

  delete: async (id) => {
    const res = await fetch(`${API_URL}/auth/employees/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi khi xóa nhân viên');
    }
    return res.json();
  },

  getPositions: async () => {
    const res = await fetch(`${API_URL}/auth/positions`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi khi tải danh sách vị trí');
    }
    return res.json();
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
    const res = await fetch(`${API_URL}/api/attendance`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi khi tải dữ liệu chấm công');
    }
    const rows = await res.json();
    return rows.map((att) => ({
      ...att,
      status: att.statusLabel || att.status,
    }));
  },

  checkIn: async (employeeId) => {
    const res = await fetch(`${API_URL}/api/attendance/check-in`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ employee_id: employeeId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Check-in thất bại');
    }
    return res.json();
  },

  checkOut: async (attendanceId) => {
    const res = await fetch(`${API_URL}/api/attendance/${attendanceId}/check-out`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Check-out thất bại');
    }
    return res.json();
  },
};

// Payroll API
export const payrollAPI = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/api/payroll`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi khi tải dữ liệu lương');
    }
    const rows = await res.json();
    return rows.map((pay) => ({
      ...pay,
      employee: pay.employee || { employee_id: pay.employee_id, full_name: 'N/A' },
    }));
  },

  getByMonth: async (month, year) => {
    const res = await fetch(`${API_URL}/api/payroll/month?month=${month}&year=${year}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi khi tải dữ liệu lương');
    }
    const rows = await res.json();
    return rows.map((pay) => ({
      ...pay,
      employee: pay.employee || { employee_id: pay.employee_id, full_name: 'N/A' },
    }));
  },

  getByEmployee: async (employeeId) => {
    const res = await fetch(`${API_URL}/api/payroll/employee/${employeeId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi khi tải dữ liệu lương');
    }
    return res.json();
  },

  // Calculate salary from attendance data
  calculatePayroll: async (month, year, employeeId) => {
    const payload = {
      month,
      year,
      ...(employeeId && { employee_id: employeeId })
    };

    const res = await fetch(`${API_URL}/api/payroll/calculate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi khi tính lương');
    }
    return res.json();
  },

  create: async (payroll) => {
    const res = await fetch(`${API_URL}/api/payroll`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payroll),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi khi tạo bảng lương');
    }
    return res.json();
  },

  update: async (id, payroll) => {
    const res = await fetch(`${API_URL}/api/payroll/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payroll),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi khi cập nhật bảng lương');
    }
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${API_URL}/api/payroll/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi khi xóa bảng lương');
    }
    return res.json();
  },
};

// Leave Request API
export const leaveRequestAPI = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/api/leave-requests`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi khi tải đơn nghỉ phép');
    }
    const rows = await res.json();
    return rows.map((leave) => ({
      ...leave,
      status: leave.statusLabel || leave.status,
      leave_date: leave.start_date,
    }));
  },

  create: async (leave) => {
    const payload = {
      employee_id: leave.employee_id,
      start_date: leave.start_date || leave.leave_date,
      end_date: leave.end_date || leave.leave_date,
      reason: leave.reason,
    };
    const res = await fetch(`${API_URL}/api/leave-requests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Gửi đơn thất bại');
    }
    return res.json();
  },

  approve: async (id) => {
    const res = await fetch(`${API_URL}/api/leave-requests/${id}/approve`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Duyệt đơn thất bại');
    }
    return res.json();
  },

  reject: async (id) => {
    const res = await fetch(`${API_URL}/api/leave-requests/${id}/reject`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Từ chối đơn thất bại');
    }
    return res.json();
  },
};

// Notification API
export const notificationAPI = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/api/notifications`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi khi tải thông báo');
    }
    return res.json();
  },

  getUnreadCount: async () => {
    const res = await fetch(`${API_URL}/api/notifications/unread-count`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi khi tải số thông báo');
    }
    return res.json();
  },

  markAsRead: async (id) => {
    const res = await fetch(`${API_URL}/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Cập nhật thất bại');
    }
    return res.json();
  },
};

export const profileAPI = {
  updateProfile: async (data) => {
    const res = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Cập nhật hồ sơ thất bại');
    }
    const row = await res.json();
    return { ...row, position: row.position_name || row.position };
  },

  changePassword: async (data) => {
    const res = await fetch(`${API_URL}/auth/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Đổi mật khẩu thất bại');
    }
    return res.json();
  },
};

// ============================================================
// Account Management API (uses real backend)
// ============================================================

export const accountAPI = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/api/accounts`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi khi tải danh sách tài khoản');
    }
    return res.json();
  },

  getById: async (id) => {
    const res = await fetch(`${API_URL}/api/accounts/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Không tìm thấy tài khoản');
    }
    return res.json();
  },

  create: async (data) => {
    const res = await fetch(`${API_URL}/api/accounts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi khi tạo tài khoản');
    }
    return res.json();
  },

  update: async (id, data) => {
    const res = await fetch(`${API_URL}/api/accounts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi khi cập nhật tài khoản');
    }
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${API_URL}/api/accounts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi khi xóa tài khoản');
    }
    return res.json();
  },

  getRoles: async () => {
    const res = await fetch(`${API_URL}/api/accounts/roles`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi khi tải danh sách role');
    }
    return res.json();
  },

  getEmployeesWithoutAccount: async () => {
    // Get all employees, then filter client-side
    const resEmp = await fetch(`${API_URL}/auth/employees`, {
      headers: getAuthHeaders(),
    });
    if (!resEmp.ok) throw new Error('Lỗi khi tải danh sách nhân viên');
    const employees = await resEmp.json();

    const resAcc = await fetch(`${API_URL}/api/accounts`, {
      headers: getAuthHeaders(),
    });
    if (!resAcc.ok) throw new Error('Lỗi khi tải danh sách tài khoản');
    const accounts = await resAcc.json();

    const usedEmployeeIds = new Set(accounts.map((a) => a.employee_id));
    return employees.filter((e) => !usedEmployeeIds.has(e.employee_id));
  },
};
