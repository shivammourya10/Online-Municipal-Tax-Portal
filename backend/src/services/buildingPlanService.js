import BuildingPlan from '../models/BuildingPlan.js';
import Property from '../models/Property.js';

/**
 * Submit building plan application
 */
export const submitBuildingPlan = async (userId, planData) => {
  const { propertyId, applicationType, applicantDetails, siteDetails, planDetails, documents } = planData;
  
  // Check if property exists (optional)
  if (propertyId) {
    const property = await Property.findOne({ _id: propertyId, user: userId });
    if (!property) {
      throw new Error('Property not found');
    }
  }
  
  const buildingPlan = await BuildingPlan.create({
    applicant: userId,
    property: propertyId,
    applicationType,
    applicantDetails,
    siteDetails,
    planDetails,
    documents,
    status: 'submitted',
  });
  
  // Calculate fees
  buildingPlan.calculateFees();
  
  // Add to workflow
  buildingPlan.workflow.push({
    stage: 'submitted',
    date: new Date(),
    remarks: 'Application submitted',
    status: 'completed',
  });
  
  await buildingPlan.save();
  
  return buildingPlan;
};

/**
 * Get user's building plans
 */
export const getUserBuildingPlans = async (userId, filters = {}) => {
  const query = { applicant: userId };
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  const plans = await BuildingPlan.find(query)
    .populate('property', 'propertyDetails')
    .sort({ createdAt: -1 });
  
  return plans;
};

/**
 * Get building plan by ID
 */
export const getBuildingPlanById = async (planId, userId = null) => {
  const query = { _id: planId };
  if (userId) {
    query.applicant = userId;
  }
  
  const plan = await BuildingPlan.findOne(query)
    .populate('applicant', 'email profile')
    .populate('property')
    .populate('approval.approvedBy', 'profile')
    .populate('workflow.officer', 'profile');
  
  if (!plan) {
    throw new Error('Building plan not found');
  }
  
  return plan;
};

/**
 * Update workflow stage (Officer)
 */
export const updateWorkflowStage = async (planId, stageData, officerId) => {
  const { stage, remarks, status } = stageData;
  
  const plan = await BuildingPlan.findById(planId);
  
  if (!plan) {
    throw new Error('Building plan not found');
  }
  
  plan.workflow.push({
    stage,
    officer: officerId,
    remarks,
    status: status || 'completed',
  });
  
  // Update plan status
  if (stage === 'document_verification') {
    plan.status = 'under_review';
  } else if (stage === 'site_inspection') {
    plan.status = 'inspection_pending';
  }
  
  await plan.save();
  
  return plan;
};

/**
 * Schedule site inspection
 */
export const scheduleSiteInspection = async (planId, inspectionData, officerId) => {
  const { scheduledDate, inspectorId } = inspectionData;
  
  const plan = await BuildingPlan.findById(planId);
  
  if (!plan) {
    throw new Error('Building plan not found');
  }
  
  plan.siteInspection = {
    scheduledDate: new Date(scheduledDate),
    inspector: inspectorId,
  };
  
  plan.workflow.push({
    stage: 'site_inspection',
    officer: officerId,
    remarks: `Site inspection scheduled for ${scheduledDate}`,
    status: 'pending',
  });
  
  await plan.save();
  
  return plan;
};

/**
 * Submit inspection report
 */
export const submitInspectionReport = async (planId, reportData, inspectorId) => {
  const { findings, recommendation, photos } = reportData;
  
  const plan = await BuildingPlan.findById(planId);
  
  if (!plan) {
    throw new Error('Building plan not found');
  }
  
  plan.siteInspection.completedDate = new Date();
  plan.siteInspection.findings = findings;
  plan.siteInspection.recommendation = recommendation;
  plan.siteInspection.photos = photos || [];
  
  plan.workflow.push({
    stage: 'site_inspection',
    officer: inspectorId,
    remarks: `Inspection completed. Recommendation: ${recommendation}`,
    status: 'completed',
  });
  
  if (recommendation === 'approve') {
    plan.workflow.push({
      stage: 'committee_review',
      remarks: 'Forwarded for committee review',
      status: 'pending',
    });
  } else if (recommendation === 'reject') {
    plan.status = 'rejected';
  }
  
  await plan.save();
  
  return plan;
};

