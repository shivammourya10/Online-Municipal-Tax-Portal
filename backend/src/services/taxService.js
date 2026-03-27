import TaxRule from '../models/TaxRule.js';
import TaxCalculation from '../models/TaxCalculation.js';
import {
  calculateIncomeTax,
  calculateGST,
  calculatePropertyTax,
  calculateCorporateTax,
  generateTaxSavingSuggestions,
} from '../utils/taxCalculator.js';

/**
 * Get active tax rule
 */
export const getActiveTaxRule = async (taxType, category, assessmentYear) => {
  const taxRule = await TaxRule.findOne({
    taxType,
    category,
    assessmentYear,
    isActive: true,
  });
  
  if (!taxRule) {
    throw new Error('Tax rule not found for specified criteria');
  }
  
  return taxRule;
};

/**
 * Calculate income tax
 */
export const calculateIncomeTaxService = async (calculationData, userId, metadata = {}) => {
  const { grossIncome, deductions, category, assessmentYear } = calculationData;
  
  const taxRule = await getActiveTaxRule('income_tax', category, assessmentYear);
  
  const result = calculateIncomeTax(grossIncome, deductions, taxRule);
  
  // Generate tax saving suggestions
  const suggestions = generateTaxSavingSuggestions(grossIncome, deductions);
  
  const finalResult = {
    ...result,
    suggestions,
    assessmentYear,
    category,
  };
  
  // Save calculation to database
  const savedCalculation = await TaxCalculation.create({
    user: userId,
    type: 'income_tax',
    calculationData: { grossIncome, deductions, category, assessmentYear },
    result: finalResult,
    assessmentYear,
    metadata,
  });
  
  return {
    ...finalResult,
    calculationId: savedCalculation._id,
  };
};

/**
 * Calculate GST
 */
export const calculateGSTService = async (amount, gstRate, userId, metadata = {}) => {
  const result = calculateGST(amount, gstRate);
  
  // Save calculation to database
  const savedCalculation = await TaxCalculation.create({
    user: userId,
    type: 'gst',
    calculationData: { amount, gstRate },
    result,
    metadata,
  });
  
  return {
    ...result,
    calculationId: savedCalculation._id,
  };
};

/**
 * Calculate property tax
 */
export const calculatePropertyTaxService = async (propertyValue, taxRate, location, userId, metadata = {}) => {
  const result = calculatePropertyTax(propertyValue, taxRate, location);
  
  // Save calculation to database
  const savedCalculation = await TaxCalculation.create({
    user: userId,
    type: 'property_tax',
    calculationData: { propertyValue, taxRate, location },
    result,
    metadata,
  });
  
  return {
    ...result,
    calculationId: savedCalculation._id,
  };
};

/**
 * Calculate corporate tax
 */
export const calculateCorporateTaxService = async (turnover, netProfit, taxRate, userId, metadata = {}) => {
  const result = calculateCorporateTax(turnover, netProfit, taxRate);
  
  // Save calculation to database
  const savedCalculation = await TaxCalculation.create({
    user: userId,
    type: 'corporate_tax',
    calculationData: { turnover, netProfit, taxRate },
    result,
    metadata,
  });
  
  return {
    ...result,
    calculationId: savedCalculation._id,
  };
};

/**
 * Create or update tax rule (Admin only)
 */
export const createOrUpdateTaxRule = async (ruleData) => {
  const { taxType, category, assessmentYear, ...restData } = ruleData;
  
  let taxRule = await TaxRule.findOne({ taxType, category, assessmentYear });
  
  if (taxRule) {
    Object.assign(taxRule, restData);
    await taxRule.save();
  } else {
    taxRule = await TaxRule.create(ruleData);
  }
  
  return taxRule;
};

/**
 * Get all tax rules
 */
export const getAllTaxRules = async (filters = {}) => {
  const query = { isActive: true };
  
  if (filters.taxType) query.taxType = filters.taxType;
  if (filters.category) query.category = filters.category;
  if (filters.assessmentYear) query.assessmentYear = filters.assessmentYear;
  
  const taxRules = await TaxRule.find(query).sort({ assessmentYear: -1, taxType: 1 });
  
  return taxRules;
};

/**
 * Deactivate tax rule
 */
export const deactivateTaxRule = async (ruleId) => {
  const taxRule = await TaxRule.findById(ruleId);
  
  if (!taxRule) {
    throw new Error('Tax rule not found');
  }
  
  taxRule.isActive = false;
  taxRule.effectiveTo = new Date();
  await taxRule.save();
  
  return taxRule;
};

/**
 * Get user tax calculation history
 */
export const getUserTaxCalculations = async (userId, filters = {}) => {
  const query = { user: userId };
  
  if (filters.type) query.type = filters.type;
  if (filters.status) query.status = filters.status;
  
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;
  
  const calculations = await TaxCalculation.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await TaxCalculation.countDocuments(query);
  
  return {
    calculations,
    pagination: { page, limit, total },
  };
};

/**
 * Get tax calculation by ID
 */
export const getTaxCalculationById = async (calculationId, userId) => {
  const calculation = await TaxCalculation.findOne({
    _id: calculationId,
    user: userId,
  });
  
  if (!calculation) {
    throw new Error('Tax calculation not found');
  }
  
  return calculation;
};

/**
 * Mark calculation as paid
 */
export const markCalculationAsPaid = async (calculationId, paymentId) => {
  const calculation = await TaxCalculation.findById(calculationId);
  
  if (!calculation) {
    throw new Error('Tax calculation not found');
  }
  
  calculation.status = 'paid';
  calculation.isPaid = true;
  calculation.paymentId = paymentId;
  await calculation.save();
  
  return calculation;
};
