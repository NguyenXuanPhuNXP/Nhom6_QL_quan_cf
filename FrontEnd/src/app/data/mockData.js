export const mockEmployees = [
  {
    employee_id: 1,
    full_name: 'Nguyễn Văn An',
    avatar: null,
    gender: 'Nam',
    phone: '0901234567',
    address: '123 Lê Lợi, Q1, TP.HCM',
    position: 'Quản lý',
    salary_rate: 50000,
    created_at: '2024-01-15T08:00:00Z',
  },
  {
    employee_id: 2,
    full_name: 'Trần Thị Bình',
    avatar: null,
    gender: 'Nữ',
    phone: '0902345678',
    address: '456 Nguyễn Huệ, Q1, TP.HCM',
    position: 'Pha chế',
    salary_rate: 35000,
    created_at: '2024-02-01T08:00:00Z',
  },
  {
    employee_id: 3,
    full_name: 'Lê Minh Châu',
    avatar: null,
    gender: 'Nữ',
    phone: '0903456789',
    address: '789 Trần Hưng Đạo, Q5, TP.HCM',
    position: 'Phục vụ',
    salary_rate: 30000,
    created_at: '2024-02-10T08:00:00Z',
  },
  {
    employee_id: 4,
    full_name: 'Phạm Quốc Dũng',
    avatar: null,
    gender: 'Nam',
    phone: '0904567890',
    address: '321 Hai Bà Trưng, Q3, TP.HCM',
    position: 'Pha chế',
    salary_rate: 35000,
    created_at: '2024-03-05T08:00:00Z',
  },
  {
    employee_id: 5,
    full_name: 'Hoàng Thu Hà',
    avatar: null,
    gender: 'Nữ',
    phone: '0905678901',
    address: '654 Võ Văn Tần, Q3, TP.HCM',
    position: 'Phục vụ',
    salary_rate: 30000,
    created_at: '2024-03-20T08:00:00Z',
  },
  {
    employee_id: 6,
    full_name: 'Vũ Đức Khánh',
    avatar: null,
    gender: 'Nam',
    phone: '0906789012',
    address: '987 Pasteur, Q1, TP.HCM',
    position: 'Thu ngân',
    salary_rate: 32000,
    created_at: '2024-04-01T08:00:00Z',
  },
];

export const mockAccounts = [
  {
    account_id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    employee_id: 1,
  },
  {
    account_id: 2,
    username: 'binh',
    password: 'binh123',
    role: 'staff',
    employee_id: 2,
  },
  {
    account_id: 3,
    username: 'chau',
    password: 'chau123',
    role: 'staff',
    employee_id: 3,
  },
];

export const mockShifts = [
  {
    shift_id: 1,
    shift_name: 'Ca sáng',
    start_time: '06:00',
    end_time: '14:00',
    color: '#3b82f6',
  },
  {
    shift_id: 2,
    shift_name: 'Ca chiều',
    start_time: '14:00',
    end_time: '22:00',
    color: '#10b981',
  },
  {
    shift_id: 3,
    shift_name: 'Ca tối',
    start_time: '22:00',
    end_time: '06:00',
    color: '#8b5cf6',
  },
];

export const mockSchedules = [
  {
    schedule_id: 1,
    employee_id: 2,
    shift_id: 1,
    work_date: '2026-05-23',
  },
  {
    schedule_id: 2,
    employee_id: 3,
    shift_id: 1,
    work_date: '2026-05-23',
  },
  {
    schedule_id: 3,
    employee_id: 4,
    shift_id: 2,
    work_date: '2026-05-23',
  },
  {
    schedule_id: 4,
    employee_id: 5,
    shift_id: 2,
    work_date: '2026-05-23',
  },
  {
    schedule_id: 5,
    employee_id: 2,
    shift_id: 1,
    work_date: '2026-05-24',
  },
  {
    schedule_id: 6,
    employee_id: 4,
    shift_id: 2,
    work_date: '2026-05-24',
  },
];

