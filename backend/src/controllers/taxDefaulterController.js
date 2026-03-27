import * as taxDefaulterService from '../services/taxDefaulterService.js';
import { successResponse } from '../utils/response.js';

export const identifyDefaulters = async (req, res, next) => {
  try {
    const defaulters = await taxDefaulterService.identifyDefaulters();
    successResponse(res, 'Defaulters identified successfully', defaulters);
  } catch (error) {
    next(error);
  }
};

export const getAllDefaulters = async (req, res, next) => {
  try {
    const result = await taxDefaulterService.getAllDefaulters(req.query);
    successResponse(res, 'Defaulters retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getDefaulter = async (req, res, next) => {
  try {
    const defaulter = await taxDefaulterService.getDefaulterById(req.params.id);
    successResponse(res, 'Defaulter details retrieved successfully', defaulter);
  } catch (error) {
    next(error);
  }
};

export const sendNotice = async (req, res, next) => {
  try {
    const defaulter = await taxDefaulterService.sendNoticeToDefaulter(
      req.params.id,
      req.body,
      req.user._id
    );
    successResponse(res, 'Notice sent successfully', defaulter);
  } catch (error) {
    next(error);
  }
};

export const takeAction = async (req, res, next) => {
  try {
    const defaulter = await taxDefaulterService.takeRecoveryAction(
      req.params.id,
      req.body,
      req.user._id
    );
    successResponse(res, 'Recovery action recorded successfully', defaulter);
  } catch (error) {
    next(error);
  }
};

export const offerSettlement = async (req, res, next) => {
  try {
    const defaulter = await taxDefaulterService.offerSettlement(req.params.id, req.body);
    successResponse(res, 'Settlement offer created successfully', defaulter);
  } catch (error) {
    next(error);
  }
};

export const acceptSettlement = async (req, res, next) => {
  try {
    const defaulter = await taxDefaulterService.acceptSettlementOffer(req.params.id, req.user._id);
    successResponse(res, 'Settlement offer accepted successfully', defaulter);
  } catch (error) {
    next(error);
  }
};

export const initiateLegal = async (req, res, next) => {
  try {
    const defaulter = await taxDefaulterService.initiateLegalProceedings(
      req.params.id,
      req.body,
      req.user._id
    );
    successResponse(res, 'Legal proceedings initiated successfully', defaulter);
  } catch (error) {
    next(error);
  }
};

export const resolveDefaulter = async (req, res, next) => {
  try {
    const defaulter = await taxDefaulterService.resolveDefaulter(req.params.id);
    successResponse(res, 'Defaulter resolved successfully', defaulter);
  } catch (error) {
    next(error);
  }
};

export const getStatistics = async (req, res, next) => {
  try {
    const stats = await taxDefaulterService.getDefaulterStatistics();
    successResponse(res, 'Defaulter statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};
