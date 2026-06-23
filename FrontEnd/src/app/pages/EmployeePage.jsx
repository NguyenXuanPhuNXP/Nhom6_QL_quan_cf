import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Loading } from '../components/Loading';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { employeeAPI } from '../services/api';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';

//employee management page
export const EmployeePage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    gender: 'Nam',
    phone: '',
    address: '',
    position: '',
    salary_rate: 0,
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const filtered = employees.filter(
      (emp) =>
        emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.phone.includes(searchTerm)
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await employeeAPI.getAll();
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu nhân viên');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        full_name: employee.full_name,
        gender: employee.gender,
        phone: employee.phone,
        address: employee.address,
        position: employee.position,
        salary_rate: employee.salary_rate,
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        full_name: '',
        gender: 'Nam',
        phone: '',
        address: '',
        position: '',
        salary_rate: 0,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.full_name || !formData.phone || !formData.position) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      if (editingEmployee) {
        await employeeAPI.update(editingEmployee.employee_id, formData);
        toast.success('Cập nhật nhân viên thành công');
      } else {
        await employeeAPI.create(formData);
        toast.success('Thêm nhân viên thành công');
      }
      setIsDialogOpen(false);
      fetchEmployees();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa nhân viên này?')) return;

    setIsDeleting(true);
    try {
      await employeeAPI.delete(id);
      toast.success('Xóa nhân viên thành công');
      fetchEmployees();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPositionColor = (position) => {
    const colors = {
      'Quản lý': 'bg-purple-100 text-purple-800',
      'Pha chế': 'bg-blue-100 text-blue-800',
      'Phục vụ': 'bg-green-100 text-green-800',
      'Thu ngân': 'bg-orange-100 text-orange-800',
    };
    return colors[position] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Quản lý nhân viên</h1>
          <p className="text-slate-600 mt-1">Danh sách và thông tin nhân viên</p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => handleOpenDialog()}
            className="w-full bg-[#3b82f6] hover:bg-[#2563eb] sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm nhân viên
          </Button>
        )}
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Tìm kiếm theo tên, vị trí, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhân viên ({filteredEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Giới tính</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Lương/giờ</TableHead>
                  {isAdmin && <TableHead className="text-right">Thao tác</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.employee_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-[#3b82f6] text-white">
                            {getInitials(employee.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{employee.full_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{employee.gender}</TableCell>
                    <TableCell>{employee.phone}</TableCell>
                    <TableCell className="max-w-xs truncate">{employee.address}</TableCell>
                    <TableCell>
                      <Badge className={getPositionColor(employee.position)}>
                        {employee.position}
                      </Badge>
                    </TableCell>
                    <TableCell>{employee.salary_rate.toLocaleString('vi-VN')}đ</TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDialog(employee)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(employee.employee_id)}
                            disabled={isDeleting}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin nhân viên vào form bên dưới
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Họ và tên *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Giới tính</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) =>
                  setFormData({ ...formData, gender: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nam">Nam</SelectItem>
                  <SelectItem value="Nữ">Nữ</SelectItem>
                  <SelectItem value="Khác">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0901234567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Vị trí *</Label>
              <Select
                value={formData.position}
                onValueChange={(value) => setFormData({ ...formData, position: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vị trí" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Quản lý">Quản lý</SelectItem>
                  <SelectItem value="Pha chế">Pha chế</SelectItem>
                  <SelectItem value="Phục vụ">Phục vụ</SelectItem>
                  <SelectItem value="Thu ngân">Thu ngân</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Đường ABC, Quận 1, TP.HCM"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary_rate">Lương theo giờ (VNĐ)</Label>
              <Input
                id="salary_rate"
                type="number"
                value={formData.salary_rate}
                onChange={(e) =>
                  setFormData({ ...formData, salary_rate: Number(e.target.value) })
                }
                placeholder="30000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} className="bg-[#3b82f6] hover:bg-[#2563eb]">
              {editingEmployee ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
