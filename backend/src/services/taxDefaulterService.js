import TaxDefaulter from '../models/TaxDefaulter.js';
import MunicipalBill from '../models/MunicipalBill.js';
import Property from '../models/Property.js';
import { sendEmail } from '../utils/email.js';

/**
 * Identify and create defaulter records
 */
export const identifyDefaulters = async () => {
  // Find all overdue bills
  const overdueBills = await MunicipalBill.find({
    status: { $in: ['pending', 'overdue', 'partial'] },
    dueDate: { $lt: new Date() },
  }).populate('property user');
  
  const defaulters = new Map();
  
  for (const bill of overdueBills) {
    const key = `${bill.property._id}`;
    
    if (!defaulters.has(key)) {
      defaulters.set(key, {
        property: bill.property._id,
        user: bill.user._id,
        bills: [],
        totalDue: 0,
      });
    }
    
    const defaulter = defaulters.get(key);
    defaulter.bills.push(bill);
    defaulter.totalDue += bill.balanceAmount || 0;
  }
  
  const results = [];
  
  for (const [key, data] of defaulters) {
    // Check if defaulter record already exists
    let defaulter = await TaxDefaulter.findOne({
      property: data.property,
      status: { $in: ['active', 'under_settlement'] },
    });
    
    const years = data.bills.length;
    const oldestBill = data.bills.sort((a, b) => a.createdAt - b.createdAt)[0];
    
    const unpaidBills = data.bills.map(bill => ({
      billId: bill._id,
      billNumber: bill.billNumber,
      financialYear: bill.financialYear,
      amount: bill.balanceAmount,
      dueDate: bill.dueDate,
      daysOverdue: Math.floor((new Date() - new Date(bill.dueDate)) / (1000 * 60 * 60 * 24)),
    }));
    
    if (defaulter) {
      // Update existing defaulter record
      defaulter.defaultDetails.outstandingAmount = data.totalDue;
      defaulter.defaultDetails.yearsInDefault = years;
      defaulter.defaultDetails.oldestUnpaidYear = oldestBill.financialYear;
      defaulter.defaultDetails.interestAccrued = defaulter.calculateInterest();
      defaulter.defaultDetails.penaltyAmount = data.totalDue * 0.05; // 5% penalty
      defaulter.defaultDetails.totalDue = data.totalDue + defaulter.defaultDetails.interestAccrued + defaulter.defaultDetails.penaltyAmount;
      defaulter.unpaidBills = unpaidBills;
      
      await defaulter.save();
    } else {
      // Create new defaulter record
      const interest = (data.totalDue * 12 * years) / 100;
      const penalty = data.totalDue * 0.05;
      
      defaulter = await TaxDefaulter.create({
        property: data.property,
        user: data.user,
        defaultDetails: {
          outstandingAmount: data.totalDue,
          yearsInDefault: years,
          oldestUnpaidYear: oldestBill.financialYear,
          interestAccrued: interest,
          penaltyAmount: penalty,
          totalDue: data.totalDue + interest + penalty,
          firstDefaultDate: oldestBill.dueDate,
        },
        unpaidBills,
      });
    }
    
    results.push(defaulter);
  }
  
  return results;
};

/**
 * Get all defaulters (Admin)
 */
