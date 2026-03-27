import * as paymentService from '../services/paymentService.js';
import { successResponse } from '../utils/response.js';

/**
 * @route   POST /api/payments/create-order
 * @desc    Create payment order
 * @access  Private
 */
export const createOrder = async (req, res, next) => {
  try {
    const paymentData = {
      ...req.body,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        description: req.body.description,
      },
    };
    
    const order = await paymentService.createPaymentOrder(req.user._id, paymentData);
    
    successResponse(res, 'Payment order created successfully', order, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/payments/verify/razorpay
 * @desc    Verify Razorpay payment
 * @access  Private
 */
export const verifyRazorpay = async (req, res, next) => {
  try {
    const transaction = await paymentService.verifyRazorpayPayment({
      ...req.body,
      userId: req.user._id,
    });
    
    successResponse(res, 'Payment verified successfully', transaction);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/payments/verify/stripe
 * @desc    Verify Stripe payment
 * @access  Private
 */
export const verifyStripe = async (req, res, next) => {
  try {
    const { paymentIntentId, sessionId } = req.body;
    
    console.log('Verify Stripe called with:', { paymentIntentId, sessionId, userId: req.user._id });
    
    // If sessionId is provided, verify checkout session
    if (sessionId) {
      console.log('Verifying Stripe Checkout Session:', sessionId);
      const transaction = await paymentService.verifyStripeCheckoutSession(sessionId, req.user._id);
      console.log('Session verification successful:', transaction._id);
      successResponse(res, 'Payment verified successfully', transaction);
    } else if (paymentIntentId) {
      // Fallback to payment intent verification
      console.log('Verifying Stripe Payment Intent:', paymentIntentId);
      const transaction = await paymentService.verifyStripePayment(paymentIntentId, req.user._id);
      console.log('Payment intent verification successful:', transaction._id);
      successResponse(res, 'Payment verified successfully', transaction);
    } else {
      throw new Error('Either sessionId or paymentIntentId is required');
    }
  } catch (error) {
    console.error('Stripe verification error:', error);
    console.error('Error stack:', error.stack);
    next(error);
  }
};

/**
 * @route   POST /api/payments/failure
 * @desc    Handle payment failure
 * @access  Private
 */
export const handleFailure = async (req, res, next) => {
  try {
    const { orderId, reason } = req.body;
    
    const transaction = await paymentService.handlePaymentFailure(orderId, reason, req.user._id);
    
    successResponse(res, 'Payment failure recorded', transaction);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/payments
 * @desc    Get user transactions
 * @access  Private
 */
export const getTransactions = async (req, res, next) => {
  try {
    const result = await paymentService.getUserTransactions(req.user._id, req.query);
    
    successResponse(res, 'Transactions retrieved successfully', result.transactions);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/payments/:id
 * @desc    Get transaction by ID
 * @access  Private
 */
export const getTransaction = async (req, res, next) => {
  try {
    const transaction = await paymentService.getTransactionById(req.params.id, req.user._id);
    
    successResponse(res, 'Transaction retrieved successfully', transaction);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/payments/:id/refund
 * @desc    Create refund
 * @access  Private
 */
export const createRefund = async (req, res, next) => {
  try {
    const transaction = await paymentService.createRefund(
      req.params.id,
      req.user._id,
      req.body
    );
    
    successResponse(res, 'Refund processed successfully', transaction);
  } catch (error) {
    next(error);
  }
};
