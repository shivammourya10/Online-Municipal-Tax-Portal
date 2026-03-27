import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'payment_success',
      'payment_failed',
      'tax_due',
      'deadline_reminder',
      'document_verified',
      'document_rejected',
      'compliance_alert',
      'return_filed',
      'refund_processed',
      'system_announcement',
      'other'
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  channel: {
    email: {
      type: Boolean,
      default: true,
    },
    sms: {
      type: Boolean,
      default: false,
    },
    push: {
      type: Boolean,
      default: true,
    },
  },
  status: {
    sent: {
      type: Boolean,
      default: false,
    },
    sentAt: Date,
    error: String,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
  actionUrl: String,
  metadata: mongoose.Schema.Types.Mixed,
  expiresAt: Date,
}, {
  timestamps: true,
});

// Indexes
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
