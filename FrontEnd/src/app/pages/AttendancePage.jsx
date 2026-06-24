import { useEffect, useState } from 'react';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { Loading } from '../components/Loading';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { attendanceAPI } from '../services/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';

export const AttendancePage = () => {
  const { user } = useAuth();
  const [attendances, setAttendances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    fetchAttendances();
  }, []);

  const fetchAttendances = async () => {
    setIsLoading(true);
    try {
      const data = await attendanceAPI.getAll();
      setAttendances(data);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu chấm công');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await attendanceAPI.checkIn(user?.employee?.employee_id);
      toast.success('Check-in thành công');
      fetchAttendances();
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const handleCheckOut = async (attendanceId) => {
    try {
      await attendanceAPI.checkOut(attendanceId);
      toast.success('Check-out thành công');
      fetchAttendances();
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Đúng giờ': 'bg-green-100 text-green-800',
      'Đi trễ': 'bg-orange-100 text-orange-800',
      'Về sớm': 'bg-orange-100 text-orange-800',
      'Nghỉ làm': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredAttendances = attendances.filter((att) => {
    const workDate = att.work_date || format(new Date(att.check_in), 'yyyy-MM-dd');
    return workDate === selectedDate;
  });

  const openSession = attendances.find(
    (att) =>
      att.employee_id === user?.employee?.employee_id && !att.check_out
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Chấm công</h1>
          <p className="text-slate-600 mt-1">Quản lý chấm công check-in/check-out</p>
        </div>
        <div className="flex gap-2">
          {!openSession ? (
            <Button onClick={handleCheckIn} className="bg-green-600 hover:bg-green-700">
              <LogIn className="w-4 h-4 mr-2" />
              Check-in
            </Button>
          ) : (
            <Button
              onClick={() => handleCheckOut(openSession.attendance_id)}
              className="bg-red-600 hover:bg-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Check-out
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Đúng giờ</p>
                <h3 className="text-2xl font-bold text-green-600">
                  {attendances.filter((a) => a.status === 'Đúng giờ').length}
                </h3>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Đi trễ</p>
                <h3 className="text-2xl font-bold text-orange-600">
                  {attendances.filter((a) => a.status === 'Đi trễ' || a.status === 'Về sớm').length}
                </h3>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Nghỉ</p>
                <h3 className="text-2xl font-bold text-red-600">
                  {attendances.filter((a) => a.status === 'Nghỉ làm').length}
                </h3>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <label className="text-sm font-medium text-slate-700">Chọn ngày:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:w-auto"
            />
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Bảng chấm công ngày {format(new Date(selectedDate), 'dd/MM/yyyy', { locale: vi })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Số giờ làm</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendances.length > 0 ? (
                  filteredAttendances.map((attendance) => {
                    const checkInTime = new Date(attendance.check_in);
                    const checkOutTime = attendance.check_out
                      ? new Date(attendance.check_out)
                      : null;
                    const hoursWorked = attendance.total_hours
                      ? Number(attendance.total_hours).toFixed(1)
                      : checkOutTime
                        ? ((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)).toFixed(1)
                        : '-';

                    return (
                      <TableRow key={attendance.attendance_id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-[#3b82f6] text-white">
                                {attendance.employee && getInitials(attendance.employee.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {attendance.employee?.full_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <LogIn className="w-4 h-4 text-green-600" />
                            <span className="text-sm">
                              {format(checkInTime, 'HH:mm', { locale: vi })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {checkOutTime ? (
                            <div className="flex items-center gap-2">
                              <LogOut className="w-4 h-4 text-red-600" />
                              <span className="text-sm">
                                {format(checkOutTime, 'HH:mm', { locale: vi })}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm">Chưa check-out</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(attendance.status)}>
                            {attendance.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{hoursWorked} giờ</span>
                        </TableCell>
                        <TableCell className="text-right">
                          {!checkOutTime && (
                            <Button
                              size="sm"
                              onClick={() => handleCheckOut(attendance.attendance_id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <LogOut className="w-4 h-4 mr-1" />
                              Check-out
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                      Chưa có dữ liệu chấm công cho ngày này
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
