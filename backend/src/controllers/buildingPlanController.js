import * as buildingPlanService from '../services/buildingPlanService.js';
import { successResponse } from '../utils/response.js';

export const submitPlan = async (req, res, next) => {
  try {
    const plan = await buildingPlanService.submitBuildingPlan(req.user._id, req.body);
    successResponse(res, 'Building plan submitted successfully', plan, 201);
  } catch (error) {
    next(error);
  }
};

export const getMyPlans = async (req, res, next) => {
  try {
    const plans = await buildingPlanService.getUserBuildingPlans(req.user._id, req.query);
    successResponse(res, 'Building plans retrieved successfully', plans);
  } catch (error) {
    next(error);
  }
};

export const getPlan = async (req, res, next) => {
  try {
    const userId = req.user.role === 'taxpayer' ? req.user._id : null;
    const plan = await buildingPlanService.getBuildingPlanById(req.params.id, userId);
    successResponse(res, 'Building plan retrieved successfully', plan);
  } catch (error) {
    next(error);
  }
};

export const updateWorkflow = async (req, res, next) => {
  try {
    const plan = await buildingPlanService.updateWorkflowStage(
      req.params.id,
      req.body,
      req.user._id
    );
    successResponse(res, 'Workflow updated successfully', plan);
  } catch (error) {
    next(error);
  }
};

export const scheduleInspection = async (req, res, next) => {
  try {
    const plan = await buildingPlanService.scheduleSiteInspection(
      req.params.id,
      req.body,
      req.user._id
    );
    successResponse(res, 'Site inspection scheduled successfully', plan);
  } catch (error) {
    next(error);
  }
};

export const submitInspection = async (req, res, next) => {
  try {
    const plan = await buildingPlanService.submitInspectionReport(
      req.params.id,
      req.body,
      req.user._id
    );
    successResponse(res, 'Inspection report submitted successfully', plan);
  } catch (error) {
    next(error);
  }
};

export const approvePlan = async (req, res, next) => {
  try {
    const plan = await buildingPlanService.approveBuildingPlan(
      req.params.id,
      req.body,
      req.user._id
    );
    successResponse(res, 'Building plan approved successfully', plan);
  } catch (error) {
    next(error);
  }
};

export const rejectPlan = async (req, res, next) => {
  try {
    const plan = await buildingPlanService.rejectBuildingPlan(
      req.params.id,
      req.body,
      req.user._id
    );
    successResponse(res, 'Building plan rejected', plan);
  } catch (error) {
    next(error);
  }
};

export const requestClarification = async (req, res, next) => {
  try {
    const plan = await buildingPlanService.requestClarification(
      req.params.id,
      req.body,
      req.user._id
    );
    successResponse(res, 'Clarification requested successfully', plan);
  } catch (error) {
    next(error);
  }
};

export const submitClarification = async (req, res, next) => {
  try {
    const plan = await buildingPlanService.submitClarificationResponse(
      req.params.id,
      req.params.clarificationId,
      req.body.response,
      req.user._id
    );
    successResponse(res, 'Clarification submitted successfully', plan);
  } catch (error) {
    next(error);
  }
};

export const getAllPlans = async (req, res, next) => {
  try {
    const result = await buildingPlanService.getAllBuildingPlans(req.query);
    successResponse(res, 'Building plans retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};
