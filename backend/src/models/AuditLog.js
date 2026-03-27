import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'register',
      'password_change',
      'profile_update',
      'tax_calculation',
      'payment_initiated',
      'payment_completed',
      'payment_failed',
      'document_upload',
      'document_delete',
      'document_verify',
      'user_create',
      'user_update',
      'user_delete',
      'tax_rule_update',
      'property_add',
      'property_update',
      'property_delete',
      'property_verify',
      'report_generated',
      'other'
    ],
  },
  resource: {
    type: String,
    enum: ['user', 'tax_profile', 'transaction', 'document', 'notification', 'tax_rule', 'property', 'audit_log', 'other'],
  },
  resourceId: mongoose.Schema.Types.ObjectId,
  details: {
    method: String,
    endpoint: String,
    statusCode: Number,
    ipAddress: String,
    userAgent: String,
    changes: mongoose.Schema.Types.Mixed,
    previousValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    error: String,
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'info',
  },
  success: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ resource: 1 });
auditLogSchema.index({ severity: 1 });
auditLogSchema.index({ createdAt: -1 });

// TTL Index - automatically delete logs older than 90 days
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
