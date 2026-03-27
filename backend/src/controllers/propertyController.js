import * as propertyService from '../services/propertyService.js';
import { successResponse } from '../utils/response.js';

/**
 * @route   POST /api/properties
 * @desc    Add new property
 * @access  Private
 */
export const addProperty = async (req, res, next) => {
  try {
    const property = await propertyService.addProperty(req.user._id, req.body);
    successResponse(res, 'Property added successfully', property, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/properties
 * @desc    Get user properties
 * @access  Private
 */
export const getUserProperties = async (req, res, next) => {
  try {
    const properties = await propertyService.getUserProperties(req.user._id, req.query);
    successResponse(res, 'Properties retrieved successfully', properties);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/properties/:id
 * @desc    Get property by ID
 * @access  Private
 */
export const getProperty = async (req, res, next) => {
  try {
    const property = await propertyService.getPropertyById(req.params.id, req.user._id);
    successResponse(res, 'Property retrieved successfully', property);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/properties/:id
 * @desc    Update property
 * @access  Private
 */
export const updateProperty = async (req, res, next) => {
  try {
    const property = await propertyService.updateProperty(req.params.id, req.user._id, req.body);
    successResponse(res, 'Property updated successfully', property);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/properties/:id
 * @desc    Delete property
 * @access  Private
 */
export const deleteProperty = async (req, res, next) => {
  try {
    await propertyService.deleteProperty(req.params.id, req.user._id);
    successResponse(res, 'Property deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/properties/:id/calculate-tax
 * @desc    Calculate property tax
 * @access  Private
 */
export const calculateTax = async (req, res, next) => {
  try {
    const calculation = await propertyService.calculatePropertyTax(req.params.id, req.user._id);
    successResponse(res, 'Tax calculated successfully', calculation);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/properties/admin/all
 * @desc    Get all properties (Admin)
 * @access  Admin
 */
export const getAllProperties = async (req, res, next) => {
  try {
    const result = await propertyService.getAllProperties(req.query);
    successResponse(res, 'Properties retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/properties/:id/verify
 * @desc    Verify property (Admin)
 * @access  Admin
 */
export const verifyProperty = async (req, res, next) => {
  try {
    const { status } = req.body;
    const property = await propertyService.verifyProperty(req.params.id, req.user._id, status);
    successResponse(res, 'Property verification updated', property);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/properties/admin/statistics
 * @desc    Get property statistics (Admin)
 * @access  Admin
 */
export const getStatistics = async (req, res, next) => {
  try {
    const stats = await propertyService.getPropertyStatistics();
    successResponse(res, 'Statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};
