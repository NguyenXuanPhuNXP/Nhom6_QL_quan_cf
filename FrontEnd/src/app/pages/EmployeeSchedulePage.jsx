import { useEffect, useMemo, useState } from 'react';
import { addDays, format, isSameDay, startOfWeek } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Coffee, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { Loading } from '../components/Loading';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

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

const shiftColorMap = {
  'Ca sáng': '#3b82f6',
  'Ca chiều': '#10b981',
  'Ca tối': '#8b5cf6',
};

const getShiftColor = (shiftName) => shiftColorMap[shiftName] || '#6366f1';

const minutesBetween = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  return Math.max(0, endHour * 60 + endMinute - (startHour * 60 + startMinute));
};

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) return `${mins} phút`;
  if (!mins) return `${hours} giờ`;
  return `${hours} giờ ${mins} phút`;
};

export const EmployeeSchedulePage = () => {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(currentWeek, index)),
    [currentWeek]
  );

  useEffect(() => {
    const fetchSchedule = async () => {
      setIsLoading(true);
      try {
        const start = format(weekDays[0], 'yyyy-MM-dd');
        const end = format(weekDays[6], 'yyyy-MM-dd');
        const response = await fetch(`${API_URL}/api/schedules/week?start=${start}&end=${end}`, {
          headers: getAuthHeaders(),
        });
        const data = await response.json();

        if (!response.ok) {
          toast.error(data.message || 'Không thể tải lịch làm việc');
          return;
        }

        const employeeId = user?.employee?.employee_id;
        setSchedules(data.filter((schedule) => schedule.employee_id === employeeId));
      } catch (error) {
        toast.error('Có lỗi khi tải lịch làm việc');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [user?.employee?.employee_id, weekDays]);

  const schedulesByDate = useMemo(() => {
    return schedules.reduce((result, schedule) => {
      result[schedule.work_date] = schedule;
      return result;
    }, {});
  }, [schedules]);

  const totalMinutes = schedules.reduce(
    (sum, schedule) => sum + minutesBetween(schedule.shift?.start_time, schedule.shift?.end_time),
    0
  );

  const sortedSchedules = [...schedules].sort((a, b) => a.work_date.localeCompare(b.work_date));
  const today = new Date();
  const nextSchedule = sortedSchedules.find((schedule) => {
    const date = new Date(`${schedule.work_date}T00:00:00`);
    return date >= new Date(format(today, 'yyyy-MM-dd'));
  });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Lịch làm việc của tôi</h1>
          <p className="mt-1 text-slate-600">
            Theo dõi ca làm, giờ bắt đầu và giờ kết thúc trong tuần
          </p>
        </div>
        <Badge className="w-fit bg-blue-100 text-blue-800 hover:bg-blue-100">
          {user?.employee?.full_name || 'Nhân viên'}
        </Badge>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Tuần trước
            </Button>
            <div className="order-first flex items-center justify-center gap-2 text-center sm:order-none">
              <CalendarDays className="h-5 w-5 text-slate-600" />
              <span className="font-medium text-slate-800">
                {format(weekDays[0], 'dd/MM/yyyy', { locale: vi })} -{' '}
                {format(weekDays[6], 'dd/MM/yyyy', { locale: vi })}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
            >
              Tuần sau
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-sm text-slate-600">Tổng số ca</p>
              <h3 className="text-2xl font-bold text-[#3b82f6]">{schedules.length}</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
              <Coffee className="h-6 w-6 text-[#3b82f6]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-sm text-slate-600">Tổng giờ làm</p>
              <h3 className="text-2xl font-bold text-green-600">{formatDuration(totalMinutes)}</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50">
              <Timer className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between gap-4 pt-6">
            <div className="min-w-0">
              <p className="text-sm text-slate-600">Ca gần nhất</p>
              <h3 className="truncate text-lg font-bold text-purple-600">
                {nextSchedule
                  ? `${nextSchedule.shift?.shift_name} - ${format(
                      new Date(`${nextSchedule.work_date}T00:00:00`),
                      'dd/MM'
                    )}`
                  : 'Chưa có ca'}
              </h3>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-50">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        {weekDays.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const schedule = schedulesByDate[dateKey];
          const isToday = isSameDay(day, today);

          return (
            <Card
              key={dateKey}
              className={isToday ? 'border-blue-200 bg-blue-50/60' : 'bg-white'}
            >
              <CardContent className="p-4">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {format(day, 'EEEE', { locale: vi })}
                    </p>
                    <h3 className="text-xl font-bold text-slate-800">
                      {format(day, 'dd/MM')}
                    </h3>
                  </div>
                  {isToday && (
                    <Badge className="bg-blue-600 text-white hover:bg-blue-600">Hôm nay</Badge>
                  )}
                </div>

                {schedule ? (
                  <div className="space-y-3">
                    <Badge
                      style={{
                        backgroundColor: getShiftColor(schedule.shift?.shift_name),
                        color: 'white',
                      }}
                    >
                      {schedule.shift?.shift_name}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {schedule.shift?.start_time} - {schedule.shift?.end_time}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDuration(
                          minutesBetween(schedule.shift?.start_time, schedule.shift?.end_time)
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-slate-200 p-3 text-sm text-slate-400">
                    Không có ca
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chi tiết lịch tuần</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedSchedules.length > 0 ? (
            <Table className="min-w-[620px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Ca làm</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Thời lượng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSchedules.map((schedule) => (
                  <TableRow key={schedule.schedule_id}>
                    <TableCell className="font-medium">
                      {format(new Date(`${schedule.work_date}T00:00:00`), 'EEEE, dd/MM/yyyy', {
                        locale: vi,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: getShiftColor(schedule.shift?.shift_name),
                          color: 'white',
                        }}
                      >
                        {schedule.shift?.shift_name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {schedule.shift?.start_time} - {schedule.shift?.end_time}
                    </TableCell>
                    <TableCell>
                      {formatDuration(
                        minutesBetween(schedule.shift?.start_time, schedule.shift?.end_time)
                      )}
                    </TableCell>
                    <TableCell>{schedule.status || 'Đã phân công'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 py-10 text-center">
              <CalendarDays className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="font-medium text-slate-600">Tuần này chưa có lịch làm việc</p>
              <p className="mt-1 text-sm text-slate-400">Lịch sẽ hiển thị khi quản lý phân ca</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
