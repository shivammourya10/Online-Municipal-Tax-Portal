import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { config } from './index.js';
import logger from '../utils/logger.js';

// Check if Cloudinary is configured
const isCloudinaryConfigured = config.cloudinary.cloudName && 
                                config.cloudinary.apiKey && 
                                config.cloudinary.apiSecret &&
                                config.cloudinary.cloudName !== 'demo' &&
                                config.cloudinary.cloudName !== 'your-cloud-name-here';

let cloudinaryInstance = null;

if (isCloudinaryConfigured) {
  try {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
    });
    cloudinaryInstance = cloudinary;
    logger.info('Cloudinary configured successfully');
  } catch (error) {
    logger.error(`Cloudinary configuration failed: ${error.message}`);
  }
} else {
  logger.warn('Cloudinary not configured - document upload will be disabled');
}

// Create storage for different document types
const createStorage = (folder) => {
  if (!cloudinaryInstance) {
    logger.error('Cloudinary not configured - cannot create storage');
    return null;
  }
  
  return new CloudinaryStorage({
    cloudinary: cloudinaryInstance,
    params: async (req, file) => {
      // Use 'raw' for PDFs, 'image' for images
      const resourceType = file.mimetype === 'application/pdf' ? 'raw' : 'image';
      
      return {
        folder: `itms/${folder}`,
        allowed_formats: ['jpg', 'jpeg', 'pdf'],
        resource_type: resourceType,
        // Only apply transformations to images, not PDFs
        transformation: resourceType === 'image' ? [{ quality: 'auto' }] : undefined,
      };
    },
  });
};

// Storage instances
export const documentStorage = isCloudinaryConfigured ? createStorage('documents') : null;
export const profileStorage = isCloudinaryConfigured ? createStorage('profiles') : null;
export const receiptStorage = isCloudinaryConfigured ? createStorage('receipts') : null;

// Multer upload configurations
export const uploadDocument = multer({
  storage: documentStorage || multer.memoryStorage(),
  limits: {
    fileSize: config.upload.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    if (!isCloudinaryConfigured) {
      cb(new Error('Document upload is currently disabled. Please configure Cloudinary.'));
      return;
    }
    if (config.upload.allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${config.upload.allowedTypes.join(', ')}`));
    }
  },
});

export const uploadProfile = multer({
  storage: profileStorage || multer.memoryStorage(),
  limits: {
    fileSize: config.upload.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    if (!isCloudinaryConfigured) {
      cb(new Error('Profile upload is currently disabled. Please configure Cloudinary.'));
      return;
    }
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export const uploadReceipt = multer({
  storage: receiptStorage || multer.memoryStorage(),
  limits: {
    fileSize: config.upload.maxFileSize,
  },
});

// Utility function to delete file from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  if (!cloudinaryInstance) {
    logger.warn('Cloudinary not configured - cannot delete file');
    return;
  }
  
  try {
    const result = await cloudinaryInstance.uploader.destroy(publicId);
    logger.info(`File deleted from Cloudinary: ${publicId}`);
    return result;
  } catch (error) {
    logger.error(`Error deleting file from Cloudinary: ${error.message}`);
    throw error;
  }
};

export default cloudinaryInstance;
