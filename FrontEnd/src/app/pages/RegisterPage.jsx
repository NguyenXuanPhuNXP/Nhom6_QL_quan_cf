import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Coffee, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

const API_URL = 'http://localhost:3000';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    address: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.username || !formData.password || !formData.full_name) {
      toast.error('Vui lòng nhập username, password, và họ tên');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          full_name: formData.full_name,
          phone: formData.phone || null,
          address: formData.address || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Đăng ký thất bại');
        return;
      }

      // Login with returned token
      login({
        id: data.user.account_id,
        username: data.user.username,
        role: data.user.role_name,
        employee: {
          employee_id: data.user.employee_id,
          full_name: data.user.full_name,
          avatar: null,
        },
      });

      toast.success('Đăng ký thành công!');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1511081692775-05d0f180a065?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBzaG9wJTIwaW50ZXJpb3IlMjBtb2Rlcm58ZW58MXx8fHwxNzc5NDMwNzc2fDA&ixlib=rb-4.1.0&q=80&w=1080')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a]/95 to-[#1e293b]/90"></div>
      </div>

      {/* Register Card */}
      <Card className="w-full max-w-md relative z-10 shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-[#3b82f6] rounded-2xl flex items-center justify-center">
            <Coffee className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl">Tạo Tài Khoản</CardTitle>
          <CardDescription>Đăng ký để sử dụng hệ thống quản lý</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Họ và tên</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Nhập họ và tên"
                value={formData.full_name}
                onChange={handleChange}
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại (không bắt buộc)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Nhập số điện thoại"
                value={formData.phone}
                onChange={handleChange}
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ (không bắt buộc)</Label>
              <Input
                id="address"
                name="address"
                type="text"
                placeholder="Nhập địa chỉ"
                value={formData.address}
                onChange={handleChange}
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-[#3b82f6] hover:bg-[#2563eb] mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đăng ký...
                </>
              ) : (
                'Đăng Ký'
              )}
            </Button>

            <div className="text-center text-sm text-slate-600">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-[#3b82f6] hover:underline font-medium">
                Đăng nhập tại đây
              </Link>
            </div>

            <Link
              to="/"
              className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 mt-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Link>
          </form>
        </CardContent>
      </Card>

      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-[#3b82f6]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-[#60a5fa]/10 rounded-full blur-3xl"></div>
    </div>
  );
};
