import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'form16',
      'form16a',
      'pan_card',
      'aadhaar_card',
      'bank_statement',
      'investment_proof',
      'expense_receipt',
      'property_document',
      'business_registration',
      'gst_certificate',
      'itr',
      'other'
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  file: {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    format: String,
    size: Number,
  },
  metadata: {
    assessmentYear: String,
    quarter: String,
    amount: Number,
    issuer: String,
    issueDate: Date,
    expiryDate: Date,
  },
  verification: {
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: Date,
    rejectionReason: String,
  },
  ocrData: {
    extracted: {
      type: Boolean,
      default: false,
    },
    data: mongoose.Schema.Types.Mixed,
    confidence: Number,
  },
  tags: [String],
  isArchived: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes
documentSchema.index({ user: 1, createdAt: -1 });
documentSchema.index({ type: 1 });
documentSchema.index({ 'verification.status': 1 });
documentSchema.index({ 'metadata.assessmentYear': 1 });
documentSchema.index({ tags: 1 });

const Document = mongoose.model('Document', documentSchema);

export default Document;
