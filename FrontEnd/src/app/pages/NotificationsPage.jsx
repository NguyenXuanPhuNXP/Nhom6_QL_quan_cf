import { Bell, Check, CheckCheck } from 'lucide-react';
import { Loading } from '../components/Loading';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNotifications } from '../hooks/useNotifications';
import { isNotificationUnread } from '../utils/notifications';
import { toast } from 'sonner';

export const NotificationsPage = () => {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications();

  const handleMarkAsRead = async (id, event) => {
    event?.stopPropagation();
    try {
      await markAsRead(id);
      toast.success('Đã đánh dấu đã đọc');
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Thông báo</h1>
          <p className="text-slate-600 mt-1">
            {unreadCount > 0
              ? `Bạn có ${unreadCount} thông báo chưa đọc`
              : 'Không có thông báo mới'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            className="w-full sm:w-auto"
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif) => {
            const unread = isNotificationUnread(notif);

            return (
              <Card
                key={notif.notification_id}
                className={`transition-all cursor-pointer ${
                  unread ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white'
                }`}
                onClick={() => unread && handleMarkAsRead(notif.notification_id)}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        unread ? 'bg-[#3b82f6]' : 'bg-slate-100'
                      }`}
                    >
                      <Bell
                        className={`w-5 h-5 ${unread ? 'text-white' : 'text-slate-600'}`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-800">{notif.title}</h4>
                            {unread && (
                              <span className="inline-flex h-2 w-2 rounded-full bg-[#3b82f6]" />
                            )}
                          </div>
                          <p className="text-slate-600 mb-2">{notif.content}</p>
                          <p className="text-xs text-slate-400">
                            {format(new Date(notif.created_at), 'dd/MM/yyyy HH:mm', {
                              locale: vi,
                            })}
                          </p>
                        </div>
                        {unread && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleMarkAsRead(notif.notification_id, e)}
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
            );
          })
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
