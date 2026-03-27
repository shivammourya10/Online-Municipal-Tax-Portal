import express from 'express';
import * as waterConnectionController from '../controllers/waterConnectionController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Citizen routes
router.post('/apply', authorize('taxpayer'), waterConnectionController.applyForConnection);
router.get('/my-connections', authorize('taxpayer'), waterConnectionController.getMyConnections);
router.get('/:id', waterConnectionController.getConnection);
router.get('/:id/bills/:billId', waterConnectionController.getBill);
router.post('/:id/bills/:billId/pay', authorize('taxpayer'), waterConnectionController.payBill);

// Admin/Officer routes
router.get('/', authorize('admin', 'tax_officer'), waterConnectionController.getAllConnections);
router.put('/:id/approve', authorize('admin', 'tax_officer'), waterConnectionController.approveConnection);
router.post('/:id/reading', authorize('admin', 'tax_officer'), waterConnectionController.addReading);
router.put('/:id/disconnect', authorize('admin', 'tax_officer'), waterConnectionController.disconnectConnection);

export default router;