export const getAllDefaulters = async (filters = {}) => {
  const query = {};
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.riskCategory) {
    query.riskCategory = filters.riskCategory;
  }
  
  if (filters.minAmount) {
    query['defaultDetails.totalDue'] = { $gte: parseFloat(filters.minAmount) };
  }
  
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;
  
  const [defaulters, total] = await Promise.all([
    TaxDefaulter.find(query)
      .populate('user', 'email profile')
      .populate('property', 'propertyDetails')
      .populate('assignedOfficer', 'profile')
      .sort({ 'defaultDetails.totalDue': -1 })
      .skip(skip)
      .limit(limit),
    TaxDefaulter.countDocuments(query),
  ]);
  
  return {
    defaulters,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

/**
 * Get defaulter by ID
 */
export const getDefaulterById = async (defaulterId) => {
  const defaulter = await TaxDefaulter.findById(defaulterId)
    .populate('user', 'email profile')
    .populate('property')
    .populate('assignedOfficer', 'profile')
    .populate('unpaidBills.billId');
  
  if (!defaulter) {
    throw new Error('Defaulter record not found');
  }
  
  return defaulter;
};

/**
 * Send notice to defaulter
 */
export const sendNoticeToDefaulter = async (defaulterId, noticeData, senderId) => {
  const { noticeType, sentVia, message } = noticeData;
  
  const defaulter = await TaxDefaulter.findById(defaulterId)
    .populate('user')
    .populate('property');
  
  if (!defaulter) {
    throw new Error('Defaulter record not found');
  }
  
  // Generate notice number
  const noticeCount = defaulter.noticesSent.length + 1;
  const noticeNumber = `NOTICE/${new Date().getFullYear()}/${String(noticeCount).padStart(6, '0')}`;
  
  // Add notice to defaulter record
  defaulter.noticesSent.push({
    noticeNumber,
    noticeType,
    sentVia,
    sentDate: new Date(),
  });
  
  defaulter.lastContactedDate = new Date();
  
  await defaulter.save();
  
  // Send email if applicable
  if (sentVia === 'email' || sentVia === 'both') {
    await sendEmail({
      to: defaulter.user.email,
      subject: `${noticeType.replace('_', ' ').toUpperCase()} - Property Tax Dues`,
      html: `
        <h2>Tax Payment Notice</h2>
        <p>Dear ${defaulter.user.profile.firstName},</p>
        <p>This is a ${noticeType.replace('_', ' ')} regarding your outstanding property tax dues.</p>
        <p><strong>Notice Number:</strong> ${noticeNumber}</p>
        <p><strong>Property:</strong> ${defaulter.property.propertyDetails.name}</p>
        <p><strong>Total Due:</strong> ₹${defaulter.defaultDetails.totalDue.toFixed(2)}</p>
        <p><strong>Years in Default:</strong> ${defaulter.defaultDetails.yearsInDefault}</p>
        <br>
        <p>${message || 'Please clear your dues immediately to avoid legal action.'}</p>
        <br>
        <p>Municipal Corporation</p>
      `,
    });
  }
  
  return defaulter;
};

/**
 * Take recovery action
 */
export const takeRecoveryAction = async (defaulterId, actionData, officerId) => {
  const { actionType, remarks, documents } = actionData;
  
  const defaulter = await TaxDefaulter.findById(defaulterId);
  
  if (!defaulter) {
    throw new Error('Defaulter record not found');
  }
  
  defaulter.recoveryActions.push({
    actionType,
    actionBy: officerId,
    remarks,
    documents: documents || [],
    status: 'executed',
  });
  
  await defaulter.save();
  
  return defaulter;
};

/**
 * Offer settlement
 */
export const offerSettlement = async (defaulterId, settlementData) => {
  const { waiverPercentage, installments, validityDays } = settlementData;
  
  const defaulter = await TaxDefaulter.findById(defaulterId);
  
  if (!defaulter) {
    throw new Error('Defaulter record not found');
  }
  
  const principalAmount = defaulter.defaultDetails.outstandingAmount;
  const waiverAmount = (principalAmount * waiverPercentage) / 100;
  const finalAmount = principalAmount - waiverAmount;
  const monthlyAmount = finalAmount / installments;
  
  const firstInstallmentDate = new Date();
  firstInstallmentDate.setMonth(firstInstallmentDate.getMonth() + 1);
  
  const validUpto = new Date();
  validUpto.setDate(validUpto.getDate() + (validityDays || 30));
  
  defaulter.settlementOffer = {
    isOffered: true,
    offerDate: new Date(),
    principalAmount,
    waiverAmount,
    waiverPercentage,
    finalAmount,
    installments,
    monthlyAmount,
    firstInstallmentDate,
    validUpto,
  };
  
  defaulter.status = 'under_settlement';
  
  await defaulter.save();
  
  return defaulter;
};

/**
 * Accept settlement offer
 */
export const acceptSettlementOffer = async (defaulterId, userId) => {
  const defaulter = await TaxDefaulter.findOne({
    _id: defaulterId,
    user: userId,
  });
  
  if (!defaulter) {
    throw new Error('Defaulter record not found');
  }
  
  if (!defaulter.settlementOffer.isOffered) {
    throw new Error('No settlement offer available');
  }
  
  if (new Date() > new Date(defaulter.settlementOffer.validUpto)) {
    throw new Error('Settlement offer has expired');
  }
  
  defaulter.settlementOffer.accepted = true;
  defaulter.settlementOffer.acceptedDate = new Date();
  
  await defaulter.save();
  
  return defaulter;
};

/**
 * Initiate legal proceedings
 */
export const initiateLegalProceedings = async (defaulterId, legalData, officerId) => {
  const { caseNumber, courtName, lawyerDetails } = legalData;
  
  const defaulter = await TaxDefaulter.findById(defaulterId);
  
  if (!defaulter) {
    throw new Error('Defaulter record not found');
  }
  
  defaulter.legalProceedings = {
    caseNumber,
    courtName,
    filingDate: new Date(),
    status: 'filed',
    lawyerDetails,
  };
  
  defaulter.status = 'legal_proceedings';
  
  defaulter.recoveryActions.push({
    actionType: 'court_proceedings',
    actionBy: officerId,
    remarks: `Legal case filed: ${caseNumber}`,
    status: 'executed',
  });
  
  await defaulter.save();
  
  return defaulter;
};

/**
 * Resolve defaulter (after payment)
 */
export const resolveDefaulter = async (defaulterId) => {
  const defaulter = await TaxDefaulter.findById(defaulterId);
  
  if (!defaulter) {
    throw new Error('Defaulter record not found');
  }
  
  defaulter.status = 'resolved';
  
  await defaulter.save();
  
  return defaulter;
};

/**
 * Get defaulter statistics
 */
export const getDefaulterStatistics = async () => {
  const [
    totalDefaulters,
    totalDue,
    riskCategoryWise,
    statusWise,
    topDefaulters,
  ] = await Promise.all([
    TaxDefaulter.countDocuments({ status: { $in: ['active', 'under_settlement', 'legal_proceedings'] } }),
    
    TaxDefaulter.aggregate([
      { $match: { status: { $in: ['active', 'under_settlement', 'legal_proceedings'] } } },
      { $group: { _id: null, total: { $sum: '$defaultDetails.totalDue' } } },
    ]),
    
    TaxDefaulter.aggregate([
      { $match: { status: { $in: ['active', 'under_settlement', 'legal_proceedings'] } } },
      { $group: { _id: '$riskCategory', count: { $sum: 1 }, amount: { $sum: '$defaultDetails.totalDue' } } },
    ]),
    
    TaxDefaulter.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$defaultDetails.totalDue' } } },
    ]),
    
    TaxDefaulter.find({ status: { $in: ['active', 'under_settlement', 'legal_proceedings'] } })
      .sort({ 'defaultDetails.totalDue': -1 })
      .limit(10)
      .populate('user', 'email profile')
      .populate('property', 'propertyDetails'),
  ]);
  
  return {
    totalDefaulters,
    totalDue: totalDue[0]?.total || 0,
    riskCategoryWise,
    statusWise,
    topDefaulters,
  };
};
