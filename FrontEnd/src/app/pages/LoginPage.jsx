import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Coffee, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

export const LoginPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    
    if (isRegistering) {
      if (!username || !password || !confirmPassword || !fullName) {
        toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Mật khẩu xác nhận không khớp');
        return;
      }
      if (password.length < 6) {
        toast.error('Mật khẩu phải có ít nhất 6 ký tự');
        return;
      }
    } else {
      if (!username || !password) {
        toast.error('Vui lòng nhập đầy đủ thông tin');
        return;
      }
    }

    setIsLoading(true);
    try {
      const endpoint = isRegistering ? 'http://localhost:3000/auth/register' : 'http://localhost:3000/auth/login';
      const bodyData = isRegistering 
        ? { username, password, confirmPassword, full_name: fullName }
        : { username, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });
      const data = await response.json();
      
      if (response.ok && data.token) {
        let employee = {
          employee_id: data.user.employee_id,
          full_name: data.user.full_name,
        };

        try {
          const empRes = await fetch(
            `http://localhost:3000/auth/employees/${data.user.employee_id}`,
            {
              headers: {
                Authorization: `Bearer ${data.token}`,
              },
            }
          );
          if (empRes.ok) {
            const empData = await empRes.json();
            employee = {
              ...empData,
              position: empData.position_name || empData.position,
            };
          }
        } catch (_) {}

        login({
          id: data.user.account_id,
          username: data.user.username,
          role: data.user.role_name,
          employee,
        }, data.token);
        
        toast.success(isRegistering ? 'Đăng ký thành công!' : 'Đăng nhập thành công!');
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra. Vui lòng kiểm tra lại kết nối mạng');
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

      {/* Auth Card */}
      <Card className="w-full max-w-md relative z-10 shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-[#3b82f6] rounded-2xl flex items-center justify-center">
            <Coffee className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl">Cafe Manager</CardTitle>
          <CardDescription>Hệ thống quản lý nhân sự và ca làm</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="fullname">Họ và tên *</Label>
                <Input
                  id="fullname"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập {isRegistering && '*'}</Label>
              <Input
                id="username"
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu {isRegistering && '*'}</Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-11"
              />
            </div>

            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
            )}

            {!isRegistering && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked)}
                  disabled={isLoading}
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-normal text-slate-600 cursor-pointer"
                >
                  Ghi nhớ đăng nhập
                </label>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-[#3b82f6] hover:bg-[#2563eb]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                isRegistering ? 'Đăng ký' : 'Đăng nhập'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            {isRegistering ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
            <button 
              className="ml-1 text-[#3b82f6] hover:underline font-semibold"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setUsername('');
                setPassword('');
                setConfirmPassword('');
                setFullName('');
              }}
            >
              {isRegistering ? 'Đăng nhập ngay' : 'Đăng ký ngay'}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-[#3b82f6]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-[#60a5fa]/10 rounded-full blur-3xl"></div>
    </div>
  );
};
