import * as taxService from '../services/taxService.js';
import { successResponse } from '../utils/response.js';

/**
 * @route   POST /api/tax/calculate/income
 * @desc    Calculate income tax
 * @access  Private
 */
export const calculateIncomeTax = async (req, res, next) => {
  try {
    const metadata = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };
    
    const result = await taxService.calculateIncomeTaxService(req.body, req.user._id, metadata);
    
    successResponse(res, 'Income tax calculated successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/tax/calculate/gst
 * @desc    Calculate GST
 * @access  Private
 */
export const calculateGST = async (req, res, next) => {
  try {
    const { amount, gstRate } = req.body;
    
    const metadata = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };
    
    const result = await taxService.calculateGSTService(amount, gstRate, req.user._id, metadata);
    
    successResponse(res, 'GST calculated successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/tax/calculate/property
 * @desc    Calculate property tax
 * @access  Private
 */
export const calculatePropertyTax = async (req, res, next) => {
  try {
    const { propertyValue, taxRate, location } = req.body;
    
    const metadata = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };
    
    const result = await taxService.calculatePropertyTaxService(propertyValue, taxRate, location, req.user._id, metadata);
    
    successResponse(res, 'Property tax calculated successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/tax/calculate/corporate
 * @desc    Calculate corporate tax
 * @access  Private
 */
export const calculateCorporateTax = async (req, res, next) => {
  try {
    const { turnover, netProfit, taxRate } = req.body;
    
    const metadata = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };
    
    const result = await taxService.calculateCorporateTaxService(turnover, netProfit, taxRate, req.user._id, metadata);
    
    successResponse(res, 'Corporate tax calculated successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tax/rules
 * @desc    Get all tax rules
 * @access  Private
 */
export const getTaxRules = async (req, res, next) => {
  try {
    const rules = await taxService.getAllTaxRules(req.query);
    
    successResponse(res, 'Tax rules retrieved successfully', rules);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tax/calculations
 * @desc    Get user tax calculations
 * @access  Private
 */
export const getTaxCalculations = async (req, res, next) => {
  try {
    const result = await taxService.getUserTaxCalculations(req.user._id, req.query);
    
    successResponse(res, 'Tax calculations retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tax/calculations/:id
 * @desc    Get tax calculation by ID
 * @access  Private
 */
export const getTaxCalculationById = async (req, res, next) => {
  try {
    const calculation = await taxService.getTaxCalculationById(req.params.id, req.user._id);
    
    successResponse(res, 'Tax calculation retrieved successfully', calculation);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/tax/rules
 * @desc    Create or update tax rule
 * @access  Admin
 */
export const createTaxRule = async (req, res, next) => {
  try {
    const rule = await taxService.createOrUpdateTaxRule(req.body);
    
    successResponse(res, 'Tax rule created/updated successfully', rule, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/tax/rules/:id
 * @desc    Deactivate tax rule
 * @access  Admin
 */
export const deactivateTaxRule = async (req, res, next) => {
  try {
    const rule = await taxService.deactivateTaxRule(req.params.id);
    
    successResponse(res, 'Tax rule deactivated successfully', rule);
  } catch (error) {
    next(error);
  }
};
