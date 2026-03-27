import express from 'express';
import * as taxProfileController from '../controllers/taxProfileController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Tax profile routes
router.post('/', auditLog('profile_update', 'tax_profile'), taxProfileController.createOrUpdateProfile);
router.get('/', taxProfileController.getProfile);

// Income sources
router.post('/income-sources', taxProfileController.addIncomeSource);
router.put('/income-sources/:sourceId', taxProfileController.updateIncomeSource);
router.delete('/income-sources/:sourceId', taxProfileController.deleteIncomeSource);

// Investments
router.post('/investments', taxProfileController.addInvestment);

// Verification
router.post('/verify-pan', taxProfileController.verifyPAN);

// Compliance (Admin only)
router.put('/compliance/:userId?', authorize('admin', 'tax_officer'), taxProfileController.updateCompliance);

export default router;
