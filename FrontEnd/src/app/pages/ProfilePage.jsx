import { useState } from 'react';
import { User, Lock, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: user?.employee.full_name || '',
    phone: user?.employee.phone || '',
    address: user?.employee.address || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleUpdateProfile = () => {
    toast.success('Cập nhật thông tin thành công');
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    toast.success('Đổi mật khẩu thành công');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Hồ sơ cá nhân</h1>
        <p className="text-slate-600 mt-1">Quản lý thông tin tài khoản của bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarFallback className="bg-[#3b82f6] text-white text-2xl">
                  {getInitials(user.employee.full_name)}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold text-slate-800 mb-1">
                {user.employee.full_name}
              </h3>
              <p className="text-sm text-slate-600 mb-2">{user.employee.position}</p>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium capitalize">
                {user.role}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-500 w-20">Giới tính:</span>
                <span className="font-medium text-slate-800">{user.employee.gender}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-500 w-20">SĐT:</span>
                <span className="font-medium text-slate-800">{user.employee.phone}</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <span className="text-slate-500 w-20">Địa chỉ:</span>
                <span className="font-medium text-slate-800">{user.employee.address}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-500 w-20">Lương/giờ:</span>
                <span className="font-medium text-slate-800">
                  {user.employee.salary_rate.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Tabs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cài đặt tài khoản</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">
                  <User className="w-4 h-4 mr-2" />
                  Thông tin cá nhân
                </TabsTrigger>
                <TabsTrigger value="password">
                  <Lock className="w-4 h-4 mr-2" />
                  Đổi mật khẩu
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Họ và tên</Label>
                    <Input
                      id="full_name"
                      value={profileData.full_name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, full_name: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({ ...profileData, phone: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Địa chỉ</Label>
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) =>
                        setProfileData({ ...profileData, address: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    {isEditing ? (
                      <>
                        <Button
                          onClick={handleUpdateProfile}
                          className="bg-[#3b82f6] hover:bg-[#2563eb]"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Lưu thay đổi
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Hủy
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)}>Chỉnh sửa</Button>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="password" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Nhập mật khẩu mới"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Nhập lại mật khẩu mới"
                    />
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    className="bg-[#3b82f6] hover:bg-[#2563eb] mt-4"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Đổi mật khẩu
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
