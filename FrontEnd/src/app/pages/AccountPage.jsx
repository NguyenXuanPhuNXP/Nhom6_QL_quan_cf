import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { accountAPI } from '../services/api';
import { toast } from 'sonner';
import { Shield, Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';

export const AccountPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [employeesWithoutAccount, setEmployeesWithoutAccount] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role_id: '',
    employee_id: '',
    status: 'Active',
  });

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [accountsData, rolesData] = await Promise.all([
        accountAPI.getAll(),
        accountAPI.getRoles()
      ]);
      setAccounts(accountsData);
      setRoles(rolesData);
    } catch (error) {
      toast.error(error.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmployeesForCreation = async () => {
    try {
      const emps = await accountAPI.getEmployeesWithoutAccount();
      setEmployeesWithoutAccount(emps);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách nhân viên chưa có tài khoản');
    }
  };

  const handleOpenDialog = async (account = null) => {
    if (account) {
      setEditingId(account.account_id);
      setFormData({
        username: account.username,
        password: '',
        role_id: account.role_id,
        employee_id: account.employee_id,
        status: account.status || 'Active',
      });
      setEmployeesWithoutAccount([]);
    } else {
      setEditingId(null);
      setFormData({
        username: '',
        password: '',
        role_id: roles.length > 0 ? roles[0].role_id : '',
        employee_id: '',
        status: 'Active',
      });
      await loadEmployeesForCreation();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.role_id || (!editingId && (!formData.password || !formData.employee_id))) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingId) {
        // Chỉ gửi password nếu có thay đổi
        const updateData = {
          role_id: formData.role_id,
          status: formData.status
        };
        if (formData.password) {
            updateData.password = formData.password;
        }
        await accountAPI.update(editingId, updateData);
        toast.success('Cập nhật tài khoản thành công');
      } else {
        await accountAPI.create(formData);
        toast.success('Thêm tài khoản thành công');
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) return;
    try {
      await accountAPI.delete(id);
      toast.success('Xóa tài khoản thành công');
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Lỗi khi xóa tài khoản');
    }
  };

  const filteredAccounts = accounts.filter(
    (acc) =>
      acc.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-16 w-16 text-slate-300" />
          <h2 className="mt-4 text-xl font-semibold">Không có quyền truy cập</h2>
          <p className="mt-2 text-slate-500">
            Chỉ quản trị viên mới có thể xem và quản lý tài khoản.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Tài Khoản</h1>
          <p className="text-slate-500">Quản lý thông tin đăng nhập và quyền truy cập</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-[#3b82f6] hover:bg-[#2563eb]">
          <Plus className="mr-2 h-4 w-4" /> Thêm tài khoản
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách tài khoản</CardTitle>
          <CardDescription>Tổng số: {accounts.length} tài khoản</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Tìm kiếm theo tên đăng nhập hoặc tên nhân viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Username</th>
                      <th className="px-4 py-3 font-medium">Nhân viên</th>
                      <th className="px-4 py-3 font-medium">Chức vụ</th>
                      <th className="px-4 py-3 font-medium">Phân quyền</th>
                      <th className="px-4 py-3 font-medium">Trạng thái</th>
                      <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredAccounts.length > 0 ? (
                      filteredAccounts.map((account) => (
                        <tr key={account.account_id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {account.username}
                          </td>
                          <td className="px-4 py-3">{account.full_name}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                              {account.position_name || 'Chưa phân công'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              account.role_name === 'Admin'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {account.role_name}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              account.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {account.status === 'Active' ? 'Hoạt động' : 'Đã khóa'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDialog(account)}
                                className="h-8 border-[#3b82f6] text-[#3b82f6] hover:bg-[#eff6ff]"
                              >
                                <Edit className="mr-1 h-3.5 w-3.5" /> Sửa
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(account.account_id)}
                                disabled={account.account_id === user?.id} // Không cho tự xóa mình
                                className="h-8 border-rose-500 text-rose-500 hover:bg-rose-50"
                              >
                                <Trash2 className="mr-1 h-3.5 w-3.5" /> Xóa
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                          Không tìm thấy tài khoản nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {!editingId && (
              <div className="space-y-2">
                <Label htmlFor="employee_id">Nhân viên *</Label>
                <select
                  id="employee_id"
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  required
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {employeesWithoutAccount.map((emp) => (
                    <option key={emp.employee_id} value={emp.employee_id}>
                      {emp.full_name} ({emp.phone || 'Không có sđt'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={!!editingId} // Không cho đổi username khi sửa
                placeholder="Nhập tên đăng nhập"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Mật khẩu {editingId ? '(Bỏ trống nếu không đổi)' : '*'}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingId ? 'Nhập mật khẩu mới...' : 'Nhập mật khẩu'}
                required={!editingId}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role_id">Phân quyền *</Label>
              <select
                id="role_id"
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.role_id}
                onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                required
              >
                <option value="">-- Chọn quyền --</option>
                {roles.map((r) => (
                  <option key={r.role_id} value={r.role_id}>
                    {r.role_name}
                  </option>
                ))}
              </select>
            </div>

            {editingId && (
                <div className="space-y-2">
                <Label htmlFor="status">Trạng thái *</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="Active">Hoạt động</option>
                  <option value="Locked">Đã khóa</option>
                </select>
              </div>
            )}

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#3b82f6] hover:bg-[#2563eb]">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? 'Lưu thay đổi' : 'Thêm tài khoản'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
