import * as notificationService from '../services/notificationService.js';
import { successResponse } from '../utils/response.js';

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications
 * @access  Private
 */
export const getNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.getUserNotifications(req.user._id, req.query);
    
    successResponse(res, 'Notifications retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user._id);
    
    successResponse(res, 'Notification marked as read', notification);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user._id);
    
    successResponse(res, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
export const deleteNotification = async (req, res, next) => {
  try {
    await notificationService.deleteNotification(req.params.id, req.user._id);
    
    successResponse(res, 'Notification deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/notifications/bulk
 * @desc    Send bulk notifications
 * @access  Admin
 */
export const sendBulkNotifications = async (req, res, next) => {
  try {
    const { userIds, ...notificationData } = req.body;
    
    const notifications = await notificationService.sendBulkNotifications(userIds, notificationData);
    
    successResponse(res, 'Bulk notifications sent successfully', notifications, 201);
  } catch (error) {
    next(error);
  }
};
