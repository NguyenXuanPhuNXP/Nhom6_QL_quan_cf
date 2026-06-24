import { useEffect, useState } from 'react';
import { Users, Calendar, UserCheck, FileText } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Loading } from '../components/Loading';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { dashboardAPI, notificationAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuth } from '../hooks/useAuth';

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsData, chartDataRes, scheduleData, notifData] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getAttendanceChart(),
          dashboardAPI.getTodaySchedule(),
          user ? notificationAPI.getAll() : Promise.resolve([]),
        ]);
        setStats(statsData);
        setChartData(chartDataRes);
        setTodaySchedule(scheduleData);
        setNotifications(notifData.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Dashboard</h1>
        <p className="text-slate-600 mt-1">Tổng quan hệ thống quản lý</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <StatCard
          title="Tổng nhân viên"
          value={stats?.totalEmployees || 0}
          icon={Users}
          iconBgColor="bg-blue-50"
          iconColor="text-[#3b82f6]"
        />
        <StatCard
          title="Ca hôm nay"
          value={stats?.totalShiftsToday || 0}
          icon={Calendar}
          iconBgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          title="Đang làm việc"
          value={stats?.employeesWorking || 0}
          icon={UserCheck}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Đơn chờ duyệt"
          value={stats?.pendingLeaveRequests || 0}
          icon={FileText}
          iconBgColor="bg-orange-50"
          iconColor="text-orange-600"
        />
      </div>

      {/* Charts and Schedule Grid */}
      {/** */}      
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        {/* Attendance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Biểu đồ chấm công 7 ngày</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="present" fill="#3b82f6" name="Đúng giờ" radius={[4, 4, 0, 0]} />
                <Bar dataKey="late" fill="#f59e0b" name="Trễ" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill="#ef4444" name="Nghỉ" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Today Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Lịch làm việc hôm nay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[300px]">
              <Table className="min-w-[520px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nhân viên</TableHead>
                    <TableHead>Ca làm</TableHead>
                    <TableHead>Giờ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todaySchedule.length > 0 ? (
                    todaySchedule.map((schedule) => (
                      <TableRow key={schedule.schedule_id}>
                        <TableCell className="font-medium">
                          {schedule.employee?.full_name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            style={{
                              backgroundColor: schedule.shift?.color || '#3b82f6',
                              color: 'white',
                            }}
                          >
                            {schedule.shift?.shift_name}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {schedule.shift?.start_time} - {schedule.shift?.end_time}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-slate-500">
                        Chưa có lịch làm việc hôm nay
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Thông báo gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.notification_id}
                  className={`flex items-start gap-4 p-4 rounded-lg border ${
                    notif.is_read ? 'bg-white' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-[#3b82f6] mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800">{notif.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">{notif.content}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(notif.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 py-4">Không có thông báo mới</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
