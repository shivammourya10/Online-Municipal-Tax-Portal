import MunicipalBill from '../models/MunicipalBill.js';
import Property from '../models/Property.js';
import WaterConnection from '../models/WaterConnection.js';

/**
 * Generate consolidated municipal tax bill
 */
export const generateMunicipalBill = async (propertyId, financialYear, quarter = 'Annual') => {
  const property = await Property.findById(propertyId).populate('user');
  
  if (!property) {
    throw new Error('Property not found');
  }
  
  // Check if bill already exists
  const existingBill = await MunicipalBill.findOne({
    property: propertyId,
    financialYear,
    quarter,
  });
  
  if (existingBill) {
    throw new Error('Bill already generated for this period');
  }
  
  // Calculate property tax
  const propertyTaxAmount = property.calculatePropertyTax();
  
  // Get water connection if exists
  let waterTaxAmount = 0;
  let waterConsumption = 0;
  const waterConnection = await WaterConnection.findOne({
    property: propertyId,
    'connectionDetails.connectionStatus': 'active',
  });
  
  if (waterConnection) {
    // Get latest bill or calculate
    if (waterConnection.billingHistory && waterConnection.billingHistory.length > 0) {
      const latestBill = waterConnection.billingHistory[waterConnection.billingHistory.length - 1];
      waterTaxAmount = latestBill.totalAmount || 0;
      waterConsumption = latestBill.consumption || 0;
    }
  }
  
  // Calculate other taxes(percentage of property tax)
  const sewerageTax = propertyTaxAmount * 0.15; // 15% of property tax
  const streetLightTax = propertyTaxAmount * 0.10; // 10% of property tax
  const solidWasteTax = propertyTaxAmount * 0.08; // 8% of property tax
  const healthTax = propertyTaxAmount * 0.05; // 5% of property tax
  const educationCess = propertyTaxAmount * 0.02; // 2% of property tax
  
  // Get previous arrears
  const previousBills = await MunicipalBill.find({
    property: propertyId,
    status: { $in: ['pending', 'overdue', 'partial'] },
  });
  
  let arrears = {
    previousDues: 0,
    interest: 0,
    penalty: 0,
  };
  
  previousBills.forEach(bill => {
    arrears.previousDues += bill.balanceAmount || 0;
    
    // Calculate interest on overdue bills
    const daysOverdue = Math.floor((new Date() - new Date(bill.dueDate)) / (1000 * 60 * 60 * 24));
    if (daysOverdue > 30) {
      const interest = (bill.balanceAmount * 12 * daysOverdue) / (365 * 100); // 12% annual interest
      arrears.interest += interest;
    }
    
    // Penalty for overdue
    if (daysOverdue > 60) {
      arrears.penalty += bill.balanceAmount * 0.05; // 5% penalty
    }
  });
  
  // Calculate discounts
  let discounts = {
    earlyPaymentDiscount: {},
    seniorCitizenDiscount: {},
    disabledPersonDiscount: {},
  };
  
  // Early payment discount - 5% if paid within first month
  const grossAmount = propertyTaxAmount + waterTaxAmount + sewerageTax + streetLightTax + solidWasteTax + healthTax + educationCess;
  discounts.earlyPaymentDiscount = {
    percentage: 5,
    amount: grossAmount * 0.05,
  };
  
  // Senior citizen discount - Check user age
  const userAge = property.user?.profile?.dateOfBirth 
    ? Math.floor((new Date() - new Date(property.user.profile.dateOfBirth)) / (1000 * 60 * 60 * 24 * 365))
    : 0;
    
  if (userAge >= 60) {
    discounts.seniorCitizenDiscount = {
      percentage: 10,
      amount: propertyTaxAmount * 0.10,
    };
  }
  
  // Calculate due dates
  const dueDate = new Date();
  dueDate.setMonth(dueDate.getMonth() + 1); // 1 month from now
  
  const paymentDeadline = new Date();
  paymentDeadline.setMonth(paymentDeadline.getMonth() + 3); // 3 months from now
  
  // Create bill
  const bill = await MunicipalBill.create({
    property: propertyId,
    user: property.user._id,
    financialYear,
    quarter,
    billPeriod: {
      from: new Date(`${financialYear.split('-')[0]}-04-01`),
      to: new Date(`${financialYear.split('-')[1]}-03-31`),
    },
    taxes: {
      propertyTax: {
        assessedValue: property.assessment.currentMarketValue,
        rate: property.taxDetails.taxRate,
        amount: propertyTaxAmount,
      },
      waterTax: {
        consumption: waterConsumption,
        amount: waterTaxAmount,
      },
      sewerageTax: {
        rate: 15,
        amount: sewerageTax,
      },
      streetLightTax: {
        rate: 10,
        amount: streetLightTax,
      },
      solidWasteTax: {
        rate: 8,
        amount: solidWasteTax,
      },
      healthTax: {
        rate: 5,
        amount: healthTax,
      },
      educationCess: {
        rate: 2,
        amount: educationCess,
      },
    },
    arrears,
    discounts,
    dueDate,
    paymentDeadline,
  });
  
  return bill;
};

