import * as documentService from '../services/documentService.js';
import { successResponse } from '../utils/response.js';

/**
 * @route   POST /api/documents
 * @desc    Upload document
 * @access  Private
 */
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    console.log('File received:', {
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
    
    const documentData = {
      type: req.body.type,
      title: req.body.title,
      description: req.body.description,
      metadata: req.body.metadata ? JSON.parse(req.body.metadata) : {},
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
    };
    
    const document = await documentService.uploadDocument(req.user._id, documentData, req.file);
    
    console.log('Document created:', document._id);
    successResponse(res, 'Document uploaded successfully', document, 201);
  } catch (error) {
    console.error('Document upload error:', error);
    next(error);
  }
};

/**
 * @route   GET /api/documents
 * @desc    Get user documents
 * @access  Private
 */
export const getDocuments = async (req, res, next) => {
  try {
    const result = await documentService.getUserDocuments(req.user._id, req.query);
    
    successResponse(res, 'Documents retrieved successfully', result.documents);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/documents/:id
 * @desc    Get document by ID
 * @access  Private
 */
export const getDocument = async (req, res, next) => {
  try {
    const document = await documentService.getDocumentById(req.params.id, req.user._id);
    
    successResponse(res, 'Document retrieved successfully', document);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/documents/:id
 * @desc    Update document
 * @access  Private
 */
export const updateDocument = async (req, res, next) => {
  try {
    const document = await documentService.updateDocument(req.params.id, req.user._id, req.body);
    
    successResponse(res, 'Document updated successfully', document);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete document
 * @access  Private
 */
export const deleteDocument = async (req, res, next) => {
  try {
    await documentService.deleteDocument(req.params.id, req.user._id);
    
    successResponse(res, 'Document deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/documents/:id/verify
 * @desc    Verify document
 * @access  Admin/Tax Officer
 */
export const verifyDocument = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    
    const document = await documentService.verifyDocument(
      req.params.id,
      req.user._id,
      status,
      rejectionReason
    );
    
    successResponse(res, 'Document verification updated', document);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/documents/pending/verification
 * @desc    Get pending documents for verification
 * @access  Admin/Tax Officer
 */
export const getPendingDocuments = async (req, res, next) => {
  try {
    const result = await documentService.getPendingDocuments(req.query);
    
    successResponse(res, 'Pending documents retrieved successfully', result.documents);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/documents/:id/archive
 * @desc    Archive document
 * @access  Private
 */
export const archiveDocument = async (req, res, next) => {
  try {
    const document = await documentService.archiveDocument(req.params.id, req.user._id);
    
    successResponse(res, 'Document archived successfully', document);
  } catch (error) {
    next(error);
  }
};
