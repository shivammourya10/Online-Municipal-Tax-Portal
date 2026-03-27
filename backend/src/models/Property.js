import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  propertyType: {
    type: String,
    enum: ['residential', 'commercial', 'industrial', 'plot', 'agricultural', 'mixed_use'],
    required: true,
  },
  propertySubType: {
    type: String,
    enum: [
      'house', 'apartment', 'villa', 'bungalow', // Residential
      'shop', 'office', 'warehouse', 'mall', 'hotel', // Commercial
      'factory', 'manufacturing_unit', 'cold_storage', // Industrial
      'vacant_land', 'residential_plot', 'commercial_plot', // Plot
      'farm', 'plantation', // Agricultural
    ],
  },
  propertyDetails: {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      street: String,
      area: String,
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
      landmark: String,
    },
    propertyId: {
      type: String, // Municipal property ID
      unique: true,
      sparse: true,
    },
    khataNumber: String, // Property tax assessment number
    plotNumber: String,
    surveyNumber: String,
  },
  dimensions: {
    builtUpArea: {
      type: Number, // in sq ft
      required: true,
    },
    plotArea: Number, // in sq ft
    carpetArea: Number, // in sq ft
    numberOfFloors: {
      type: Number,
      default: 1,
    },
    yearBuilt: Number,
  },
  ownership: {
    ownershipType: {
      type: String,
      enum: ['owned', 'leased', 'rented'],
      default: 'owned',
    },
    ownerName: String,
    coOwners: [String],
    purchaseDate: Date,
    purchaseValue: Number,
  },
  assessment: {
    currentMarketValue: {
      type: Number,
      required: true,
    },
    annualRentalValue: Number, // ARV for tax calculation
    ratableValue: Number, // After depreciation
    lastAssessmentDate: Date,
    nextAssessmentDue: Date,
  },
  amenities: {
    waterConnection: { type: Boolean, default: false },
    electricityConnection: { type: Boolean, default: false },
    sewageConnection: { type: Boolean, default: false },
    roadAccess: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    lift: { type: Boolean, default: false },
    generator: { type: Boolean, default: false },
    swimmingPool: { type: Boolean, default: false },
    garden: { type: Boolean, default: false },
    securitySystem: { type: Boolean, default: false },
  },
  usageDetails: {
    currentUse: {
      type: String,
      enum: ['self_occupied', 'rented', 'vacant', 'under_construction'],
      default: 'self_occupied',
    },
    rentAmount: Number, // Monthly rent if rented
    tenantName: String,
    leaseStartDate: Date,
    leaseEndDate: Date,
  },
  taxDetails: {
    annualPropertyTax: Number, // Calculated tax amount
    taxRate: Number, // Percentage
    lastPaidDate: Date,
    lastPaidAmount: Number,
    lastReceiptNumber: String,
    pendingAmount: {
      type: Number,
      default: 0,
    },
    dueDate: Date,
  },
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'disputed', 'sold'],
    default: 'active',
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verifiedAt: Date,
  notes: String,
}, {
  timestamps: true,
});

// Indexes
propertySchema.index({ user: 1, status: 1 });
propertySchema.index({ 'propertyDetails.city': 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ 'propertyDetails.propertyId': 1 });

// Virtual for full address
propertySchema.virtual('fullAddress').get(function() {
  const addr = this.propertyDetails.address;
  return `${addr.street}, ${addr.area}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
});

// Calculate annual property tax
propertySchema.methods.calculatePropertyTax = function() {
  let baseRate = 0;
  
  // Base rate by property type
  switch (this.propertyType) {
    case 'residential':
      baseRate = 0.5; // 0.5% of market value
      break;
    case 'commercial':
      baseRate = 1.0; // 1% of market value
      break;
    case 'industrial':
      baseRate = 1.5; // 1.5% of market value
      break;
    case 'plot':
      baseRate = 0.3; // 0.3% of market value
      break;
    case 'agricultural':
      baseRate = 0.1; // 0.1% of market value
      break;
    case 'mixed_use':
      baseRate = 0.8; // 0.8% of market value
      break;
  }
  
  // Usage multiplier
  let usageMultiplier = 1;
  if (this.usageDetails.currentUse === 'rented') {
    usageMultiplier = 1.2; // 20% higher for rented properties
  } else if (this.usageDetails.currentUse === 'vacant') {
    usageMultiplier = 0.8; // 20% lower for vacant properties
  }
  
  // Area multiplier (larger properties pay more)
  let areaMultiplier = 1;
  const builtUpArea = this.dimensions.builtUpArea;
  if (builtUpArea > 5000) {
    areaMultiplier = 1.3;
  } else if (builtUpArea > 2500) {
    areaMultiplier = 1.15;
  }
  
  // Amenities bonus
  const amenitiesCount = Object.values(this.amenities).filter(Boolean).length;
  const amenitiesMultiplier = 1 + (amenitiesCount * 0.02); // 2% per amenity
  
  // Calculate base tax
  const marketValue = this.assessment.currentMarketValue;
  const baseTax = (marketValue * baseRate) / 100;
  
  // Apply multipliers
  const totalTax = baseTax * usageMultiplier * areaMultiplier * amenitiesMultiplier;
  
  return Math.round(totalTax);
};

const Property = mongoose.model('Property', propertySchema);

export default Property;
