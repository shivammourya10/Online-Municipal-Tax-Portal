import Notification from '../models/Notification.js';
import logger from '../utils/logger.js';

/**
 * Create notification
 */
export const createNotification = async (notificationData) => {
  const notification = await Notification.create(notificationData);
  // Email/SMS delivery disabled
  return notification;
};

/**
 * Send notification email
 */
const sendNotificationEmail = async () => {
  logger.info('[notification email disabled]');
};

/**
 * Send notification SMS (mocked)
 */
const sendNotificationSMS = async () => {
  logger.info('[notification sms disabled]');
};

/**
 * Get user notifications
 */
export const getUserNotifications = async (userId, filters = {}) => {
  const query = { user: userId };
  
  if (filters.isRead !== undefined) query.isRead = filters.isRead === 'true';
  if (filters.type) query.type = filters.type;
  
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;
  
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });
  
  return {
    notifications,
    unreadCount,
    pagination: { page, limit, total },
  };
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    user: userId,
  });
  
  if (!notification) {
    throw new Error('Notification not found');
  }
  
  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();
  
  return notification;
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  
  return true;
};

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    user: userId,
  });
  
  if (!notification) {
    throw new Error('Notification not found');
  }
  
  await notification.deleteOne();
  
  return true;
};

/**
 * Send bulk notifications
 */
export const sendBulkNotifications = async (userIds, notificationData) => {
  const notifications = userIds.map(userId => ({
    user: userId,
    ...notificationData,
  }));
  
  const created = await Notification.insertMany(notifications);
  
  return created;
};
