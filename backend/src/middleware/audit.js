import AuditLog from '../models/AuditLog.js';
import logger from '../utils/logger.js';

/**
 * Audit logging middleware
 */
export const auditLog = (action, resource) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
      // Log after response
      setImmediate(async () => {
        try {
          await AuditLog.create({
            user: req.user?._id,
            action,
            resource,
            resourceId: req.params.id || data?.data?._id,
            details: {
              method: req.method,
              endpoint: req.originalUrl,
              statusCode: res.statusCode,
              ipAddress: req.ip || req.connection.remoteAddress,
              userAgent: req.headers['user-agent'],
            },
            severity: res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warning' : 'info',
            success: res.statusCode < 400,
          });
        } catch (error) {
          logger.error(`Audit log failed: ${error.message}`);
        }
      });
      
      return originalJson(data);
    };
    
    next();
  };
};
