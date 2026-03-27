import express from 'express';
import * as municipalBillController from '../controllers/municipalBillController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Citizen routes
router.get('/my-bills', authorize('taxpayer'), municipalBillController.getMyBills);
router.get('/:id', municipalBillController.getBill);
router.post('/:id/pay', authorize('taxpayer'), municipalBillController.payBill);

// Admin routes
router.get('/', authorize('admin', 'tax_officer'), municipalBillController.getAllBills);
router.post('/generate', authorize('admin'), municipalBillController.generateBill);
router.post('/generate-bulk', authorize('admin'), municipalBillController.generateBulkBills);
router.get('/statistics/summary', authorize('admin'), municipalBillController.getStatistics);

export default router;
