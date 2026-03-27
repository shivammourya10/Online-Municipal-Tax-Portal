import TaxProfile from '../models/TaxProfile.js';
import User from '../models/User.js';

/**
 * Create or update tax profile
 */
export const createOrUpdateTaxProfile = async (userId, profileData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  let taxProfile = await TaxProfile.findOne({ user: userId });
  
  if (taxProfile) {
    // Update existing profile
    Object.assign(taxProfile, profileData);
    await taxProfile.save();
  } else {
    // Create new profile
    taxProfile = await TaxProfile.create({
      user: userId,
      ...profileData,
    });
    
    // Link to user
    user.taxProfile = taxProfile._id;
    await user.save();
  }
  
  return taxProfile;
};

/**
 * Get tax profile
 */
export const getTaxProfile = async (userId) => {
  const taxProfile = await TaxProfile.findOne({ user: userId }).populate('incomeSources.documents');
  
  if (!taxProfile) {
    throw new Error('Tax profile not found');
  }
  
  return taxProfile;
};

/**
 * Add income source
 */
export const addIncomeSource = async (userId, incomeData) => {
  const taxProfile = await TaxProfile.findOne({ user: userId });
  
  if (!taxProfile) {
    throw new Error('Tax profile not found');
  }
  
  taxProfile.incomeSources.push(incomeData);
  await taxProfile.save();
  
  return taxProfile;
};

/**
 * Update income source
 */
export const updateIncomeSource = async (userId, sourceId, updateData) => {
  const taxProfile = await TaxProfile.findOne({ user: userId });
  
  if (!taxProfile) {
    throw new Error('Tax profile not found');
  }
  
  const source = taxProfile.incomeSources.id(sourceId);
  if (!source) {
    throw new Error('Income source not found');
  }
  
  Object.assign(source, updateData);
  await taxProfile.save();
  
  return taxProfile;
};

/**
 * Delete income source
 */
export const deleteIncomeSource = async (userId, sourceId) => {
  const taxProfile = await TaxProfile.findOne({ user: userId });
  
  if (!taxProfile) {
    throw new Error('Tax profile not found');
  }
  
  taxProfile.incomeSources.pull(sourceId);
  await taxProfile.save();
  
  return taxProfile;
};

/**
 * Add tax saving investment
 */
export const addTaxSavingInvestment = async (userId, investmentData) => {
  const taxProfile = await TaxProfile.findOne({ user: userId });
  
  if (!taxProfile) {
    throw new Error('Tax profile not found');
  }
  
  taxProfile.taxSavingInvestments.push(investmentData);
  await taxProfile.save();
  
  return taxProfile;
};

/**
 * Verify PAN
 */
export const verifyPAN = async (userId) => {
  const taxProfile = await TaxProfile.findOne({ user: userId });
  
  if (!taxProfile) {
    throw new Error('Tax profile not found');
  }
  
  // Simulate PAN verification (integrate with actual API)
  taxProfile.pan.verified = true;
  taxProfile.pan.verifiedAt = new Date();
  await taxProfile.save();
  
  return taxProfile;
};

/**
 * Update compliance status
 */
export const updateComplianceStatus = async (userId, complianceData) => {
  const taxProfile = await TaxProfile.findOne({ user: userId });
  
  if (!taxProfile) {
    throw new Error('Tax profile not found');
  }
  
  taxProfile.compliance = { ...taxProfile.compliance, ...complianceData };
  await taxProfile.save();
  
  return taxProfile;
};