export const mockAttendance = [
  {
    attendance_id: 1,
    employee_id: 2,
    check_in: '2026-05-23T06:00:00Z',
    check_out: '2026-05-23T14:00:00Z',
    status: 'Đúng giờ',
    work_date: '2026-05-23',
  },
  {
    attendance_id: 2,
    employee_id: 3,
    check_in: '2026-05-23T06:15:00Z',
    check_out: '2026-05-23T14:05:00Z',
    status: 'Trễ',
    work_date: '2026-05-23',
  },
  {
    attendance_id: 3,
    employee_id: 4,
    check_in: '2026-05-23T14:00:00Z',
    check_out: null,
    status: 'Đúng giờ',
    work_date: '2026-05-23',
  },
  {
    attendance_id: 4,
    employee_id: 5,
    check_in: '2026-05-23T14:00:00Z',
    check_out: null,
    status: 'Đúng giờ',
    work_date: '2026-05-23',
  },
];

export const mockPayroll = [
  {
    payroll_id: 1,
    employee_id: 2,
    month: 4,
    year: 2026,
    total_hours: 176,
    bonus: 500000,
    penalty: 0,
    total_salary: 6660000,
  },
  {
    payroll_id: 2,
    employee_id: 3,
    month: 4,
    year: 2026,
    total_hours: 180,
    bonus: 300000,
    penalty: 100000,
    total_salary: 5600000,
  },
  {
    payroll_id: 3,
    employee_id: 4,
    month: 4,
    year: 2026,
    total_hours: 172,
    bonus: 400000,
    penalty: 0,
    total_salary: 6420000,
  },
];

export const mockLeaveRequests = [
  {
    leave_id: 1,
    employee_id: 3,
    leave_date: '2026-05-25',
    reason: 'Bệnh',
    status: 'Chờ duyệt',
    created_at: '2026-05-22T10:00:00Z',
  },
  {
    leave_id: 2,
    employee_id: 5,
    leave_date: '2026-05-26',
    reason: 'Việc gia đình',
    status: 'Chờ duyệt',
    created_at: '2026-05-22T14:30:00Z',
  },
  {
    leave_id: 3,
    employee_id: 4,
    leave_date: '2026-05-20',
    reason: 'Nghỉ phép',
    status: 'Đã duyệt',
    created_at: '2026-05-18T09:00:00Z',
  },
  {
    leave_id: 4,
    employee_id: 2,
    leave_date: '2026-05-15',
    reason: 'Việc cá nhân',
    status: 'Từ chối',
    created_at: '2026-05-14T16:00:00Z',
  },
];

export const mockNotifications = [
  {
    notification_id: 1,
    employee_id: 1,
    title: 'Đơn nghỉ phép mới',
    content: 'Lê Minh Châu đã gửi đơn nghỉ phép ngày 25/05/2026',
    is_read: false,
    created_at: '2026-05-22T10:00:00Z',
  },
  {
    notification_id: 2,
    employee_id: 1,
    title: 'Đơn nghỉ phép mới',
    content: 'Hoàng Thu Hà đã gửi đơn nghỉ phép ngày 26/05/2026',
    is_read: false,
    created_at: '2026-05-22T14:30:00Z',
  },
  {
    notification_id: 3,
    employee_id: 2,
    title: 'Lịch làm việc tháng 6',
    content: 'Lịch làm việc tháng 6/2026 đã được cập nhật',
    is_read: true,
    created_at: '2026-05-20T08:00:00Z',
  },
  {
    notification_id: 4,
    employee_id: 1,
    title: 'Chấm công tháng 4',
    content: 'Đã hoàn thành bảng chấm công tháng 4/2026',
    is_read: true,
    created_at: '2026-05-01T17:00:00Z',
  },
];

// Helper function to get employee by ID
export const getEmployeeById = (id) => {
  return mockEmployees.find((emp) => emp.employee_id === id);
};

// Helper function to get shift by ID
export const getShiftById = (id) => {
  return mockShifts.find((shift) => shift.shift_id === id);
};