/**
 * Approve building plan
 */
export const approveBuildingPlan = async (planId, approvalData, officerId) => {
  const { conditions, restrictions, validityPeriod } = approvalData;
  
  const plan = await BuildingPlan.findById(planId);
  
  if (!plan) {
    throw new Error('Building plan not found');
  }
  
  // Generate approval number
  const year = new Date().getFullYear();
  const count = await BuildingPlan.countDocuments({ 'approval.approvalNumber': { $exists: true } });
  const approvalNumber = `BPA/${year}/${String(count + 1).padStart(6, '0')}`;
  
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + (validityPeriod || 36));
  
  plan.approval = {
    approvalNumber,
    approvalDate: new Date(),
    approvedBy: officerId,
    validityPeriod: validityPeriod || 36,
    expiryDate,
    conditions: conditions || [],
    restrictions: restrictions || [],
  };
  
  plan.status = 'approved';
  
  plan.workflow.push({
    stage: 'approved',
    officer: officerId,
    remarks: 'Building plan approved',
    status: 'completed',
  });
  
  await plan.save();
  
  return plan;
};

/**
 * Reject building plan
 */
export const rejectBuildingPlan = async (planId, rejectionData, officerId) => {
  const { reasons, canReapply } = rejectionData;
  
  const plan = await BuildingPlan.findById(planId);
  
  if (!plan) {
    throw new Error('Building plan not found');
  }
  
  plan.rejection = {
    rejectionDate: new Date(),
    rejectedBy: officerId,
    reasons,
    canReapply: canReapply !== false,
  };
  
  plan.status = 'rejected';
  
  plan.workflow.push({
    stage: 'rejected',
    officer: officerId,
    remarks: `Rejected: ${reasons.join(', ')}`,
    status: 'completed',
  });
  
  await plan.save();
  
  return plan;
};

/**
 * Request clarification
 */
export const requestClarification = async (planId, clarificationData, officerId) => {
  const { query } = clarificationData;
  
  const plan = await BuildingPlan.findById(planId);
  
  if (!plan) {
    throw new Error('Building plan not found');
  }
  
  plan.clarifications.push({
    requestedDate: new Date(),
    requestedBy: officerId,
    query,
    responseRequired: true,
  });
  
  plan.status = 'clarification_required';
  
  plan.workflow.push({
    stage: 'clarification_required',
    officer: officerId,
    remarks: query,
    status: 'pending',
  });
  
  await plan.save();
  
  return plan;
};

/**
 * Submit clarification response
 */
export const submitClarificationResponse = async (planId, clarificationId, response, userId) => {
  const plan = await BuildingPlan.findOne({
    _id: planId,
    applicant: userId,
  });
  
  if (!plan) {
    throw new Error('Building plan not found');
  }
  
  const clarification = plan.clarifications.id(clarificationId);
  
  if (!clarification) {
    throw new Error('Clarification not found');
  }
  
  clarification.response = response;
  clarification.respondedDate = new Date();
  
  plan.status = 'under_review';
  
  plan.workflow.push({
    stage: 'clarification_required',
    remarks: 'Clarification submitted by applicant',
    status: 'completed',
  });
  
  await plan.save();
  
  return plan;
};

/**
 * Get all building plans (Admin)
 */
export const getAllBuildingPlans = async (filters = {}) => {
  const query = {};
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.applicationType) {
    query.applicationType = filters.applicationType;
  }
  
  if (filters.ward) {
    query['siteDetails.ward'] = filters.ward;
  }
  
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;
  
  const [plans, total] = await Promise.all([
    BuildingPlan.find(query)
      .populate('applicant', 'email profile')
      .populate('property', 'propertyDetails')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    BuildingPlan.countDocuments(query),
  ]);
  
  return {
    plans,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};
