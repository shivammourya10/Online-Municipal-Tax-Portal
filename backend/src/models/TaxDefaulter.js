import mongoose from 'mongoose';

const taxDefaulterSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  defaultDetails: {
    outstandingAmount: {
      type: Number,
      required: true,
    },
    yearsInDefault: {
      type: Number,
      default: 0,
    },
    oldestUnpaidYear: String,
    interestAccrued: {
      type: Number,
      default: 0,
    },
    penaltyAmount: {
      type: Number,
      default: 0,
    },
    totalDue: {
      type: Number,
      required: true,
    },
    firstDefaultDate: Date,
  },
  unpaidBills: [{
    billId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MunicipalBill',
    },
    billNumber: String,
    financialYear: String,
    amount: Number,
    dueDate: Date,
    daysOverdue: Number,
  }],
  noticesSent: [{
    noticeNumber: String,
    noticeType: {
      type: String,
      enum: ['first_reminder', 'second_reminder', 'final_notice', 'legal_notice', 'disconnection_notice'],
    },
    sentDate: {
      type: Date,
      default: Date.now,
    },
    sentVia: {
      type: String,
      enum: ['email', 'sms', 'post', 'in_person', 'whatsapp'],
      default: 'email',
    },
    acknowledgement: {
      type: Boolean,
      default: false,
    },
    acknowledgedDate: Date,
    noticeDocument: {
      url: String,
      publicId: String,
    },
  }],
  recoveryActions: [{
    actionType: {
      type: String,
      enum: [
        'disconnect_water',
        'seal_property',
        'attachment',
        'auction',
        'court_proceedings',
        'bank_account_attachment',
        'salary_deduction'
      ],
    },
    actionDate: {
      type: Date,
      default: Date.now,
    },
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    actionByName: String,
    remarks: String,
    documents: [{
      url: String,
      publicId: String,
      title: String,
    }],
    status: {
      type: String,
      enum: ['planned', 'executed', 'reversed'],
      default: 'planned',
    },
  }],
  settlementOffer: {
    isOffered: {
      type: Boolean,
      default: false,
    },
    offerDate: Date,
    principalAmount: Number,
    waiverAmount: Number,
    waiverPercentage: Number,
    finalAmount: Number,
    installments: Number,
    monthlyAmount: Number,
    firstInstallmentDate: Date,
    validUpto: Date,
    accepted: {
      type: Boolean,
      default: false,
    },
    acceptedDate: Date,
    installmentsPaid: {
      type: Number,
      default: 0,
    },
  },
  legalProceedings: {
    caseNumber: String,
    courtName: String,
    filingDate: Date,
    hearingDates: [{
      date: Date,
      outcome: String,
    }],
    status: {
      type: String,
      enum: ['filed', 'pending', 'judgment_awaited', 'judgment_received', 'appeal_filed', 'closed'],
    },
    judgmentDetails: String,
    lawyerDetails: {
      name: String,
      contact: String,
    },
  },
  status: {
    type: String,
    enum: ['active', 'under_settlement', 'legal_proceedings', 'resolved', 'written_off'],
    default: 'active',
  },
  riskCategory: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  assignedOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  lastContactedDate: Date,
  nextFollowUpDate: Date,
  internalNotes: [String],
  isPubliclyListed: {
    type: Boolean,
    default: false, // Whether to show in public defaulters list
  },
  listedDate: Date,
}, {
  timestamps: true,
});

// Indexes
taxDefaulterSchema.index({ property: 1, status: 1 });
taxDefaulterSchema.index({ user: 1 });
taxDefaulterSchema.index({ 'defaultDetails.yearsInDefault': -1 });
taxDefaulterSchema.index({ riskCategory: 1 });

// Calculate risk category based on outstanding amount and years
taxDefaulterSchema.pre('save', function(next) {
  const totalDue = this.defaultDetails.totalDue;
  const years = this.defaultDetails.yearsInDefault;
  
  if (totalDue > 500000 || years > 5) {
    this.riskCategory = 'critical';
  } else if (totalDue > 200000 || years > 3) {
    this.riskCategory = 'high';
  } else if (totalDue > 50000 || years > 1) {
    this.riskCategory = 'medium';
  } else {
    this.riskCategory = 'low';
  }
  
  next();
});

// Method to calculate interest
taxDefaulterSchema.methods.calculateInterest = function(interestRate = 12) {
  const principal = this.defaultDetails.outstandingAmount;
  const years = this.defaultDetails.yearsInDefault;
  
  // Simple interest calculation
  const interest = (principal * interestRate * years) / 100;
  
  return interest;
};

const TaxDefaulter = mongoose.model('TaxDefaulter', taxDefaulterSchema);

export default TaxDefaulter;
