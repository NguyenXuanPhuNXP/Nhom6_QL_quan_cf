import { Bell, LogOut, Menu, User, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { useNavigate } from 'react-router';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Button } from '../components/ui/button';
import { isNotificationUnread } from '../utils/notifications';
import { toast } from 'sonner';

export const Header = ({ onOpenSidebar }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const recentNotifications = notifications.slice(0, 5);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMarkAsRead = async (id, event) => {
    event?.stopPropagation();
    try {
      await markAsRead(id);
    } catch (error) {
      toast.error(error.message || 'Không thể đánh dấu đã đọc');
    }
  };

  const handleMarkAllAsRead = async (event) => {
    event?.stopPropagation();
    try {
      await markAllAsRead();
      toast.success('Đã đánh dấu tất cả đã đọc');
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra');
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

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6 md:left-64">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 md:hidden"
          onClick={onOpenSidebar}
          aria-label="Mo menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
        <h2 className="truncate text-base font-semibold text-slate-800 sm:text-xl">
          Xin chào, {user?.employee.full_name}!
        </h2>
        <p className="hidden text-sm text-slate-500 sm:block">
          {new Date().toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Thông báo</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-normal text-[#3b82f6] hover:underline"
                >
                  Đánh dấu tất cả
                </button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {recentNotifications.length > 0 ? (
              recentNotifications.map((notif) => {
                const unread = isNotificationUnread(notif);
                return (
                  <DropdownMenuItem
                    key={notif.notification_id}
                    className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                      unread ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      if (unread) {
                        handleMarkAsRead(notif.notification_id);
                      }
                      navigate('/notifications');
                    }}
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800">{notif.title}</p>
                      {unread && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(notif.notification_id, e)}
                          className="shrink-0 text-slate-400 hover:text-[#3b82f6]"
                          title="Đánh dấu đã đọc"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{notif.content}</p>
                  </DropdownMenuItem>
                );
              })
            ) : (
              <div className="px-3 py-6 text-center text-sm text-slate-500">
                Không có thông báo
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/notifications')}>
              <CheckCheck className="mr-2 h-4 w-4" />
              <span>Xem tất cả thông báo</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50 sm:gap-3 sm:px-3">
              <Avatar>
                {user?.employee?.avatar ? (
                  <AvatarImage src={user.employee.avatar} alt={user.employee.full_name} />
                ) : (
                  <AvatarFallback className="bg-[#3b82f6] text-white">
                    {user?.employee.full_name && getInitials(user.employee.full_name)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium text-slate-800">
                  {user?.employee.full_name}
                </p>
                <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Hồ sơ</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
