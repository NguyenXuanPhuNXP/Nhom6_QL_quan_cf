export const isNotificationUnread = (notification) =>
  !notification?.is_read || notification.is_read === 0;

export const normalizeNotification = (notification) => ({
  ...notification,
  is_read: Boolean(notification.is_read),
});

export const normalizeNotifications = (notifications = []) =>
  notifications.map(normalizeNotification);
