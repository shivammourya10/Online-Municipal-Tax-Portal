import * as dashboardService from '../services/dashboardService.js';
import { successResponse } from '../utils/response.js';

/**
 * @route   GET /api/dashboard/admin
 * @desc    Get admin dashboard
 * @access  Admin
 */
export const getAdminDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getAdminDashboard();
    
    // Transform data to match frontend expectations
    const stats = {
      totalUsers: data.users.total,
      totalRevenue: data.revenue.total,
      totalTransactions: data.transactions.successful + data.transactions.failed + data.transactions.pending,
      pendingPayments: data.transactions.pending,
    };
    
    successResponse(res, 'Admin dashboard data retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/dashboard/taxpayer
 * @desc    Get taxpayer dashboard
 * @access  Private
 */
export const getTaxpayerDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getTaxpayerDashboard(req.user._id);
    
    successResponse(res, 'Taxpayer dashboard data retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/dashboard/analytics
 * @desc    Get analytics data
 * @access  Admin
 */
export const getAnalytics = async (req, res, next) => {
  try {
    const data = await dashboardService.getAnalytics(req.query);
    
    successResponse(res, 'Analytics data retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/dashboard/admin/users
 * @desc    Get user management data
 * @access  Admin
 */
export const getUserManagement = async (req, res, next) => {
  try {
    const result = await dashboardService.getUserManagement(req.query);
    
    successResponse(res, 'User management data retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/dashboard/admin/transactions
 * @desc    Get admin transactions
 * @access  Admin
 */
export const getAdminTransactions = async (req, res, next) => {
  try {
    const result = await dashboardService.getAdminTransactions(req.query);
    
    successResponse(res, 'Transactions retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/dashboard/admin/users/:id/status
 * @desc    Update user status
 * @access  Admin
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    
    const user = await dashboardService.updateUserStatus(req.params.id, isActive);
    
    successResponse(res, 'User status updated successfully', user);
  } catch (error) {
    next(error);
  }
};
