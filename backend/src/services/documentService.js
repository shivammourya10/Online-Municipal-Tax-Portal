import Document from '../models/Document.js';
import { deleteFromCloudinary } from '../config/cloudinary.js';
import { sendDocumentVerificationEmail } from '../utils/email.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

/**
 * Upload document
 */
export const uploadDocument = async (userId, documentData, file) => {
  // Cloudinary file structure from multer-storage-cloudinary
  const document = await Document.create({
    user: userId,
    type: documentData.type,
    title: documentData.title,
    description: documentData.description,
    file: {
      url: file.path,
      publicId: file.filename,
      format: file.mimetype?.split('/')[1] || 'unknown',
      size: file.size,
    },
    metadata: documentData.metadata || {},
    tags: documentData.tags || [],
  });
  
  logger.info(`Document uploaded: ${document._id} by user ${userId}`);
  return document;
};

/**
 * Get user documents
 */
export const getUserDocuments = async (userId, filters = {}) => {
  const query = { user: userId, isArchived: false };
  
  if (filters.type) query.type = filters.type;
  if (filters.status) query['verification.status'] = filters.status;
  if (filters.tags) query.tags = { $in: filters.tags };
  
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;
  
  const documents = await Document.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await Document.countDocuments(query);
  
  return {
    documents,
    pagination: { page, limit, total },
  };
};

/**
 * Get document by ID
 */
export const getDocumentById = async (documentId, userId) => {
  const document = await Document.findOne({
    _id: documentId,
    user: userId,
  });
  
  if (!document) {
    throw new Error('Document not found');
  }
  
  return document;
};

/**
 * Update document
 */
export const updateDocument = async (documentId, userId, updateData) => {
  const document = await Document.findOne({
    _id: documentId,
    user: userId,
  });
  
  if (!document) {
    throw new Error('Document not found');
  }
  
  if (updateData.title) document.title = updateData.title;
  if (updateData.description) document.description = updateData.description;
  if (updateData.metadata) document.metadata = { ...document.metadata, ...updateData.metadata };
  if (updateData.tags) document.tags = updateData.tags;
  
  await document.save();
  
  return document;
};

/**
 * Delete document
 */
export const deleteDocument = async (documentId, userId) => {
  const document = await Document.findOne({
    _id: documentId,
    user: userId,
  });
  
  if (!document) {
    throw new Error('Document not found');
  }
  
  // Delete from Cloudinary
  try {
    await deleteFromCloudinary(document.file.publicId);
  } catch (error) {
    logger.error(`Failed to delete file from Cloudinary: ${error.message}`);
  }
  
  // Delete from database
  await document.deleteOne();
  
  return true;
};

/**
 * Verify document (Admin/Tax Officer)
 */
export const verifyDocument = async (documentId, verifierId, status, rejectionReason = null) => {
  const document = await Document.findById(documentId).populate('user');
  
  if (!document) {
    throw new Error('Document not found');
  }
  
  document.verification.status = status;
  document.verification.verifiedBy = verifierId;
  document.verification.verifiedAt = new Date();
  
  if (status === 'rejected' && rejectionReason) {
    document.verification.rejectionReason = rejectionReason;
  }
  
  await document.save();
  
  // Send verification email (non-blocking)
  if (document.user) {
    sendDocumentVerificationEmail(document.user, document, status).catch(err =>
      logger.error(`Document verification email failed: ${err.message}`)
    );
  }
  
  return document;
};

/**
 * Archive document
 */
export const archiveDocument = async (documentId, userId) => {
  const document = await Document.findOne({
    _id: documentId,
    user: userId,
  });
  
  if (!document) {
    throw new Error('Document not found');
  }
  
  document.isArchived = true;
  await document.save();
  
  return document;
};

/**
 * Get documents pending verification (Admin/Tax Officer)
 */
export const getPendingDocuments = async (filters = {}) => {
  const query = { 'verification.status': 'pending' };
  
  if (filters.type) query.type = filters.type;
  
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;
  
  const documents = await Document.find(query)
    .populate('user', 'email profile')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await Document.countDocuments(query);
  
  return {
    documents,
    pagination: { page, limit, total },
  };
};

/**
 * Extract OCR data (placeholder for future integration)
 */
export const extractOCRData = async (documentId) => {
  const document = await Document.findById(documentId);
  
  if (!document) {
    throw new Error('Document not found');
  }
  
  // Placeholder for OCR integration (e.g., Google Vision API, Tesseract)
  // This would extract text/data from uploaded documents
  
  document.ocrData = {
    extracted: true,
    data: {
      // Sample extracted data
      message: 'OCR extraction not implemented. Integrate with OCR service.',
    },
    confidence: 0,
  };
  
  await document.save();
  
  return document;
};
