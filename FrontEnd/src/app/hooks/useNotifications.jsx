import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth';
import { notificationAPI } from '../services/api';
import { normalizeNotification, normalizeNotifications, isNotificationUnread } from '../utils/notifications';
import { toast } from 'sonner';

const NotificationContext = createContext(undefined);

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    try {
      const [data, countData] = await Promise.all([
        notificationAPI.getAll(),
        notificationAPI.getUnreadCount(),
      ]);
      setNotifications(normalizeNotifications(data));
      setUnreadCount(Number(countData.count) || 0);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !user?.token) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    refreshNotifications();

    const socket = io('http://localhost:3000', {
      auth: { token: user.token },
      transports: ['websocket', 'polling'],
    });

    socket.on('notification', (notification) => {
      const normalized = normalizeNotification(notification);
      setNotifications((prev) => [normalized, ...prev]);
      setUnreadCount((prev) => prev + 1);
      toast.info(normalized.title, { description: normalized.content });
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, user?.token, refreshNotifications]);

  const markAsRead = async (id) => {
    const numericId = Number(id);
    const target = notifications.find(
      (n) => Number(n.notification_id) === numericId
    );

    if (!target || !isNotificationUnread(target)) {
      return;
    }

    await notificationAPI.markAsRead(numericId);
    setNotifications((prev) =>
      prev.map((n) =>
        Number(n.notification_id) === numericId ? { ...n, is_read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await notificationAPI.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
