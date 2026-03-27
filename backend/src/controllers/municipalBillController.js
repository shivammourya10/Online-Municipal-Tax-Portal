import * as municipalBillService from '../services/municipalBillService.js';
import { successResponse } from '../utils/response.js';

export const generateBill = async (req, res, next) => {
  try {
    const { propertyId, financialYear, quarter } = req.body;
    const bill = await municipalBillService.generateMunicipalBill(propertyId, financialYear, quarter);
    successResponse(res, 'Municipal bill generated successfully', bill, 201);
  } catch (error) {
    next(error);
  }
};

export const getMyBills = async (req, res, next) => {
  try {
    const bills = await municipalBillService.getUserMunicipalBills(req.user._id, req.query);
    successResponse(res, 'Municipal bills retrieved successfully', bills);
  } catch (error) {
    next(error);
  }
};

export const getBill = async (req, res, next) => {
  try {
    const userId = req.user.role === 'taxpayer' ? req.user._id : null;
    const bill = await municipalBillService.getMunicipalBillById(req.params.id, userId);
    successResponse(res, 'Municipal bill retrieved successfully', bill);
  } catch (error) {
    next(error);
  }
};

export const payBill = async (req, res, next) => {
  try {
    const bill = await municipalBillService.payMunicipalBill(req.params.id, req.body);
    successResponse(res, 'Municipal bill paid successfully', bill);
  } catch (error) {
    next(error);
  }
};

export const getAllBills = async (req, res, next) => {
  try {
    const result = await municipalBillService.getAllMunicipalBills(req.query);
    successResponse(res, 'Municipal bills retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const generateBulkBills = async (req, res, next) => {
  try {
    const { financialYear, quarter } = req.body;
    const result = await municipalBillService.generateBillsForAllProperties(financialYear, quarter);
    successResponse(res, 'Bulk bill generation completed', result);
  } catch (error) {
    next(error);
  }
};

export const getStatistics = async (req, res, next) => {
  try {
    const stats = await municipalBillService.getMunicipalBillStatistics(req.query.financialYear);
    successResponse(res, 'Bill statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};
