import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/response.js';

/**
 * Validation middleware
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
    }));
    
    return errorResponse(res, 'Validation failed', 400, extractedErrors);
  }
  
  next();
};
