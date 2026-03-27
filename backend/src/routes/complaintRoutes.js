import express from 'express';
import * as complaintController from '../controllers/complaintController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Citizen routes
router.post('/', authorize('taxpayer'), complaintController.createComplaint);
router.get('/my-complaints', authorize('taxpayer'), complaintController.getMyComplaints);
router.get('/:id', complaintController.getComplaint);
router.post('/:id/feedback', authorize('taxpayer'), complaintController.submitFeedback);

// Admin/Officer routes
router.get('/', authorize('admin', 'tax_officer'), complaintController.getAllComplaints);
router.put('/:id/assign', authorize('admin', 'tax_officer'), complaintController.assignComplaint);
router.put('/:id/status', authorize('admin', 'tax_officer'), complaintController.updateStatus);
router.put('/:id/escalate', authorize('admin', 'tax_officer'), complaintController.escalateComplaint);
router.get('/statistics/summary', authorize('admin'), complaintController.getStatistics);

export default router;
