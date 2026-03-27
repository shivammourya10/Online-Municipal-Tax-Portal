import Property from '../models/Property.js';

/**
 * Add a new property
 */
export const addProperty = async (userId, propertyData) => {
  const property = new Property({
    user: userId,
    ...propertyData,
  });
  
  // Calculate initial property tax
  const annualTax = property.calculatePropertyTax();
  property.taxDetails.annualPropertyTax = annualTax;
  property.taxDetails.pendingAmount = annualTax;
  property.taxDetails.taxRate = getPropertyTaxRate(property.propertyType);
  
  // Set due date (typically 31st March of financial year)
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const financialYearEnd = currentMonth >= 3 ? currentYear + 1 : currentYear;
  property.taxDetails.dueDate = new Date(financialYearEnd, 2, 31); // March 31
  
  await property.save();
  return property;
};

/**
 * Get all properties for a user
 */
export const getUserProperties = async (userId, filters = {}) => {
  const query = { user: userId };
  // By default hide inactive properties unless explicitly requested
  if (!filters.status) {
    query.status = { $ne: 'inactive' };
  }
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.propertyType) {
    query.propertyType = filters.propertyType;
  }
  
  if (filters.city) {
    query['propertyDetails.address.city'] = new RegExp(filters.city, 'i');
  }
  
  const properties = await Property.find(query)
    .populate('documents')
    .sort({ createdAt: -1 });
  
  return properties;
};

/**
 * Get property by ID
 */
export const getPropertyById = async (propertyId, userId = null) => {
  const query = { _id: propertyId };
  if (userId) {
    query.user = userId;
  }
  
  const property = await Property.findOne(query)
    .populate('user', 'email profile')
    .populate('documents');
  
  if (!property) {
    throw new Error('Property not found');
  }
  
  return property;
};

/**
 * Update property
 */
export const updateProperty = async (propertyId, userId, updateData) => {
  const property = await Property.findOne({ _id: propertyId, user: userId });
  
  if (!property) {
    throw new Error('Property not found');
  }
  
  // Update fields
  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined) {
      property[key] = updateData[key];
    }
  });
  
  // Recalculate tax if relevant fields changed
  const taxRelevantFields = ['propertyType', 'dimensions', 'assessment', 'amenities', 'usageDetails'];
  const shouldRecalculateTax = taxRelevantFields.some(field => updateData[field]);
  
  if (shouldRecalculateTax) {
    const newTax = property.calculatePropertyTax();
    const oldTax = property.taxDetails.annualPropertyTax;
    property.taxDetails.annualPropertyTax = newTax;
    
    // Adjust pending amount
    if (property.taxDetails.pendingAmount === oldTax) {
      property.taxDetails.pendingAmount = newTax;
    }
  }
  
  await property.save();
  return property;
};

/**
 * Delete property
 */
export const deleteProperty = async (propertyId, userId) => {
  const property = await Property.findOne({ _id: propertyId, user: userId });
  
  if (!property) {
    throw new Error('Property not found');
  }

  // Normalize pending amount (guard against null/undefined/strings)
  const pending = Number(property.taxDetails?.pendingAmount || 0);

  // Allow tiny residuals due to rounding, block meaningful dues
  if (pending > 0.01) {
    throw new Error(`Cannot delete property with pending tax of ₹${pending}. Please clear dues first.`);
  }
  
  property.status = 'inactive';
  property.taxDetails.pendingAmount = 0; // ensure zeroed
  await property.save();
  
  return property;
};

/**
 * Calculate property tax
 */
export const calculatePropertyTax = async (propertyId, userId) => {
  const property = await Property.findOne({ _id: propertyId, user: userId });
  
  if (!property) {
    throw new Error('Property not found');
  }
  
  const annualTax = property.calculatePropertyTax();
  
  // Break down the calculation
  const breakdown = {
    propertyType: property.propertyType,
    marketValue: property.assessment.currentMarketValue,
    builtUpArea: property.dimensions.builtUpArea,
    baseRate: getPropertyTaxRate(property.propertyType),
    usageType: property.usageDetails.currentUse,
    amenitiesCount: Object.values(property.amenities).filter(Boolean).length,
    annualTax: annualTax,
    pendingAmount: property.taxDetails.pendingAmount,
    dueDate: property.taxDetails.dueDate,
  };
  
  return breakdown;
};

/**
 * Get all properties (Admin)
 */
export const getAllProperties = async (filters = {}) => {
  const query = {};
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.propertyType) {
    query.propertyType = filters.propertyType;
  }
  
  if (filters.city) {
    query['propertyDetails.address.city'] = new RegExp(filters.city, 'i');
  }
  
  if (filters.verified !== undefined) {
    query.verified = filters.verified === 'true';
  }
  
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;
  
  const properties = await Property.find(query)
    .populate('user', 'email profile')
    .populate('documents')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await Property.countDocuments(query);
  
  return {
    properties,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

/**
 * Verify property (Admin)
 */
export const verifyProperty = async (propertyId, adminId, status) => {
  const property = await Property.findById(propertyId);
  
  if (!property) {
    throw new Error('Property not found');
  }
  
  property.verified = status === 'verified';
  property.verifiedBy = adminId;
  property.verifiedAt = new Date();
  
  await property.save();
  
  return property;
};

/**
 * Get property statistics (Admin)
 */
export const getPropertyStatistics = async () => {
  const stats = await Property.aggregate([
    {
      $group: {
        _id: '$propertyType',
        count: { $sum: 1 },
        totalMarketValue: { $sum: '$assessment.currentMarketValue' },
        totalPendingTax: { $sum: '$taxDetails.pendingAmount' },
        avgMarketValue: { $avg: '$assessment.currentMarketValue' },
      },
    },
  ]);
  
  const totalProperties = await Property.countDocuments();
  const verifiedProperties = await Property.countDocuments({ verified: true });
  const activeProperties = await Property.countDocuments({ status: 'active' });
  
  const totalPendingTax = await Property.aggregate([
    { $group: { _id: null, total: { $sum: '$taxDetails.pendingAmount' } } },
  ]);
  
  return {
    totalProperties,
    verifiedProperties,
    activeProperties,
    totalPendingTax: totalPendingTax[0]?.total || 0,
    byType: stats,
  };
};

/**
 * Helper function to get base tax rate
 */
function getPropertyTaxRate(propertyType) {
  const rates = {
    residential: 0.5,
    commercial: 1.0,
    industrial: 1.5,
    plot: 0.3,
    agricultural: 0.1,
    mixed_use: 0.8,
  };
  return rates[propertyType] || 0.5;
}
