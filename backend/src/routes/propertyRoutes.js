import express from 'express';
import * as propertyController from '../controllers/propertyController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// User property routes
router.post('/', auditLog('property_add', 'property'), propertyController.addProperty);
router.get('/', propertyController.getUserProperties);
router.get('/:id', propertyController.getProperty);
router.put('/:id', auditLog('property_update', 'property'), propertyController.updateProperty);
router.delete('/:id', auditLog('property_delete', 'property'), propertyController.deleteProperty);
router.get('/:id/calculate-tax', propertyController.calculateTax);

// Admin routes
router.get('/admin/all', authorize('admin', 'tax_officer'), propertyController.getAllProperties);
router.get('/admin/statistics', authorize('admin', 'tax_officer'), propertyController.getStatistics);
router.put('/:id/verify', authorize('admin', 'tax_officer'), auditLog('property_verify', 'property'), propertyController.verifyProperty);

export default router;
