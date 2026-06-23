import { useEffect, useState } from 'react';
import { Plus, Calendar as CalendarIcon, Edit, Trash2, Clock } from 'lucide-react';
import { Loading } from '../components/Loading';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { format, addDays, startOfWeek } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';

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

// Shift color mapping
const SHIFT_COLORS = {
  'Ca sáng': '#3b82f6',
  'Ca trưa': '#10b981',
  'Ca chiều': '#8b5cf6',
};
const getShiftColor = (shiftName) => SHIFT_COLORS[shiftName] || '#6366f1';

const normalizeRole = (role = '') =>
  String(role)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const SchedulePage = () => {
  const { user } = useAuth();
  const userRole = normalizeRole(user?.role);
  const canManage = userRole === 'admin' || userRole === 'quan ly';

  const [schedules, setSchedules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [deletingScheduleId, setDeletingScheduleId] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
const [formData, setFormData] = useState({
    employee_id: '',
    shift_id: '',
    work_date: '',
  });

  // Shift management state
  const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false);
  const [isDeleteShiftDialogOpen, setIsDeleteShiftDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [deletingShiftId, setDeletingShiftId] = useState(null);
  const [shiftFormData, setShiftFormData] = useState({
    shift_name: '',
    start_time: '',
    end_time: '',
    salary_multiplier: 1,
  });
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const headers = getAuthHeaders();
      const [schedulesRes, employeesRes, shiftsRes] = await Promise.all([
        fetch(`${API_URL}/api/schedules`, { headers }),
        fetch(`${API_URL}/api/schedules/employees`, { headers }),
        fetch(`${API_URL}/api/schedules/shifts`, { headers }),
      ]);

      if (!schedulesRes.ok || !employeesRes.ok || !shiftsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [schedulesData, employeesData, shiftsData] = await Promise.all([
        schedulesRes.json(),
        employeesRes.json(),
        shiftsRes.json(),
      ]);

      setSchedules(schedulesData);
      setEmployees(employeesData);
      setShifts(shiftsData);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Lỗi khi tải dữ liệu lịch làm việc');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (schedule = null) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        employee_id: String(schedule.employee_id),
        shift_id: String(schedule.shift_id),
        work_date: schedule.work_date,
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        employee_id: '',
        shift_id: '',
        work_date: format(new Date(), 'yyyy-MM-dd'),
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.shift_id || !formData.work_date) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const payload = {
        employee_id: Number(formData.employee_id),
        shift_id: Number(formData.shift_id),
        work_date: formData.work_date,
      };

      let res;
      if (editingSchedule) {
        res = await fetch(`${API_URL}/api/schedules/${editingSchedule.schedule_id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}/api/schedules`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Có lỗi xảy ra');
        return;
      }

      toast.success(editingSchedule ? 'Cập nhật lịch thành công' : 'Thêm lịch thành công');
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

const handleDelete = async () => {
    if (!deletingScheduleId) return;
    try {
      const res = await fetch(`${API_URL}/api/schedules/${deletingScheduleId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Có lỗi xảy ra');
        return;
      }
      toast.success('Xóa lịch thành công');
      setIsDeleteDialogOpen(false);
      setDeletingScheduleId(null);
      fetchData();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  // Shift management handlers
  const handleOpenShiftDialog = (shift = null) => {
    if (shift) {
      setEditingShift(shift);
      setShiftFormData({
        shift_name: shift.shift_name,
        start_time: shift.start_time,
        end_time: shift.end_time,
        salary_multiplier: shift.salary_multiplier || 1,
      });
    } else {
      setEditingShift(null);
      setShiftFormData({
        shift_name: '',
        start_time: '06:00',
        end_time: '11:00',
        salary_multiplier: 1,
      });
    }
    setIsShiftDialogOpen(true);
  };

  const handleShiftSubmit = async () => {
    if (!shiftFormData.shift_name || !shiftFormData.start_time || !shiftFormData.end_time) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const payload = {
        shift_name: shiftFormData.shift_name,
        start_time: shiftFormData.start_time + ':00',
        end_time: shiftFormData.end_time + ':00',
        salary_multiplier: Number(shiftFormData.salary_multiplier),
      };

      let res;
      if (editingShift) {
        res = await fetch(`${API_URL}/api/schedules/shifts/${editingShift.shift_id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}/api/schedules/shifts`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Có lỗi xảy ra');
        return;
      }

      toast.success(editingShift ? 'Cập nhật ca thành công' : 'Thêm ca thành công');
      setIsShiftDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleDeleteShift = async () => {
    if (!deletingShiftId) return;
    try {
      const res = await fetch(`${API_URL}/api/schedules/shifts/${deletingShiftId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Có lỗi xảy ra');
        return;
      }
      toast.success('Xóa ca thành công');
      setIsDeleteShiftDialogOpen(false);
      setDeletingShiftId(null);
      fetchData();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const getWeekDays = () => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));
  };

  const getScheduleForDate = (date, employeeId) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return schedules.find(
      (s) => s.work_date === dateStr && s.employee_id === employeeId
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  const weekDays = getWeekDays();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Phân ca làm việc</h1>
          <p className="text-slate-600 mt-1">
            {canManage ? 'Quản lý lịch làm việc theo tuần' : 'Xem lịch làm việc theo tuần'}
          </p>
        </div>
        {canManage && (
          <Button
            onClick={() => handleOpenDialog()}
            className="w-full bg-[#3b82f6] hover:bg-[#2563eb] sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm lịch
          </Button>
        )}
      </div>

      {/* Week Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
            >
              ← Tuần trước
            </Button>
            <div className="order-first flex items-center justify-center gap-2 sm:order-none">
              <CalendarIcon className="w-5 h-5 text-slate-600" />
              <span className="font-medium text-slate-800">
                {format(weekDays[0], 'dd/MM/yyyy', { locale: vi })} -{' '}
                {format(weekDays[6], 'dd/MM/yyyy', { locale: vi })}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
            >
              Tuần sau →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch làm việc tuần</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Nhân viên</TableHead>
                  {weekDays.map((day) => (
                    <TableHead key={day.toString()} className="text-center">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500">
                          {format(day, 'EEE', { locale: vi })}
                        </span>
                        <span className="font-medium">
                          {format(day, 'dd/MM')}
                        </span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.employee_id}>
                    <TableCell className="font-medium">
                      {employee.full_name}
                    </TableCell>
                    {weekDays.map((day) => {
                      const schedule = getScheduleForDate(day, employee.employee_id);
                      return (
                        <TableCell key={day.toString()} className="text-center">
                          {schedule && schedule.shift ? (
                            <div className="flex flex-col items-center gap-1">
                              <Badge
                                style={{
                                  backgroundColor: getShiftColor(schedule.shift.shift_name),
                                  color: 'white',
                                }}
                                className={canManage ? 'cursor-pointer' : ''}
                                onClick={() => canManage && handleOpenDialog(schedule)}
                              >
                                {schedule.shift.shift_name}
                              </Badge>
                              {canManage && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleOpenDialog(schedule)}
                                    className="text-slate-400 hover:text-blue-500 transition-colors"
                                    title="Sửa"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDeletingScheduleId(schedule.schedule_id);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                    title="Xóa"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            canManage ? (
                              <button
                                onClick={() => {
                                  setEditingSchedule(null);
                                  setFormData({
                                    employee_id: String(employee.employee_id),
                                    shift_id: '',
                                    work_date: format(day, 'yyyy-MM-dd'),
                                  });
                                  setIsDialogOpen(true);
                                }}
                                className="text-slate-300 hover:text-blue-400 transition-colors"
                                title="Thêm ca"
                              >
                                <Plus className="w-4 h-4 mx-auto" />
                              </button>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

{/* Shift Legend */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Chú thích ca làm</CardTitle>
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenShiftDialog()}
              className="text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Thêm ca
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {shifts.map((shift) => (
              <div key={shift.shift_id} className="flex items-center gap-2">
                <Badge
                  style={{
                    backgroundColor: getShiftColor(shift.shift_name),
                    color: 'white',
                  }}
                >
                  {shift.shift_name}
                </Badge>
                <span className="text-sm text-slate-600">
                  {shift.start_time} - {shift.end_time}
                </span>
                {canManage && (
                  <div className="flex gap-1 ml-1">
                    <button
                      onClick={() => handleOpenShiftDialog(shift)}
                      className="text-slate-400 hover:text-blue-500 transition-colors"
                      title="Sửa"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingShiftId(shift.shift_id);
                        setIsDeleteShiftDialogOpen(true);
                      }}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Schedule Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? 'Chỉnh sửa lịch làm việc' : 'Thêm lịch làm việc'}
            </DialogTitle>
            <DialogDescription>
              {editingSchedule ? 'Cập nhật thông tin ca làm việc' : 'Phân ca làm việc cho nhân viên'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Nhân viên *</Label>
              <Select
                value={formData.employee_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, employee_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhân viên" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.employee_id} value={String(emp.employee_id)}>
                      {emp.full_name} {emp.position_name ? `- ${emp.position_name}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shift">Ca làm *</Label>
              <Select
                value={formData.shift_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, shift_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn ca làm" />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map((shift) => (
                    <SelectItem key={shift.shift_id} value={String(shift.shift_id)}>
                      {shift.shift_name} ({shift.start_time} - {shift.end_time})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="work_date">Ngày làm việc *</Label>
              <Input
                id="work_date"
                type="date"
                value={formData.work_date}
                onChange={(e) =>
                  setFormData({ ...formData, work_date: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} className="bg-[#3b82f6] hover:bg-[#2563eb]">
              {editingSchedule ? 'Cập nhật' : 'Thêm lịch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

{/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa lịch làm việc này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleDelete} 
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Shift Dialog */}
      <Dialog open={isShiftDialogOpen} onOpenChange={setIsShiftDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingShift ? 'Chỉnh sửa ca làm' : 'Thêm ca làm mới'}
            </DialogTitle>
            <DialogDescription>
              {editingShift ? 'Cập nhật thông tin ca làm việc' : 'Thêm ca làm việc mới vào hệ thống'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="shift_name">Tên ca *</Label>
              <Input
                id="shift_name"
                value={shiftFormData.shift_name}
                onChange={(e) =>
                  setShiftFormData({ ...shiftFormData, shift_name: e.target.value })
                }
                placeholder="Ví dụ: Ca sáng, Ca trưa, Ca chiều"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Giờ bắt đầu *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={shiftFormData.start_time}
                  onChange={(e) =>
                    setShiftFormData({ ...shiftFormData, start_time: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">Giờ kết thúc *</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={shiftFormData.end_time}
                  onChange={(e) =>
                    setShiftFormData({ ...shiftFormData, end_time: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary_multiplier">Hệ số lương</Label>
              <Input
                id="salary_multiplier"
                type="number"
                step="0.1"
                min="0.5"
                max="3"
                value={shiftFormData.salary_multiplier}
                onChange={(e) =>
                  setShiftFormData({ ...shiftFormData, salary_multiplier: e.target.value })
                }
                placeholder="1"
              />
              <p className="text-xs text-slate-500">
                Hệ số lương mặc định là 1. Ví dụ: 1.5 cho ca tăng ca
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShiftDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleShiftSubmit} className="bg-[#3b82f6] hover:bg-[#2563eb]">
              {editingShift ? 'Cập nhật' : 'Thêm ca'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Shift Confirmation Dialog */}
      <Dialog open={isDeleteShiftDialogOpen} onOpenChange={setIsDeleteShiftDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa ca</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa ca làm việc này? Lưu ý: Chỉ có thể xóa ca chưa được phân công.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteShiftDialogOpen(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleDeleteShift} 
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
