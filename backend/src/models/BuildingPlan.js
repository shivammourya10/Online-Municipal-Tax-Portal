import mongoose from 'mongoose';

const buildingPlanSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
  },
  applicationNumber: {
    type: String,
    unique: true,
    required: true,
  },
  applicationType: {
    type: String,
    enum: ['new_construction', 'addition', 'renovation', 'demolition', 'change_of_use'],
    required: true,
  },
  applicantDetails: {
    name: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    email: String,
    address: String,
  },
  siteDetails: {
    plotNumber: String,
    surveyNumber: String,
    khataNumber: String,
    address: {
      street: String,
      area: String,
      city: String,
      pincode: String,
    },
    ward: String,
    zone: String,
    plotArea: {
      type: Number, // in sq ft
      required: true,
    },
  },
  planDetails: {
    proposedBuiltupArea: {
      type: Number, // in sq ft
      required: true,
    },
    numberOfFloors: {
      type: Number,
      default: 1,
    },
    buildingHeight: Number, // in feet
    setbacks: {
      front: Number,
      rear: Number,
      left: Number,
      right: Number,
    },
    fsi: Number, // Floor Space Index
    coverage: Number, // Percentage
    parkingSpaces: Number,
    proposedUse: {
      type: String,
      enum: ['residential', 'commercial', 'industrial', 'mixed', 'institutional'],
      required: true,
    },
  },
  documents: [{
    type: {
      type: String,
      enum: [
        'site_plan',
        'floor_plan',
        'elevation',
        'structural_drawing',
        'noc_fire',
        'noc_environmental',
        'ownership_proof',
        'survey_map',
        'soil_test_report',
        'other'
      ],
      required: true,
    },
    title: String,
    fileUrl: String,
    publicId: String,
    fileName: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  fees: {
    scrutinyFee: {
      type: Number,
      default: 0,
    },
    sanctionFee: {
      type: Number,
      default: 0,
    },
    developmentCharges: {
      type: Number,
      default: 0,
    },
    bettermentCharges: Number,
    impactFee: Number,
    otherCharges: Number,
    totalFees: {
      type: Number,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid'],
      default: 'pending',
    },
  },
  workflow: [{
    stage: {
      type: String,
      enum: [
        'submitted',
        'document_verification',
        'technical_scrutiny',
        'site_inspection',
        'committee_review',
        'approved',
        'rejected',
        'clarification_required'
      ],
      required: true,
    },
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    officerName: String,
    department: String,
    date: {
      type: Date,
      default: Date.now,
    },
    remarks: String,
    documents: [{
      url: String,
      publicId: String,
      title: String,
    }],
    status: {
      type: String,
      enum: ['pending', 'completed', 'returned'],
    },
  }],
  siteInspection: {
    scheduledDate: Date,
    completedDate: Date,
    inspector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    inspectorName: String,
    findings: String,
    photos: [{
      url: String,
      publicId: String,
      caption: String,
    }],
    recommendation: {
      type: String,
      enum: ['approve', 'reject', 'clarification_needed'],
    },
  },
  approval: {
    approvalNumber: String,
    approvalDate: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    validityPeriod: {
      type: Number, // in months
      default: 36, // 3 years
    },
    expiryDate: Date,
    conditions: [String],
    restrictions: [String],
  },
  rejection: {
    rejectionDate: Date,
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reasons: [String],
    canReapply: {
      type: Boolean,
      default: true,
    },
  },
  clarifications: [{
    requestedDate: Date,
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    query: String,
    responseRequired: Boolean,
    response: String,
    respondedDate: Date,
  }],
  status: {
    type: String,
    enum: [
      'draft',
      'submitted',
      'under_review',
      'inspection_pending',
      'approved',
      'rejected',
      'clarification_required',
      'expired'
    ],
    default: 'draft',
  },
  priority: {
    type: String,
    enum: ['normal', 'high', 'urgent'],
    default: 'normal',
  },
  estimatedCompletionDate: Date,
  notes: String,
}, {
  timestamps: true,
});

// Indexes
buildingPlanSchema.index({ applicationNumber: 1 });
buildingPlanSchema.index({ applicant: 1, createdAt: -1 });
buildingPlanSchema.index({ status: 1 });
buildingPlanSchema.index({ 'siteDetails.ward': 1 });

// Generate application number before saving
buildingPlanSchema.pre('save', async function(next) {
  if (!this.applicationNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('BuildingPlan').countDocuments();
    this.applicationNumber = `BP/${year}/${String(count + 1).padStart(6, '0')}`;
  }
  
  // Calculate total fees
  if (this.fees) {
    this.fees.totalFees = 
      (this.fees.scrutinyFee || 0) +
      (this.fees.sanctionFee || 0) +
      (this.fees.developmentCharges || 0) +
      (this.fees.bettermentCharges || 0) +
      (this.fees.impactFee || 0) +
      (this.fees.otherCharges || 0);
  }
  
  next();
});

// Method to calculate fees based on built-up area
buildingPlanSchema.methods.calculateFees = function() {
  const builtUpArea = this.planDetails.proposedBuiltupArea;
  const baseRate = this.planDetails.proposedUse === 'commercial' ? 20 : 10; // per sq ft
  
  this.fees.scrutinyFee = builtUpArea * baseRate * 0.1;
  this.fees.sanctionFee = builtUpArea * baseRate * 0.5;
  this.fees.developmentCharges = builtUpArea * baseRate * 0.3;
  this.fees.totalFees = this.fees.scrutinyFee + this.fees.sanctionFee + this.fees.developmentCharges;
  
  return this.fees;
};

const BuildingPlan = mongoose.model('BuildingPlan', buildingPlanSchema);

export default BuildingPlan;
