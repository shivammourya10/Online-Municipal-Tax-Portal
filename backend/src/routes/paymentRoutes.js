import express from 'express';
import { body } from 'express-validator';
import * as paymentController from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { paymentLimiter } from '../middleware/rateLimiter.js';
import { auditLog } from '../middleware/audit.js';

const router = express.Router();

// Validation rules
const createOrderValidation = [
  body('amount')
    .isFloat({ gt: 0, lt: 10000000 })
    .withMessage('Amount must be a number greater than 0 and below 10,000,000'),
  body('type').isIn(['income_tax', 'gst', 'property_tax', 'corporate_tax', 'penalty', 'interest', 'other']).withMessage('Invalid payment type'),
  body('paymentGateway').optional().isIn(['razorpay', 'stripe']).withMessage('Invalid payment gateway'),
];

const verifyRazorpayValidation = [
  body('razorpayOrderId').notEmpty().withMessage('Razorpay order ID is required'),
  body('razorpayPaymentId').notEmpty().withMessage('Razorpay payment ID is required'),
  body('razorpaySignature').notEmpty().withMessage('Razorpay signature is required'),
];

const verifyStripeValidation = [
  body('paymentIntentId').optional().isString(),
  body('sessionId').optional().isString(),
  body().custom((value) => {
    if (!value.paymentIntentId && !value.sessionId) {
      throw new Error('Either sessionId or paymentIntentId is required');
    }
    return true;
  })
];

const failureValidation = [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('reason').notEmpty().withMessage('Failure reason is required'),
];

// All routes require authentication
router.use(protect);

// Payment routes
router.post('/create-order', paymentLimiter, createOrderValidation, validate, auditLog('payment_initiated', 'transaction'), paymentController.createOrder);
router.post('/verify/razorpay', verifyRazorpayValidation, validate, auditLog('payment_completed', 'transaction'), paymentController.verifyRazorpay);
router.post('/verify/stripe', verifyStripeValidation, validate, auditLog('payment_completed', 'transaction'), paymentController.verifyStripe);
router.post('/failure', failureValidation, validate, auditLog('payment_failed', 'transaction'), paymentController.handleFailure);

// Transaction routes
router.get('/', paymentController.getTransactions);
router.get('/:id', paymentController.getTransaction);
router.post('/:id/refund', paymentController.createRefund);

export default router;