/**
 * Get user's municipal bills
 */
export const getUserMunicipalBills = async (userId, filters = {}) => {
  const query = { user: userId };
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.financialYear) {
    query.financialYear = filters.financialYear;
  }
  
  const bills = await MunicipalBill.find(query)
    .populate('property', 'propertyDetails')
    .sort({ createdAt: -1 });
  
  return bills;
};

/**
 * Get bill by ID
 */
export const getMunicipalBillById = async (billId, userId = null) => {
  const query = { _id: billId };
  if (userId) {
    query.user = userId;
  }
  
  const bill = await MunicipalBill.findOne(query)
    .populate('property')
    .populate('user', 'email profile')
    .populate('payments.paymentId');
  
  if (!bill) {
    throw new Error('Bill not found');
  }
  
  return bill;
};

/**
 * Pay municipal bill
 */
export const payMunicipalBill = async (billId, paymentData) => {
  const { amount, transactionId, paymentMode, receiptNumber } = paymentData;
  
  const bill = await MunicipalBill.findById(billId);
  
  if (!bill) {
    throw new Error('Bill not found');
  }
  
  // Add payment
  bill.payments.push({
    paymentId: transactionId,
    amount,
    paidDate: new Date(),
    receiptNumber,
    paymentMode,
  });
  
  bill.paidAmount += amount;
  bill.balanceAmount = bill.netAmount - bill.paidAmount;
  
  if (bill.balanceAmount <= 0) {
    bill.status = 'paid';
    
    // Update property
    await Property.findByIdAndUpdate(bill.property, {
      'taxDetails.lastPaidDate': new Date(),
      'taxDetails.lastPaidAmount': amount,
      'taxDetails.lastReceiptNumber': receiptNumber,
      'taxDetails.pendingAmount': 0,
    });
  } else {
    bill.status = 'partial';
  }
  
  await bill.save();
  
  return bill;
};

/**
 * Get all bills (Admin)
 */
export const getAllMunicipalBills = async (filters = {}) => {
  const query = {};
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.financialYear) {
    query.financialYear = filters.financialYear;
  }
  
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;
  
  const [bills, total] = await Promise.all([
    MunicipalBill.find(query)
      .populate('user', 'email profile')
      .populate('property', 'propertyDetails')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    MunicipalBill.countDocuments(query),
  ]);
  
  return {
    bills,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

/**
 * Generate bills for all properties (Admin)
 */
export const generateBillsForAllProperties = async (financialYear, quarter = 'Annual') => {
  const properties = await Property.find({ status: 'active' });
  
  const results = {
    success: [],
    failed: [],
  };
  
  for (const property of properties) {
    try {
      const bill = await generateMunicipalBill(property._id, financialYear, quarter);
      results.success.push({ propertyId: property._id, billId: bill._id });
    } catch (error) {
      results.failed.push({ propertyId: property._id, error: error.message });
    }
  }
  
  return results;
};

/**
 * Get bill statistics (Admin)
 */
export const getMunicipalBillStatistics = async (financialYear) => {
  const query = financialYear ? { financialYear } : {};
  
  const [
    totalBills,
    totalAmount,
    collectedAmount,
    pendingAmount,
    statusWise,
  ] = await Promise.all([
    MunicipalBill.countDocuments(query),
    
    MunicipalBill.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$netAmount' } } },
    ]),
    
    MunicipalBill.aggregate([
      { $match: { ...query, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$paidAmount' } } },
    ]),
    
    MunicipalBill.aggregate([
      { $match: { ...query, status: { $in: ['pending', 'overdue', 'partial'] } } },
      { $group: { _id: null, total: { $sum: '$balanceAmount' } } },
    ]),
    
    MunicipalBill.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$netAmount' } } },
    ]),
  ]);
  
  return {
    totalBills,
    totalAmount: totalAmount[0]?.total || 0,
    collectedAmount: collectedAmount[0]?.total || 0,
    pendingAmount: pendingAmount[0]?.total || 0,
    collectionPercentage: totalAmount[0]?.total 
      ? ((collectedAmount[0]?.total || 0) / totalAmount[0].total) * 100 
      : 0,
    statusWise,
  };
};
