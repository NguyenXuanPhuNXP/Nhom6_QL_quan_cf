import { useEffect, useState } from 'react';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Loading } from '../components/Loading';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
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
import { scheduleAPI, employeeAPI, shiftAPI } from '../services/api';
import { toast } from 'sonner';
import { format, addDays, startOfWeek } from 'date-fns';
import { vi } from 'date-fns/locale';

export const SchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [formData, setFormData] = useState({
    employee_id: 0,
    shift_id: 0,
    work_date: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [schedulesData, employeesData, shiftsData] = await Promise.all([
        scheduleAPI.getAll(),
        employeeAPI.getAll(),
        shiftAPI.getAll(),
      ]);
      setSchedules(schedulesData);
      setEmployees(employeesData);
      setShifts(shiftsData);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.shift_id || !formData.work_date) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      await scheduleAPI.create(formData);
      toast.success('Thêm lịch làm việc thành công');
      setIsDialogOpen(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Phân ca làm việc</h1>
          <p className="text-slate-600 mt-1">Quản lý lịch làm việc theo tuần</p>
        </div>
        <Button
          onClick={() => {
            setFormData({
              employee_id: 0,
              shift_id: 0,
              work_date: format(new Date(), 'yyyy-MM-dd'),
            });
            setIsDialogOpen(true);
          }}
          className="bg-[#3b82f6] hover:bg-[#2563eb]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm lịch
        </Button>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
            >
              ← Tuần trước
            </Button>
            <div className="flex items-center gap-2">
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
            <Table>
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
                            <Badge
                              style={{
                                backgroundColor: schedule.shift.color || '#3b82f6',
                                color: 'white',
                              }}
                              className="cursor-pointer"
                            >
                              {schedule.shift.shift_name}
                            </Badge>
                          ) : (
                            <span className="text-slate-300">-</span>
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
        <CardHeader>
          <CardTitle>Chú thích ca làm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {shifts.map((shift) => (
              <div key={shift.shift_id} className="flex items-center gap-2">
                <Badge
                  style={{
                    backgroundColor: shift.color || '#3b82f6',
                    color: 'white',
                  }}
                >
                  {shift.shift_name}
                </Badge>
                <span className="text-sm text-slate-600">
                  {shift.start_time} - {shift.end_time}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Schedule Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm lịch làm việc</DialogTitle>
            <DialogDescription>
              Phân ca làm việc cho nhân viên
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Nhân viên *</Label>
              <Select
                value={formData.employee_id.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, employee_id: Number(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhân viên" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.employee_id} value={emp.employee_id.toString()}>
                      {emp.full_name} - {emp.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shift">Ca làm *</Label>
              <Select
                value={formData.shift_id.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, shift_id: Number(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn ca làm" />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map((shift) => (
                    <SelectItem key={shift.shift_id} value={shift.shift_id.toString()}>
                      {shift.shift_name} ({shift.start_time} - {shift.end_time})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="work_date">Ngày làm việc *</Label>
              <input
                id="work_date"
                type="date"
                value={formData.work_date}
                onChange={(e) =>
                  setFormData({ ...formData, work_date: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} className="bg-[#3b82f6] hover:bg-[#2563eb]">
              Thêm lịch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
