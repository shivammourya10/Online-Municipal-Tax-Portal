import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Document from '../models/Document.js';
import TaxProfile from '../models/TaxProfile.js';
import AuditLog from '../models/AuditLog.js';

/**
 * Get admin dashboard statistics
 */
export const getAdminDashboard = async () => {
  // Total users
  const totalUsers = await User.countDocuments();
  const taxpayers = await User.countDocuments({ role: 'taxpayer' });
  const taxOfficers = await User.countDocuments({ role: 'tax_officer' });
  
  // Revenue statistics
  const totalRevenue = await Transaction.aggregate([
    { $match: { status: 'success' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  
  const monthlyRevenue = await Transaction.aggregate([
    {
      $match: {
        status: 'success',
        paidAt: { $gte: new Date(new Date().setDate(1)) },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  
  // Pending taxes
  const pendingTaxes = await Transaction.aggregate([
    { $match: { status: 'pending' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  
  // Transaction statistics
  const successfulTransactions = await Transaction.countDocuments({ status: 'success' });
  const failedTransactions = await Transaction.countDocuments({ status: 'failed' });
  const pendingTransactions = await Transaction.countDocuments({ status: 'pending' });
  
  // Document statistics
  const pendingDocuments = await Document.countDocuments({ 'verification.status': 'pending' });
  const verifiedDocuments = await Document.countDocuments({ 'verification.status': 'verified' });
  const rejectedDocuments = await Document.countDocuments({ 'verification.status': 'rejected' });
  
  // Compliance statistics
  const compliantUsers = await TaxProfile.countDocuments({ 'compliance.isCompliant': true });
  const nonCompliantUsers = await TaxProfile.countDocuments({ 'compliance.isCompliant': false });
  
  // Revenue by tax type
  const revenueByType = await Transaction.aggregate([
    { $match: { status: 'success' } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);
  
  // Recent transactions
  const recentTransactions = await Transaction.find()
    .populate('user', 'email profile')
    .sort({ createdAt: -1 })
    .limit(10);
  
  return {
    users: {
      total: totalUsers,
      taxpayers,
      taxOfficers,
    },
    revenue: {
      total: totalRevenue[0]?.total || 0,
      monthly: monthlyRevenue[0]?.total || 0,
      pending: pendingTaxes[0]?.total || 0,
    },
    transactions: {
      successful: successfulTransactions,
      failed: failedTransactions,
      pending: pendingTransactions,
    },
    documents: {
      pending: pendingDocuments,
      verified: verifiedDocuments,
      rejected: rejectedDocuments,
    },
    compliance: {
      compliant: compliantUsers,
      nonCompliant: nonCompliantUsers,
    },
    revenueByType,
    recentTransactions,
  };
};

/**
 * Get taxpayer dashboard
 */
export const getTaxpayerDashboard = async (userId) => {
  const user = await User.findById(userId).populate('taxProfile');
  
  // Tax liability
  const totalLiability = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        status: { $in: ['pending', 'success'] },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  
  const paidTaxes = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        status: 'success',
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  
  const pendingPayments = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        status: 'pending',
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  
  // Recent transactions
  const recentTransactions = await Transaction.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(5);
  
  // Documents count
  const documentsCount = await Document.countDocuments({ user: userId });
  const pendingDocuments = await Document.countDocuments({
    user: userId,
    'verification.status': 'pending',
  });
  
  // Upcoming deadlines (mock data - integrate with actual deadline system)
  const upcomingDeadlines = [
    {
      title: 'ITR Filing Deadline',
      dueDate: new Date('2026-07-31'),
      description: 'File your Income Tax Return for FY 2025-26',
    },
    {
      title: 'GST Return Q4',
      dueDate: new Date('2026-04-30'),
      description: 'File GST return for Q4 2025-26',
    },
  ];
  
  return {
    user: {
      name: user.fullName,
      email: user.email,
      pan: user.taxProfile?.pan?.number,
    },
    taxLiability: {
      total: totalLiability[0]?.total || 0,
      paid: paidTaxes[0]?.total || 0,
      pending: pendingPayments[0]?.total || 0,
    },
    documents: {
      total: documentsCount,
      pending: pendingDocuments,
    },
    recentTransactions,
    upcomingDeadlines,
    compliance: user.taxProfile?.compliance || { isCompliant: true },
  };
};

/**
 * Get analytics data
 */
export const getAnalytics = async (filters = {}) => {
  const startDate = filters.startDate ? new Date(filters.startDate) : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
  const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
  
  // Revenue trend
  const revenueTrend = await Transaction.aggregate([
    {
      $match: {
        status: 'success',
        paidAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$paidAt' },
          month: { $month: '$paidAt' },
        },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
  
  // Tax type distribution
  const taxTypeDistribution = await Transaction.aggregate([
    {
      $match: {
        status: 'success',
        paidAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: '$type',
        amount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);
  
  // User growth
  const userGrowth = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
  
  // Payment success rate
  const totalTransactions = await Transaction.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
  });
  const successfulTransactions = await Transaction.countDocuments({
    status: 'success',
    paidAt: { $gte: startDate, $lte: endDate },
  });
  
  const successRate = totalTransactions > 0 
    ? ((successfulTransactions / totalTransactions) * 100).toFixed(2) 
    : 0;
  
  return {
    revenueTrend,
    taxTypeDistribution,
    userGrowth,
    paymentSuccessRate: successRate,
    dateRange: { startDate, endDate },
  };
};

/**
 * Get user management data (Admin)
 */
export const getUserManagement = async (filters = {}) => {
  const query = {};
  
  if (filters.role) query.role = filters.role;
  if (filters.isActive !== undefined) query.isActive = filters.isActive === 'true';
  
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;
  
  const users = await User.find(query)
    .populate('taxProfile')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-password -refreshToken');
  
  const total = await User.countDocuments(query);
  
  return {
    users,
    pagination: { page, limit, total },
  };
};

/**
 * Update user status (Admin)
 */
export const updateUserStatus = async (userId, isActive) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true }
  ).select('-password -refreshToken');
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
};

/**
 * Get admin transactions
 */
export const getAdminTransactions = async (filters = {}) => {
  const query = {};
  
  if (filters.status) query.status = filters.status;
  if (filters.type) query.type = filters.type;
  
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;
  
  const transactions = await Transaction.find(query)
    .populate('user', 'email profile')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await Transaction.countDocuments(query);
  
  return {
    transactions,
    pagination: { page, limit, total },
  };
};
