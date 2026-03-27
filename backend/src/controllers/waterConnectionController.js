import * as waterConnectionService from '../services/waterConnectionService.js';
import { successResponse } from '../utils/response.js';

export const applyForConnection = async (req, res, next) => {
  try {
    const connection = await waterConnectionService.applyForWaterConnection(req.user._id, req.body);
    successResponse(res, 'Water connection application submitted successfully', connection, 201);
  } catch (error) {
    next(error);
  }
};

export const getMyConnections = async (req, res, next) => {
  try {
    const connections = await waterConnectionService.getUserWaterConnections(req.user._id, req.query);
    successResponse(res, 'Water connections retrieved successfully', connections);
  } catch (error) {
    next(error);
  }
};

export const getConnection = async (req, res, next) => {
  try {
    const connection = await waterConnectionService.getWaterConnectionById(req.params.id, req.user._id);
    successResponse(res, 'Water connection retrieved successfully', connection);
  } catch (error) {
    next(error);
  }
};

export const approveConnection = async (req, res, next) => {
  try {
    const connection = await waterConnectionService.approveWaterConnection(
      req.params.id,
      req.user._id,
      req.body.meterNumber
    );
    successResponse(res, 'Water connection approved successfully', connection);
  } catch (error) {
    next(error);
  }
};

export const addReading = async (req, res, next) => {
  try {
    const result = await waterConnectionService.addMeterReading(
      req.params.id,
      req.body,
      req.user._id
    );
    successResponse(res, 'Meter reading added and bill generated successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getAllConnections = async (req, res, next) => {
  try {
    const result = await waterConnectionService.getAllWaterConnections(req.query);
    successResponse(res, 'Water connections retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const disconnectConnection = async (req, res, next) => {
  try {
    const connection = await waterConnectionService.disconnectWaterConnection(
      req.params.id,
      req.body.reason
    );
    successResponse(res, 'Water connection disconnected successfully', connection);
  } catch (error) {
    next(error);
  }
};

export const getBill = async (req, res, next) => {
  try {
    const result = await waterConnectionService.getWaterBill(req.params.id, req.params.billId);
    successResponse(res, 'Water bill retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const payBill = async (req, res, next) => {
  try {
    const result = await waterConnectionService.payWaterBill(
      req.params.id,
      req.params.billId,
      req.body
    );
    successResponse(res, 'Water bill paid successfully', result);
  } catch (error) {
    next(error);
  }
};
