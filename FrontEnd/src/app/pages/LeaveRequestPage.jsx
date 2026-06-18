import { useEffect, useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { leaveRequestAPI, employeeAPI } from '../services/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';

export const LeaveRequestPage = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: 0,
    leave_date: '',
    reason: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [leaveData, employeeData] = await Promise.all([
        leaveRequestAPI.getAll(),
        employeeAPI.getAll(),
      ]);
      setLeaveRequests(leaveData);
      setEmployees(employeeData);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.leave_date || !formData.reason) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      await leaveRequestAPI.create(formData);
      toast.success('Gửi đơn nghỉ phép thành công');
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleApprove = async (id) => {
    try {
      await leaveRequestAPI.approve(id);
      toast.success('Đã duyệt đơn nghỉ phép');
      fetchData();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Bạn có chắc muốn từ chối đơn này?')) return;

    try {
      await leaveRequestAPI.reject(id);
      toast.success('Đã từ chối đơn nghỉ phép');
      fetchData();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Chờ duyệt': 'bg-yellow-100 text-yellow-800',
      'Đã duyệt': 'bg-green-100 text-green-800',
      'Từ chối': 'bg-red-100 text-red-800',
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

  if (isLoading) {
    return <Loading />;
  }

  const pendingCount = leaveRequests.filter((l) => l.status === 'Chờ duyệt').length;
  const approvedCount = leaveRequests.filter((l) => l.status === 'Đã duyệt').length;
  const rejectedCount = leaveRequests.filter((l) => l.status === 'Từ chối').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Đơn nghỉ phép</h1>
          <p className="text-slate-600 mt-1">Quản lý đơn xin nghỉ phép của nhân viên</p>
        </div>
        <Button
          onClick={() => {
            setFormData({
              employee_id: user?.employee.employee_id || 0,
              leave_date: '',
              reason: '',
            });
            setIsDialogOpen(true);
          }}
          className="bg-[#3b82f6] hover:bg-[#2563eb]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo đơn mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">Chờ duyệt</p>
              <h3 className="text-3xl font-bold text-yellow-600">{pendingCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">Đã duyệt</p>
              <h3 className="text-3xl font-bold text-green-600">{approvedCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">Từ chối</p>
              <h3 className="text-3xl font-bold text-red-600">{rejectedCount}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách đơn nghỉ phép</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Ngày nghỉ</TableHead>
                  <TableHead>Lý do</TableHead>
                  <TableHead>Ngày gửi</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveRequests.length > 0 ? (
                  leaveRequests.map((leave) => (
                    <TableRow key={leave.leave_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-[#3b82f6] text-white">
                              {leave.employee && getInitials(leave.employee.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{leave.employee?.full_name}</p>
                            <p className="text-xs text-slate-500">{leave.employee?.position}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(leave.leave_date), 'dd/MM/yyyy', { locale: vi })}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate">{leave.reason}</p>
                      </TableCell>
                      <TableCell>
                        {leave.created_at &&
                          format(new Date(leave.created_at), 'dd/MM/yyyy HH:mm', {
                            locale: vi,
                          })}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(leave.status)}>{leave.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {leave.status === 'Chờ duyệt' && user?.role === 'admin' && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(leave.leave_id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Duyệt
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(leave.leave_id)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Từ chối
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                      Chưa có đơn nghỉ phép nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Leave Request Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo đơn nghỉ phép</DialogTitle>
            <DialogDescription>Điền thông tin đơn xin nghỉ phép</DialogDescription>
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
              <Label htmlFor="leave_date">Ngày nghỉ *</Label>
              <Input
                id="leave_date"
                type="date"
                value={formData.leave_date}
                onChange={(e) => setFormData({ ...formData, leave_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Lý do nghỉ *</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Nhập lý do xin nghỉ phép..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} className="bg-[#3b82f6] hover:bg-[#2563eb]">
              Gửi đơn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
