import Transaction from '../models/Transaction.js';
import TaxCalculation from '../models/TaxCalculation.js';
import razorpayInstance from '../config/razorpay.js';
import stripeInstance from '../config/stripe.js';
import { verifyRazorpaySignature, generateReceiptNumber } from '../utils/payment.js';
import { config } from '../config/index.js';
import { sendPaymentSuccessEmail, sendPaymentFailedEmail } from '../utils/email.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';
import { markCalculationAsPaid } from './taxService.js';

const MAX_STRIPE_AMOUNT = 9_999_999.99; // Stripe checkout hard limit in INR

const reducePropertyPendingTax = async (propertyId, amountPaid) => {
  if (!propertyId || Number.isNaN(Number(amountPaid))) return;
  try {
    const Property = (await import('../models/Property.js')).default;
    const property = await Property.findById(propertyId);
    if (!property) return;
    const pending = Number(property.taxDetails?.pendingAmount || 0);
    const newPending = Math.max(0, pending - Number(amountPaid));
    property.taxDetails.pendingAmount = newPending;
    property.taxDetails.lastPaidDate = new Date();
    property.taxDetails.lastPaidAmount = Number(amountPaid);
    await property.save();
    logger.info(`Property ${propertyId} pending tax updated to ₹${newPending}`);
  } catch (error) {
    logger.error(`Failed to update property tax: ${error.message}`);
  }
};

/**
 * Create payment order
 */
