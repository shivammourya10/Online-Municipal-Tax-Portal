import mongoose from 'mongoose';

const waterConnectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  connectionNumber: {
    type: String,
    unique: true,
    required: true,
  },
  connectionType: {
    type: String,
    enum: ['domestic', 'commercial', 'industrial'],
    required: true,
  },
  connectionDetails: {
    dateOfConnection: {
      type: Date,
      default: Date.now,
    },
    pipeSize: {
      type: String,
      enum: ['15mm', '20mm', '25mm', '32mm', '40mm'],
      default: '15mm',
    },
    numberOfTaps: {
      type: Number,
      default: 1,
    },
    connectionStatus: {
      type: String,
      enum: ['active', 'disconnected', 'suspended', 'pending'],
      default: 'pending',
    },
    meterNumber: String,
    meterType: {
      type: String,
      enum: ['mechanical', 'digital', 'smart'],
      default: 'mechanical',
    },
  },
  monthlyReadings: [{
    month: {
      type: Date,
      required: true,
    },
    previousReading: {
      type: Number,
      default: 0,
    },
    currentReading: {
      type: Number,
      required: true,
    },
    consumption: {
      type: Number, // in liters or cubic meters
    },
    readingDate: {
      type: Date,
      default: Date.now,
    },
    meterReader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    meterReaderName: String,
    photo: String, // Cloudinary URL of meter photo
  }],
  billingHistory: [{
    billNumber: String,
    month: Date,
    consumption: Number,
    fixedCharges: Number,
    variableCharges: Number,
    sewerageCharges: Number,
    totalAmount: Number,
    paidAmount: {
      type: Number,
      default: 0,
    },
    dueDate: Date,
    status: {
      type: String,
      enum: ['paid', 'pending', 'overdue', 'partial'],
      default: 'pending',
    },
    paidAt: Date,
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
  }],
  charges: {
    securityDeposit: {
      type: Number,
      default: 0,
    },
    connectionFee: {
      type: Number,
      default: 0,
    },
    fixedMonthlyCharge: {
      type: Number,
      default: 100, // Base charge
    },
    ratePerUnit: {
      type: Number,
      default: 5, // Per liter/cubic meter
    },
  },
  arrears: {
    type: Number,
    default: 0,
  },
  applicationDetails: {
    applicationNumber: String,
    applicationDate: Date,
    applicantName: String,
    contactNumber: String,
    email: String,
    documents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    }],
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedDate: Date,
  notes: String,
}, {
  timestamps: true,
});

// Indexes
waterConnectionSchema.index({ connectionNumber: 1 });
waterConnectionSchema.index({ user: 1, property: 1 });
waterConnectionSchema.index({ 'connectionDetails.connectionStatus': 1 });

// Calculate consumption before saving reading
waterConnectionSchema.pre('save', function(next) {
  if (this.monthlyReadings && this.monthlyReadings.length > 0) {
    this.monthlyReadings.forEach(reading => {
      if (reading.currentReading && reading.previousReading) {
        reading.consumption = reading.currentReading - reading.previousReading;
      }
    });
  }
  next();
});

// Method to calculate water bill
waterConnectionSchema.methods.calculateBill = function(consumption) {
  const fixedCharge = this.charges.fixedMonthlyCharge;
  const variableCharge = consumption * this.charges.ratePerUnit;
  const sewerageCharge = variableCharge * 0.3; // 30% of water charges
  
  return {
    fixedCharges: fixedCharge,
    variableCharges: variableCharge,
    sewerageCharges: sewerageCharge,
    totalAmount: fixedCharge + variableCharge + sewerageCharge,
  };
};

const WaterConnection = mongoose.model('WaterConnection', waterConnectionSchema);

export default WaterConnection;
