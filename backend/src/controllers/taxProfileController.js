import * as taxProfileService from '../services/taxProfileService.js';
import { successResponse } from '../utils/response.js';

/**
 * @route   POST /api/tax-profile
 * @desc    Create or update tax profile
 * @access  Private
 */
export const createOrUpdateProfile = async (req, res, next) => {
  try {
    const profile = await taxProfileService.createOrUpdateTaxProfile(req.user._id, req.body);
    
    successResponse(res, 'Tax profile saved successfully', profile);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tax-profile
 * @desc    Get tax profile
 * @access  Private
 */
export const getProfile = async (req, res, next) => {
  try {
    const profile = await taxProfileService.getTaxProfile(req.user._id);
    
    successResponse(res, 'Tax profile retrieved successfully', profile);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/tax-profile/income-sources
 * @desc    Add income source
 * @access  Private
 */
export const addIncomeSource = async (req, res, next) => {
  try {
    const profile = await taxProfileService.addIncomeSource(req.user._id, req.body);
    
    successResponse(res, 'Income source added successfully', profile, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/tax-profile/income-sources/:sourceId
 * @desc    Update income source
 * @access  Private
 */
export const updateIncomeSource = async (req, res, next) => {
  try {
    const profile = await taxProfileService.updateIncomeSource(
      req.user._id,
      req.params.sourceId,
      req.body
    );
    
    successResponse(res, 'Income source updated successfully', profile);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/tax-profile/income-sources/:sourceId
 * @desc    Delete income source
 * @access  Private
 */
export const deleteIncomeSource = async (req, res, next) => {
  try {
    const profile = await taxProfileService.deleteIncomeSource(req.user._id, req.params.sourceId);
    
    successResponse(res, 'Income source deleted successfully', profile);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/tax-profile/investments
 * @desc    Add tax saving investment
 * @access  Private
 */
export const addInvestment = async (req, res, next) => {
  try {
    const profile = await taxProfileService.addTaxSavingInvestment(req.user._id, req.body);
    
    successResponse(res, 'Investment added successfully', profile, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/tax-profile/verify-pan
 * @desc    Verify PAN
 * @access  Private
 */
export const verifyPAN = async (req, res, next) => {
  try {
    const profile = await taxProfileService.verifyPAN(req.user._id);
    
    successResponse(res, 'PAN verified successfully', profile);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/tax-profile/compliance
 * @desc    Update compliance status
 * @access  Admin
 */
export const updateCompliance = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user._id;
    const profile = await taxProfileService.updateComplianceStatus(userId, req.body);
    
    successResponse(res, 'Compliance status updated successfully', profile);
  } catch (error) {
    next(error);
  }
};