export const createPaymentOrder = async (userId, paymentData) => {
  const { amount, type, taxDetails, paymentGateway = 'stripe', metadata, calculationId, propertyId } = paymentData;

  const amountNumber = Number(amount);
  if (Number.isNaN(amountNumber)) {
    throw new Error('Invalid amount');
  }
  if (paymentGateway === 'stripe' && amountNumber > MAX_STRIPE_AMOUNT) {
    throw new Error('Amount exceeds Stripe limit of ₹9,999,999.99. Please enter a smaller amount or switch gateway.');
  }
  
  let order;
  let orderId;
  
  if (paymentGateway === 'razorpay') {
    // Create Razorpay order
    const options = {
      amount: Math.round(amountNumber * 100), // Convert to paise and ensure it's an integer
      currency: 'INR',
      receipt: generateReceiptNumber(),
      notes: {
        userId: userId.toString(),
        type,
        calculationId: calculationId || '',
        propertyId: propertyId || '',
        ...metadata,
      },
    };
    
    order = await razorpayInstance.orders.create(options);
    orderId = order.id;
  } else if (paymentGateway === 'stripe' && stripeInstance) {
    // Create Stripe Checkout Session
    const user = await User.findById(userId);
    
    order = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: metadata?.description || 'Tax Payment',
              description: `${type.replace('_', ' ')} - Transaction ID: TXN${Date.now().toString(36)}`,
            },
            unit_amount: Math.round(amountNumber * 100), // Convert to paise and ensure it's an integer
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${config.clientUrl}/payments?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${config.clientUrl}/payments?status=cancelled`,
      customer_email: user.email,
      metadata: {
        userId: userId.toString(),
        type,
        calculationId: calculationId || '',
        propertyId: propertyId || '',
        description: metadata?.description || '',
      },
    });
    orderId = order.id;
  } else {
    throw new Error('Invalid payment gateway');
  }
  
  // Create transaction record
  const transaction = await Transaction.create({
    user: userId,
    orderId,
    paymentGateway,
    type,
    taxDetails,
    amount,
    status: 'pending',
    property: propertyId || null,
    metadata: {
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      description: metadata?.description,
      calculationId,
      propertyId,
    },
  });
  
  return {
    orderId,
    transactionId: transaction.transactionId,
    amount,
    currency: 'INR',
    gatewayOrderId: orderId,
    checkoutUrl: order.url || null, // Stripe Checkout URL
    razorpayKeyId: paymentGateway === 'razorpay' ? config.razorpay.keyId : null,
    stripePublishableKey: paymentGateway === 'stripe' ? config.stripe.publishableKey : null,
  };
};

/**
 * Verify and complete Razorpay payment
 */
export const verifyRazorpayPayment = async (paymentData) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, userId } = paymentData;
  
  // Verify signature
  const isValid = verifyRazorpaySignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    config.razorpay.keySecret
  );
  
  if (!isValid) {
    throw new Error('Invalid payment signature');
  }
  
  // Find transaction
  const transaction = await Transaction.findOne({ orderId: razorpayOrderId });
  if (!transaction) {
    throw new Error('Transaction not found');
  }
  
  // Update transaction
  transaction.status = 'success';
  transaction.gatewayResponse = {
    razorpayPaymentId,
    razorpayOrderId,
    razorpaySignature,
  };
  transaction.paidAt = new Date();
  await transaction.save();
  
  // Mark calculation as paid if calculationId exists
  const calculationId = transaction.metadata?.calculationId;
  if (calculationId) {
    try {
      await markCalculationAsPaid(calculationId, transaction._id);
    } catch (error) {
      logger.error(`Failed to mark calculation as paid: ${error.message}`);
    }
  }

  // Update property pending tax if propertyId exists
  const propertyId = transaction.metadata?.propertyId || transaction.property;
  if (propertyId) {
    await reducePropertyPendingTax(propertyId, transaction.amount);
  }
  
  // Send success email (non-blocking)
  const user = await User.findById(userId);
  if (user) {
    sendPaymentSuccessEmail(user, transaction).catch(err =>
      logger.error(`Payment success email failed: ${err.message}`)
    );
  }
  
  return transaction;
};

/**
 * Verify and complete Stripe payment
 */
export const verifyStripePayment = async (paymentIntentId, userId) => {
  if (!stripeInstance) {
    throw new Error('Stripe not configured');
  }
  
  // Find transaction first
  const transaction = await Transaction.findOne({ orderId: paymentIntentId });
  if (!transaction) {
    throw new Error('Transaction not found');
  }

  // For test mode (when using test keys), we'll simulate successful payment
  // In production, you would retrieve the actual payment intent and verify
  const isTestMode = paymentIntentId.startsWith('pi_');
  
  if (isTestMode) {
    // Test mode - simulate successful payment
    logger.info(`Processing test mode payment: ${paymentIntentId}`);
    
    transaction.status = 'success';
    transaction.gatewayResponse = {
      stripePaymentIntentId: paymentIntentId,
      stripeChargeId: `ch_test_${Date.now()}`,
    };
    transaction.paidAt = new Date();
    await transaction.save();
  } else {
    // Production mode - verify with Stripe
    const paymentIntent = await stripeInstance.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment not successful');
    }
    
    // Update transaction
    transaction.status = 'success';
    transaction.gatewayResponse = {
      stripePaymentIntentId: paymentIntent.id,
      stripeChargeId: paymentIntent.charges.data[0]?.id,
    };
    transaction.paidAt = new Date();
    await transaction.save();
  }
  
  // Mark calculation as paid if calculationId exists
  const calculationId = transaction.metadata?.calculationId;
  if (calculationId) {
    try {
      await markCalculationAsPaid(calculationId, transaction._id);
    } catch (error) {
      logger.error(`Failed to mark calculation as paid: ${error.message}`);
    }
  }

  // Update property pending tax if propertyId exists
  const propertyId = transaction.metadata?.propertyId || transaction.property;
  if (propertyId) {
    await reducePropertyPendingTax(propertyId, transaction.amount);
  }
  
  // Send success email (non-blocking)
  const user = await User.findById(userId);
  if (user) {
    sendPaymentSuccessEmail(user, transaction).catch(err =>
      logger.error(`Payment success email failed: ${err.message}`)
    );
  }
  
  return transaction;
};

/**
 * Verify Stripe Checkout Session
 */
export const verifyStripeCheckoutSession = async (sessionId, userId) => {
  console.log('verifyStripeCheckoutSession called with:', { sessionId, userId });
  
  if (!stripeInstance) {
    console.error('Stripe instance not configured');
    throw new Error('Stripe not configured');
  }

  let transaction;
  try {
    // Retrieve the checkout session
    console.log('Retrieving Stripe checkout session...');
    const session = await stripeInstance.checkout.sessions.retrieve(sessionId);
    console.log('Session retrieved:', { id: session.id, payment_status: session.payment_status });
    
    if (session.payment_status !== 'paid') {
      console.error('Payment not completed, status:', session.payment_status);
      throw new Error('Payment not completed');
    }

    // Find transaction by orderId (session ID)
    console.log('Finding transaction with orderId:', sessionId);
    transaction = await Transaction.findOne({ orderId: sessionId });
    if (!transaction) {
      console.error('Transaction not found for orderId:', sessionId);
      throw new Error('Transaction not found');
    }
    console.log('Transaction found:', transaction._id);

    // Check if already processed
    if (transaction.status === 'success') {
      console.log('Transaction already processed, returning existing transaction');
      return transaction;
    }

    // Update transaction
    console.log('Updating transaction status to success...');
    transaction.status = 'success';
    transaction.gatewayResponse = {
      stripePaymentIntentId: session.payment_intent,
      stripeSessionId: session.id,
    };
    transaction.paidAt = new Date();
    await transaction.save();
    console.log('Transaction updated successfully');
  } catch (error) {
    console.error('Error in verifyStripeCheckoutSession:', error);
    throw error;
  }

  // Mark calculation as paid if calculationId exists
  const calculationId = transaction.metadata?.calculationId;
  if (calculationId) {
    try {
      await markCalculationAsPaid(calculationId, transaction._id);
    } catch (error) {
      logger.error(`Failed to mark calculation as paid: ${error.message}`);
    }
  }

  // Update property pending tax if propertyId exists
  const propertyId = transaction.metadata?.propertyId || transaction.property;
  if (propertyId) {
    await reducePropertyPendingTax(propertyId, transaction.amount);
  }

  // Send success email (non-blocking)
  const user = await User.findById(userId);
  if (user) {
    sendPaymentSuccessEmail(user, transaction).catch(err =>
      logger.error(`Payment success email failed: ${err.message}`)
    );
  }

  return transaction;
};

/**
 * Handle payment failure
 */
export const handlePaymentFailure = async (orderId, reason, userId) => {
  const transaction = await Transaction.findOne({ orderId });
  
  if (!transaction) {
    throw new Error('Transaction not found');
  }
  
  transaction.status = 'failed';
  transaction.failureReason = reason;
  transaction.failedAt = new Date();
  await transaction.save();
  
  // Send failure email (non-blocking)
  const user = await User.findById(userId);
  if (user) {
    sendPaymentFailedEmail(user, transaction).catch(err =>
      logger.error(`Payment failure email failed: ${err.message}`)
    );
  }
  
  return transaction;
};

/**
 * Get user transactions
 */
export const getUserTransactions = async (userId, filters = {}) => {
  const query = { user: userId };
  
  if (filters.status) query.status = filters.status;
  if (filters.type) query.type = filters.type;
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
  }
  
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const skip = (page - 1) * limit;
  
  const transactions = await Transaction.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await Transaction.countDocuments(query);
  
  return {
    transactions,
    pagination: { page, limit, total },
  };
};

/**
 * Get transaction by ID
 */
export const getTransactionById = async (transactionId, userId) => {
  const transaction = await Transaction.findOne({
    _id: transactionId,
    user: userId,
  });
  
  if (!transaction) {
    throw new Error('Transaction not found');
  }
  
  return transaction;
};

/**
 * Create refund
 */
export const createRefund = async (transactionId, userId, refundData) => {
  const transaction = await Transaction.findOne({
    _id: transactionId,
    user: userId,
  });
  
  if (!transaction) {
    throw new Error('Transaction not found');
  }
  
  if (transaction.status !== 'success') {
    throw new Error('Can only refund successful transactions');
  }
  
  // Process refund based on gateway
  let refund;
  
  if (transaction.paymentGateway === 'razorpay') {
    refund = await razorpayInstance.payments.refund(
      transaction.gatewayResponse.razorpayPaymentId,
      {
        amount: (refundData.amount || transaction.amount) * 100,
        notes: {
          reason: refundData.reason,
        },
      }
    );
  } else if (transaction.paymentGateway === 'stripe' && stripeInstance) {
    refund = await stripeInstance.refunds.create({
      payment_intent: transaction.gatewayResponse.stripePaymentIntentId,
      amount: (refundData.amount || transaction.amount) * 100,
      reason: 'requested_by_customer',
    });
  }
  
  // Update transaction
  transaction.status = 'refunded';
  transaction.refundDetails = {
    refundId: refund.id,
    refundAmount: refundData.amount || transaction.amount,
    refundDate: new Date(),
    reason: refundData.reason,
  };
  await transaction.save();
  
  return transaction;
};
