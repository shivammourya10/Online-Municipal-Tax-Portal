import express from 'express';
import * as taxDefaulterController from '../controllers/taxDefaulterController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Citizen routes (limited access)
router.post('/:id/settlement/accept', authorize('taxpayer'), taxDefaulterController.acceptSettlement);

// Admin/Officer routes
router.post('/identify', authorize('admin'), taxDefaulterController.identifyDefaulters);
router.get('/', authorize('admin', 'tax_officer'), taxDefaulterController.getAllDefaulters);
router.get('/:id', authorize('admin', 'tax_officer'), taxDefaulterController.getDefaulter);
router.post('/:id/notice', authorize('admin', 'tax_officer'), taxDefaulterController.sendNotice);
router.post('/:id/action', authorize('admin', 'tax_officer'), taxDefaulterController.takeAction);
router.post('/:id/settlement', authorize('admin'), taxDefaulterController.offerSettlement);
router.post('/:id/legal', authorize('admin'), taxDefaulterController.initiateLegal);
router.put('/:id/resolve', authorize('admin'), taxDefaulterController.resolveDefaulter);
router.get('/statistics/summary', authorize('admin'), taxDefaulterController.getStatistics);

export default router;
