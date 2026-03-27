import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Taxpayer dashboard
router.get('/taxpayer', dashboardController.getTaxpayerDashboard);

// Admin routes
router.get('/admin', authorize('admin'), dashboardController.getAdminDashboard);
router.get('/admin/stats', authorize('admin'), dashboardController.getAdminDashboard);
router.get('/admin/users', authorize('admin'), dashboardController.getUserManagement);
router.get('/admin/transactions', authorize('admin'), dashboardController.getAdminTransactions);
router.patch('/admin/users/:id/status', authorize('admin'), dashboardController.updateUserStatus);
router.get('/analytics', authorize('admin'), dashboardController.getAnalytics);

export default router;
