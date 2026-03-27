import WaterConnection from '../models/WaterConnection.js';
import Property from '../models/Property.js';
import mongoose from 'mongoose';

/**
 * Apply for new water connection
 */
export const applyForWaterConnection = async (userId, applicationData) => {
  const { propertyId, connectionType, applicantDetails, pipeSize, numberOfTaps } = applicationData;
  
  // Check if property exists
  const property = await Property.findOne({ _id: propertyId, user: userId });
  if (!property) {
    throw new Error('Property not found');
  }
  
  // Check if connection already exists
  const existingConnection = await WaterConnection.findOne({ 
    property: propertyId, 
    'connectionDetails.connectionStatus': { $in: ['active', 'pending'] }
  });
  
  if (existingConnection) {
    throw new Error('Water connection already exists for this property');
  }
  
  // Generate connection number
  const count = await WaterConnection.countDocuments();
  const year = new Date().getFullYear();
  const connectionNumber = `WC/${year}/${String(count + 1).padStart(8, '0')}`;
  
  // Generate application number
  const applicationNumber = `WCA/${year}/${String(count + 1).padStart(8, '0')}`;
  
  // Calculate charges based on connection type
  let charges = { fixedMonthlyCharge: 100, ratePerUnit: 5, connectionFee: 1000, securityDeposit: 2000 };
  if (connectionType === 'commercial') {
    charges = { fixedMonthlyCharge: 300, ratePerUnit: 8, connectionFee: 3000, securityDeposit: 5000 };
  } else if (connectionType === 'industrial') {
    charges = { fixedMonthlyCharge: 500, ratePerUnit: 10, connectionFee: 5000, securityDeposit: 10000 };
  }
  
  const waterConnection = await WaterConnection.create({
    user: userId,
    property: propertyId,
    connectionNumber,
    connectionType,
    connectionDetails: {
      pipeSize: pipeSize || '15mm',
      numberOfTaps: numberOfTaps || 1,
      connectionStatus: 'pending',
    },
    charges,
    applicationDetails: {
      applicationNumber,
      applicationDate: new Date(),
      ...applicantDetails,
    },
  });
  
  return waterConnection;
};

/**
 * Get user's water connections
 */
export const getUserWaterConnections = async (userId, filters = {}) => {
  const query = { user: userId };
  
  if (filters.connectionStatus) {
    query['connectionDetails.connectionStatus'] = filters.connectionStatus;
  }
  
  const connections = await WaterConnection.find(query)
    .populate('property', 'propertyDetails dimensions')
    .sort({ createdAt: -1 });
  
  return connections;
};

/**
 * Get water connection by ID
 */
export const getWaterConnectionById = async (connectionId, userId = null) => {
  const query = { _id: connectionId };
  if (userId) {
    query.user = userId;
  }
  
  const connection = await WaterConnection.findOne(query)
    .populate('property')
    .populate('user', 'email profile')
    .populate('approvedBy', 'profile');
  
  if (!connection) {
    throw new Error('Water connection not found');
  }
  
  return connection;
};

/**
 * Approve water connection (Admin/Officer)
 */
export const approveWaterConnection = async (connectionId, officerId, meterNumber) => {
  const connection = await WaterConnection.findById(connectionId);
  
  if (!connection) {
    throw new Error('Water connection not found');
  }
  
  connection.connectionDetails.connectionStatus = 'active';
  connection.connectionDetails.meterNumber = meterNumber;
  connection.connectionDetails.dateOfConnection = new Date();
  connection.approvedBy = officerId;
  connection.approvedDate = new Date();
  
  await connection.save();
  
  // Update property
  await Property.findByIdAndUpdate(connection.property, {
    'amenities.waterConnection': true,
  });
  
  return connection;
};

/**
 * Add meter reading
 */
export const addMeterReading = async (connectionId, readingData, readerId) => {
  const { month, currentReading, photo } = readingData;
  
  const connection = await WaterConnection.findById(connectionId);
  
  if (!connection) {
    throw new Error('Water connection not found');
  }
  
  // Get previous reading
  let previousReading = 0;
  if (connection.monthlyReadings && connection.monthlyReadings.length > 0) {
    previousReading = connection.monthlyReadings[connection.monthlyReadings.length - 1].currentReading;
  }
  
  const consumption = currentReading - previousReading;
  
  // Add reading
  connection.monthlyReadings.push({
    month: new Date(month),
    previousReading,
    currentReading,
    consumption,
    readingDate: new Date(),
    meterReader: readerId,
    photo,
  });
  
  // Generate bill
  const billDetails = connection.calculateBill(consumption);
  const billNumber = `WB/${new Date().getFullYear()}/${String(connection.billingHistory.length + 1).padStart(8, '0')}`;
  
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 15); // 15 days from now
  
  connection.billingHistory.push({
    billNumber,
    month: new Date(month),
    consumption,
    ...billDetails,
    dueDate,
    status: 'pending',
  });
  
  await connection.save();
  
  return { connection, bill: billDetails };
};

/**
 * Get all water connections (Admin)
 */
export const getAllWaterConnections = async (filters = {}) => {
  const query = {};
  
  if (filters.connectionStatus) {
    query['connectionDetails.connectionStatus'] = filters.connectionStatus;
  }
  
  if (filters.connectionType) {
    query.connectionType = filters.connectionType;
  }
  
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;
  
  const [connections, total] = await Promise.all([
    WaterConnection.find(query)
      .populate('user', 'email profile')
      .populate('property', 'propertyDetails')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    WaterConnection.countDocuments(query),
  ]);
  
  return {
    connections,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

/**
 * Disconnect water connection
 */
export const disconnectWaterConnection = async (connectionId, reason) => {
  const connection = await WaterConnection.findById(connectionId);
  
  if (!connection) {
    throw new Error('Water connection not found');
  }
  
  connection.connectionDetails.connectionStatus = 'disconnected';
  connection.notes = reason;
  
  await connection.save();
  
  return connection;
};

/**
 * Get water bill
 */
export const getWaterBill = async (connectionId, billId) => {
  const connection = await WaterConnection.findById(connectionId)
    .populate('user', 'email profile')
    .populate('property');
  
  if (!connection) {
    throw new Error('Water connection not found');
  }
  
  const bill = connection.billingHistory.id(billId);
  
  if (!bill) {
    throw new Error('Bill not found');
  }
  
  return { connection, bill };
};

/**
 * Pay water bill
 */
export const payWaterBill = async (connectionId, billId, paymentData) => {
  const connection = await WaterConnection.findById(connectionId);
  
  if (!connection) {
    throw new Error('Water connection not found');
  }
  
  const bill = connection.billingHistory.id(billId);
  
  if (!bill) {
    throw new Error('Bill not found');
  }
  
  bill.paidAmount = paymentData.amount;
  bill.status = 'paid';
  bill.paidAt = new Date();
  bill.paymentId = paymentData.transactionId;
  
  // Update arrears
  connection.arrears = Math.max(0, connection.arrears - paymentData.amount);
  
  await connection.save();
  
  return { connection, bill };
};
