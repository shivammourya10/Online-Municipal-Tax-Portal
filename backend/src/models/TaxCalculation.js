import mongoose from 'mongoose';

const TaxCalculationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
  },
  type: {
    type: String,
    enum: ['income_tax', 'gst', 'property_tax', 'corporate_tax'],
    required: true,
  },
  calculationData: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  result: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  assessmentYear: {
    type: String,
  },
  status: {
    type: String,
    enum: ['calculated', 'paid', 'pending'],
    default: 'calculated',
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
  },
}, {
  timestamps: true,
});

// Indexes
TaxCalculationSchema.index({ user: 1, createdAt: -1 });
TaxCalculationSchema.index({ type: 1 });
TaxCalculationSchema.index({ status: 1 });

const TaxCalculation = mongoose.model('TaxCalculation', TaxCalculationSchema);

export default TaxCalculation;
