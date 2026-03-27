import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  transactionId: {
    type: String,
    unique: true,
  },
  orderId: {
    type: String,
    required: true,
  },
  paymentGateway: {
    type: String,
    enum: ['razorpay', 'stripe'],
    required: true,
  },
  type: {
    type: String,
    enum: ['income_tax', 'gst', 'property_tax', 'corporate_tax', 'penalty', 'interest', 'advance_tax', 'tax_payment', 'other'],
    required: true,
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
  },
  taxDetails: {
    assessmentYear: String,
    quarter: String,
    taxType: String,
    challanNumber: String,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'success', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'netbanking', 'upi', 'wallet'],
  },
  gatewayResponse: {
    razorpayPaymentId: String,
    razorpayOrderId: String,
    razorpaySignature: String,
    stripePaymentIntentId: String,
    stripeChargeId: String,
  },
  receipt: {
    url: String,
    publicId: String,
    generatedAt: Date,
  },
  installment: {
    isInstallment: {
      type: Boolean,
      default: false,
    },
    currentInstallment: Number,
    totalInstallments: Number,
    installmentAmount: Number,
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    description: String,
    calculationId: String,
    propertyId: String,
  },
  refundDetails: {
    refundId: String,
    refundAmount: Number,
    refundDate: Date,
    reason: String,
  },
  failureReason: String,
  paidAt: Date,
  failedAt: Date,
}, {
  timestamps: true,
});

// Indexes
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ orderId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ 'taxDetails.assessmentYear': 1 });

// Generate unique transaction ID
transactionSchema.pre('save', async function(next) {
  if (!this.transactionId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    this.transactionId = `TXN${timestamp}${random}`.toUpperCase();
  }
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
