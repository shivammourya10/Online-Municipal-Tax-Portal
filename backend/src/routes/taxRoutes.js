import express from 'express';
import { body } from 'express-validator';
import * as taxController from '../controllers/taxController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { auditLog } from '../middleware/audit.js';

const router = express.Router();

// Validation rules
const incomeTaxValidation = [
  body('grossIncome').isNumeric().withMessage('Gross income must be a number'),
  body('deductions').isNumeric().withMessage('Deductions must be a number'),
  body('category').isIn(['individual', 'business', 'corporate', 'senior_citizen', 'super_senior_citizen']).withMessage('Invalid category'),
  body('assessmentYear').notEmpty().withMessage('Assessment year is required'),
];

const gstValidation = [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('gstRate').optional().isNumeric().withMessage('GST rate must be a number'),
];

const propertyTaxValidation = [
  body('propertyValue').isNumeric().withMessage('Property value must be a number'),
  body('taxRate').optional().isNumeric().withMessage('Tax rate must be a number'),
  body('location').optional().isIn(['urban', 'rural']).withMessage('Location must be urban or rural'),
];

const corporateTaxValidation = [
  body('turnover').isNumeric().withMessage('Turnover must be a number'),
  body('netProfit').isNumeric().withMessage('Net profit must be a number'),
  body('taxRate').optional().isNumeric().withMessage('Tax rate must be a number'),
];

// All routes require authentication
router.use(protect);

// Tax calculation routes
router.post('/calculate/income', incomeTaxValidation, validate, auditLog('tax_calculation', 'other'), taxController.calculateIncomeTax);
router.post('/calculate/gst', gstValidation, validate, auditLog('tax_calculation', 'other'), taxController.calculateGST);
router.post('/calculate/property', propertyTaxValidation, validate, auditLog('tax_calculation', 'other'), taxController.calculatePropertyTax);
router.post('/calculate/corporate', corporateTaxValidation, validate, auditLog('tax_calculation', 'other'), taxController.calculateCorporateTax);

// Tax calculation history routes
router.get('/calculations', taxController.getTaxCalculations);
router.get('/calculations/:id', taxController.getTaxCalculationById);

// Tax rules routes
router.get('/rules', taxController.getTaxRules);

// Admin only routes
router.post('/rules', authorize('admin'), taxController.createTaxRule);
router.delete('/rules/:id', authorize('admin'), taxController.deactivateTaxRule);

export default router;
