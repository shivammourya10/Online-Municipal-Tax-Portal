import express from 'express';
import * as buildingPlanController from '../controllers/buildingPlanController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Citizen routes
router.post('/submit', authorize('taxpayer'), buildingPlanController.submitPlan);
router.get('/my-plans', authorize('taxpayer'), buildingPlanController.getMyPlans);
router.get('/:id', buildingPlanController.getPlan);
router.post('/:id/clarifications/:clarificationId/response', authorize('taxpayer'), buildingPlanController.submitClarification);

// Admin/Officer routes
router.get('/', authorize('admin', 'tax_officer'), buildingPlanController.getAllPlans);
router.put('/:id/workflow', authorize('admin', 'tax_officer'), buildingPlanController.updateWorkflow);
router.post('/:id/inspection/schedule', authorize('admin', 'tax_officer'), buildingPlanController.scheduleInspection);
router.post('/:id/inspection/submit', authorize('admin', 'tax_officer'), buildingPlanController.submitInspection);
router.put('/:id/approve', authorize('admin'), buildingPlanController.approvePlan);
router.put('/:id/reject', authorize('admin'), buildingPlanController.rejectPlan);
router.post('/:id/clarification', authorize('admin', 'tax_officer'), buildingPlanController.requestClarification);

export default router;
