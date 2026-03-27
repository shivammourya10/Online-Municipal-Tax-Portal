import mongoose from 'mongoose';

const taxRuleSchema = new mongoose.Schema({
  taxType: {
    type: String,
    enum: ['income_tax', 'gst', 'property_tax', 'corporate_tax'],
    required: true,
  },
  assessmentYear: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['individual', 'business', 'corporate', 'senior_citizen', 'super_senior_citizen'],
    required: true,
  },
  slabs: [{
    minIncome: {
      type: Number,
      required: true,
    },
    maxIncome: {
      type: Number,
      default: Infinity,
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    description: String,
  }],
  exemptions: [{
    section: String,
    description: String,
    maxLimit: Number,
    conditions: [String],
  }],
  deductions: [{
    section: String,
    description: String,
    maxLimit: Number,
    conditions: [String],
  }],
  surcharge: {
    applicable: {
      type: Boolean,
      default: false,
    },
    slabs: [{
      minIncome: Number,
      maxIncome: Number,
      rate: Number,
    }],
  },
  cess: {
    applicable: {
      type: Boolean,
      default: false,
    },
    rate: {
      type: Number,
      default: 4, // Health & Education Cess
    },
    description: String,
  },
  rebate: {
    section: String,
    maxIncome: Number,
    amount: Number,
    description: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  effectiveFrom: {
    type: Date,
    required: true,
  },
  effectiveTo: Date,
}, {
  timestamps: true,
});

// Indexes
taxRuleSchema.index({ taxType: 1, assessmentYear: 1, category: 1 });
taxRuleSchema.index({ isActive: 1 });
taxRuleSchema.index({ effectiveFrom: 1, effectiveTo: 1 });

const TaxRule = mongoose.model('TaxRule', taxRuleSchema);

export default TaxRule;
