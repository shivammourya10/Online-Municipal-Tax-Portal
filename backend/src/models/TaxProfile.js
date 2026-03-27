import mongoose from 'mongoose';

const taxProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  taxpayerType: {
    type: String,
    enum: ['individual', 'business', 'corporate'],
    required: true,
  },
  pan: {
    number: {
      type: String,
      required: [true, 'PAN number is required'],
      unique: true,
      uppercase: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: Date,
  },
  aadhaar: {
    number: {
      type: String,
      match: [/^[0-9]{12}$/, 'Invalid Aadhaar number'],
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  gstin: {
    number: {
      type: String,
      uppercase: true,
      match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format'],
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  businessDetails: {
    name: String,
    type: {
      type: String,
      enum: ['proprietorship', 'partnership', 'llp', 'private_limited', 'public_limited', 'other'],
    },
    registrationNumber: String,
    registrationDate: Date,
    industry: String,
    annualTurnover: Number,
  },
  incomeSources: [{
    type: {
      type: String,
      enum: ['salary', 'business', 'capital_gains', 'house_property', 'other_sources'],
      required: true,
    },
    description: String,
    estimatedAnnualIncome: {
      type: Number,
      default: 0,
    },
    documents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    }],
  }],
  taxSavingInvestments: [{
    scheme: {
      type: String,
      enum: ['80C', '80D', '80G', '80E', '80CCD', 'other'],
    },
    amount: Number,
    year: String,
    documents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    }],
  }],
  previousYearReturns: [{
    year: String,
    itrType: String,
    filedDate: Date,
    totalIncome: Number,
    taxPaid: Number,
    refund: Number,
    status: {
      type: String,
      enum: ['filed', 'verified', 'processed', 'refund_issued'],
    },
  }],
  compliance: {
    lastFiledYear: String,
    pendingReturns: [String],
    isCompliant: {
      type: Boolean,
      default: true,
    },
    nonComplianceReasons: [String],
  },
}, {
  timestamps: true,
});

// Indexes
taxProfileSchema.index({ user: 1 });
taxProfileSchema.index({ 'pan.number': 1 });
taxProfileSchema.index({ 'gstin.number': 1 });
taxProfileSchema.index({ taxpayerType: 1 });

const TaxProfile = mongoose.model('TaxProfile', taxProfileSchema);

export default TaxProfile;
