import express from 'express';
import * as documentController from '../controllers/documentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadDocument } from '../config/cloudinary.js';
import { auditLog } from '../middleware/audit.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Document routes
router.post('/', uploadDocument.single('file'), auditLog('document_upload', 'document'), documentController.uploadDocument);
router.get('/', documentController.getDocuments);
router.get('/pending/verification', authorize('admin', 'tax_officer'), documentController.getPendingDocuments);
router.get('/:id', documentController.getDocument);
router.put('/:id', auditLog('document_update', 'document'), documentController.updateDocument);
router.delete('/:id', auditLog('document_delete', 'document'), documentController.deleteDocument);
router.put('/:id/verify', authorize('admin', 'tax_officer'), auditLog('document_verify', 'document'), documentController.verifyDocument);
router.put('/:id/archive', documentController.archiveDocument);

export default router;
