import mongoose from 'mongoose';

const municipalBillSchema = new mongoose.Schema({
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
  billNumber: {
    type: String,
    unique: true,
    required: true,
  },
  financialYear: {
    type: String,
    required: true,
  },
  quarter: {
    type: String,
    enum: ['Q1', 'Q2', 'Q3', 'Q4', 'Annual'],
    default: 'Annual',
  },
  billPeriod: {
    from: Date,
    to: Date,
  },
  taxes: {
    propertyTax: {
      assessedValue: Number,
      rate: Number,
      amount: {
        type: Number,
        default: 0,
      },
    },
    waterTax: {
      connections: Number,
      consumption: Number,
      fixedCharge: Number,
      variableCharge: Number,
      amount: {
        type: Number,
        default: 0,
      },
    },
    sewerageTax: {
      rate: Number,
      amount: {
        type: Number,
        default: 0,
      },
    },
    streetLightTax: {
      rate: Number,
      amount: {
        type: Number,
        default: 0,
      },
    },
    solidWasteTax: {
      rate: Number,
      amount: {
        type: Number,
        default: 0,
      },
    },
    healthTax: {
      rate: Number,
      amount: {
        type: Number,
        default: 0,
      },
    },
    educationCess: {
      rate: Number,
      amount: {
        type: Number,
        default: 0,
      },
    },
  },
  arrears: {
    previousDues: {
      type: Number,
      default: 0,
    },
    interest: {
      type: Number,
      default: 0,
    },
    penalty: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
  },
  discounts: {
    earlyPaymentDiscount: {
      percentage: Number,
      amount: {
        type: Number,
        default: 0,
      },
    },
    seniorCitizenDiscount: {
      percentage: Number,
      amount: {
        type: Number,
        default: 0,
      },
    },
    disabledPersonDiscount: {
      percentage: Number,
      amount: {
        type: Number,
        default: 0,
      },
    },
    otherDiscount: {
      description: String,
      amount: {
        type: Number,
        default: 0,
      },
    },
    totalDiscount: {
      type: Number,
      default: 0,
    },
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  netAmount: {
    type: Number,
    required: true,
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
  balanceAmount: {
    type: Number,
    default: 0,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  paymentDeadline: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'partial', 'cancelled'],
    default: 'pending',
  },
  payments: [{
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    amount: Number,
    paidDate: Date,
    receiptNumber: String,
    paymentMode: String,
  }],
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  generatedDate: {
    type: Date,
    default: Date.now,
  },
  remarks: String,
}, {
  timestamps: true,
});

// Indexes
municipalBillSchema.index({ billNumber: 1 });
municipalBillSchema.index({ property: 1, financialYear: 1 });
municipalBillSchema.index({ user: 1, status: 1 });
municipalBillSchema.index({ dueDate: 1 });

// Generate bill number before saving
municipalBillSchema.pre('save', async function(next) {
  if (!this.billNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('MunicipalBill').countDocuments();
    this.billNumber = `MUN/${year}/${String(count + 1).padStart(8, '0')}`;
  }
  
  // Calculate totals
  let taxesTotal = 0;
  if (this.taxes) {
    taxesTotal = 
      (this.taxes.propertyTax?.amount || 0) +
      (this.taxes.waterTax?.amount || 0) +
      (this.taxes.sewerageTax?.amount || 0) +
      (this.taxes.streetLightTax?.amount || 0) +
      (this.taxes.solidWasteTax?.amount || 0) +
      (this.taxes.healthTax?.amount || 0) +
      (this.taxes.educationCess?.amount || 0);
  }
  
  // Calculate arrears total
  if (this.arrears) {
    this.arrears.total = 
      (this.arrears.previousDues || 0) +
      (this.arrears.interest || 0) +
      (this.arrears.penalty || 0);
  }
  
  // Calculate total discount
  if (this.discounts) {
    this.discounts.totalDiscount = 
      (this.discounts.earlyPaymentDiscount?.amount || 0) +
      (this.discounts.seniorCitizenDiscount?.amount || 0) +
      (this.discounts.disabledPersonDiscount?.amount || 0) +
      (this.discounts.otherDiscount?.amount || 0);
  }
  
  // Calculate total and net amount
  this.totalAmount = taxesTotal + (this.arrears?.total || 0);
  this.netAmount = this.totalAmount - (this.discounts?.totalDiscount || 0);
  this.balanceAmount = this.netAmount - (this.paidAmount || 0);
  
  next();
});

const MunicipalBill = mongoose.model('MunicipalBill', municipalBillSchema);

export default MunicipalBill;
