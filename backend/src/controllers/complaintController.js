import * as complaintService from '../services/complaintService.js';
import { successResponse } from '../utils/response.js';

export const createComplaint = async (req, res, next) => {
  try {
    const complaint = await complaintService.fileComplaint(req.user._id, req.body);
    successResponse(res, 'Complaint filed successfully', complaint, 201);
  } catch (error) {
    next(error);
  }
};

export const getMyComplaints = async (req, res, next) => {
  try {
    const result = await complaintService.getUserComplaints(req.user._id, req.query);
    successResponse(res, 'Complaints retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getComplaint = async (req, res, next) => {
  try {
    const userId = req.user.role === 'taxpayer' ? req.user._id : null;
    const complaint = await complaintService.getComplaintById(req.params.id, userId);
    successResponse(res, 'Complaint retrieved successfully', complaint);
  } catch (error) {
    next(error);
  }
};

export const assignComplaint = async (req, res, next) => {
  try {
    const complaint = await complaintService.assignComplaint(
      req.params.id,
      req.body,
      req.user._id
    );
    successResponse(res, 'Complaint assigned successfully', complaint);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const complaint = await complaintService.updateComplaintStatus(
      req.params.id,
      req.body,
      req.user._id
    );
    successResponse(res, 'Complaint status updated successfully', complaint);
  } catch (error) {
    next(error);
  }
};

export const getAllComplaints = async (req, res, next) => {
  try {
    const result = await complaintService.getAllComplaints(req.query);
    successResponse(res, 'Complaints retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const escalateComplaint = async (req, res, next) => {
  try {
    const complaint = await complaintService.escalateComplaint(
      req.params.id,
      req.body.escalateTo,
      req.body.reason
    );
    successResponse(res, 'Complaint escalated successfully', complaint);
  } catch (error) {
    next(error);
  }
};

export const submitFeedback = async (req, res, next) => {
  try {
    const complaint = await complaintService.submitComplaintFeedback(
      req.params.id,
      req.user._id,
      req.body
    );
    successResponse(res, 'Feedback submitted successfully', complaint);
  } catch (error) {
    next(error);
  }
};

export const getStatistics = async (req, res, next) => {
  try {
    const stats = await complaintService.getComplaintStatistics(req.query);
    successResponse(res, 'Complaint statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};
