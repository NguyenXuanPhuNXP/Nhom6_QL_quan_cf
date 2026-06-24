import { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { Loading } from '../components/Loading';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { notificationAPI } from '../services/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';
//notificationsPage.jsx
export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const data = await notificationAPI.getAll(user.employee.employee_id);
      setNotifications(data);
    } catch (error) {
      toast.error('Lỗi khi tải thông báo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(
        notifications.map((n) =>
          n.notification_id === id ? { ...n, is_read: true } : n
        )
      );
      toast.success('Đã đánh dấu đã đọc');
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Thông báo</h1>
          <p className="text-slate-600 mt-1">
            {unreadCount > 0
              ? `Bạn có ${unreadCount} thông báo chưa đọc`
              : 'Không có thông báo mới'}
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <Card
              key={notif.notification_id}
              className={`transition-all ${
                notif.is_read
                  ? 'bg-white'
                  : 'bg-blue-50 border-blue-200 shadow-sm'
              }`}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notif.is_read ? 'bg-slate-100' : 'bg-[#3b82f6]'
                    }`}
                  >
                    <Bell
                      className={`w-5 h-5 ${
                        notif.is_read ? 'text-slate-600' : 'text-white'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-1">
                          {notif.title}
                        </h4>
                        <p className="text-slate-600 mb-2">{notif.content}</p>
                        <p className="text-xs text-slate-400">
                          {format(new Date(notif.created_at), 'dd/MM/yyyy HH:mm', {
                            locale: vi,
                          })}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkAsRead(notif.notification_id)}
                          className="w-full shrink-0 sm:w-auto"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Đánh dấu đã đọc
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Không có thông báo nào</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
