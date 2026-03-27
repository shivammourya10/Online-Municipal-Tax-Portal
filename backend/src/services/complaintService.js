import Complaint from '../models/Complaint.js';
import { sendEmail } from '../utils/email.js';

/**
 * File a new complaint
 */
export const fileComplaint = async (userId, complaintData) => {
  const complaint = await Complaint.create({
    complainant: userId,
    ...complaintData,
  });
  
  // Add to timeline
  complaint.addToTimeline('Complaint submitted', { _id: userId }, 'Complaint filed by citizen', 'open');
  await complaint.save();
  
  return complaint;
};

/**
 * Get user's complaints
 */
export const getUserComplaints = async (userId, filters = {}) => {
  const query = { complainant: userId };
  
  if (filters.category) {
    query.category = filters.category;
  }
  
  if (filters.status) {
    query['resolution.status'] = filters.status;
  }
  
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;
  
  const [complaints, total] = await Promise.all([
    Complaint.find(query)
      .populate('assignedTo.officer', 'profile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Complaint.countDocuments(query),
  ]);
  
  return {
    complaints,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

/**
 * Get complaint by ID
 */
export const getComplaintById = async (complaintId, userId = null) => {
  const query = { _id: complaintId };
  if (userId) {
    query.complainant = userId;
  }
  
  const complaint = await Complaint.findOne(query)
    .populate('complainant', 'email profile')
    .populate('assignedTo.officer', 'profile')
    .populate('resolution.resolvedBy', 'profile')
    .populate('timeline.by', 'profile');
  
  if (!complaint) {
    throw new Error('Complaint not found');
  }
  
  return complaint;
};

/**
 * Assign complaint to officer (Admin)
 */
export const assignComplaint = async (complaintId, assignmentData, assignedById) => {
  const { department, officerId } = assignmentData;
  
  const complaint = await Complaint.findById(complaintId);
  
  if (!complaint) {
    throw new Error('Complaint not found');
  }
  
  complaint.assignedTo = {
    department,
    officer: officerId,
    assignedDate: new Date(),
  };
  
  complaint.resolution.status = 'assigned';
  
  complaint.addToTimeline(
    'Complaint assigned',
    { _id: assignedById },
    `Assigned to ${department} department`,
    'assigned'
  );
  
  await complaint.save();
  
  return complaint;
};

/**
 * Update complaint status (Officer)
 */
export const updateComplaintStatus = async (complaintId, statusData, officerId) => {
  const { status, remarks, photos, actionTaken } = statusData;
  
  const complaint = await Complaint.findById(complaintId);
  
  if (!complaint) {
    throw new Error('Complaint not found');
  }
  
  complaint.resolution.status = status;
  
  if (remarks) {
    complaint.resolution.resolutionRemarks = remarks;
  }
  
  if (actionTaken) {
    complaint.resolution.actionTaken = actionTaken;
  }
  
  if (photos && photos.length > 0) {
    complaint.resolution.resolutionPhotos = photos;
  }
  
  if (status === 'resolved' || status === 'closed') {
    complaint.resolution.resolvedDate = new Date();
    complaint.resolution.resolvedBy = officerId;
    
    // Calculate time taken
    const timeTaken = Math.floor((new Date() - complaint.createdAt) / (1000 * 60 * 60)); // in hours
    complaint.resolution.timeTaken = timeTaken;
  }
  
  complaint.addToTimeline(
    `Status updated to ${status}`,
    { _id: officerId },
    remarks || '',
    status
  );
  
  await complaint.save();
  
  return complaint;
};

/**
 * Get all complaints (Admin/Officer)
 */
export const getAllComplaints = async (filters = {}) => {
  const query = {};
  
  if (filters.category) {
    query.category = filters.category;
  }
  
  if (filters.status) {
    query['resolution.status'] = filters.status;
  }
  
  if (filters.priority) {
    query.priority = filters.priority;
  }
  
  if (filters.department) {
    query['assignedTo.department'] = filters.department;
  }
  
  if (filters.ward) {
    query['details.location.ward'] = filters.ward;
  }
  
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;
  
  const [complaints, total] = await Promise.all([
    Complaint.find(query)
      .populate('complainant', 'email profile')
      .populate('assignedTo.officer', 'profile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Complaint.countDocuments(query),
  ]);
  
  return {
    complaints,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

/**
 * Escalate complaint
 */
export const escalateComplaint = async (complaintId, escalateTo, reason) => {
  const complaint = await Complaint.findById(complaintId);
  
  if (!complaint) {
    throw new Error('Complaint not found');
  }
  
  complaint.isEscalated = true;
  complaint.escalatedTo = escalateTo;
  complaint.escalatedAt = new Date();
  
  complaint.addToTimeline(
    'Complaint escalated',
    { _id: escalateTo },
    reason,
    complaint.resolution.status
  );
  
  await complaint.save();
  
  return complaint;
};

/**
 * Submit feedback for resolved complaint
 */
export const submitComplaintFeedback = async (complaintId, userId, feedbackData) => {
  const { rating, comments } = feedbackData;
  
  const complaint = await Complaint.findOne({
    _id: complaintId,
    complainant: userId,
  });
  
  if (!complaint) {
    throw new Error('Complaint not found');
  }
  
  if (!['resolved', 'closed'].includes(complaint.resolution.status)) {
    throw new Error('Can only provide feedback for resolved complaints');
  }
  
  complaint.feedback = {
    rating,
    comments,
    submittedAt: new Date(),
  };
  
  complaint.resolution.status = 'closed';
  
  await complaint.save();
  
  return complaint;
};

/**
 * Get complaint statistics (Admin)
 */
export const getComplaintStatistics = async (filters = {}) => {
  const matchQuery = {};
  
  if (filters.startDate && filters.endDate) {
    matchQuery.createdAt = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate),
    };
  }
  
  const [
    totalComplaints,
    statusWise,
    categoryWise,
    priorityWise,
    averageResolutionTime,
    departmentWise,
  ] = await Promise.all([
    Complaint.countDocuments(matchQuery),
    
    Complaint.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$resolution.status', count: { $sum: 1 } } },
    ]),
    
    Complaint.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    
    Complaint.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
    
    Complaint.aggregate([
      { 
        $match: { 
          ...matchQuery,
          'resolution.status': { $in: ['resolved', 'closed'] },
        } 
      },
      { 
        $group: { 
          _id: null, 
          avgTime: { $avg: '$resolution.timeTaken' } 
        } 
      },
    ]),
    
    Complaint.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$assignedTo.department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);
  
  return {
    totalComplaints,
    statusWise,
    categoryWise,
    priorityWise,
    averageResolutionTime: averageResolutionTime[0]?.avgTime || 0,
    departmentWise,
  };
};
