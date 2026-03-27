import transporter from '../config/email.js';
import { config } from '../config/index.js';
import logger from './logger.js';

/**
 * Send email utility (disabled)
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  const info = await transporter.sendMail({
    from: config.email.from,
    to,
    subject,
    text,
    html,
  });

  logger.info(`Email skipped (disabled): ${info.messageId}`);
  return { success: true, messageId: info.messageId, disabled: true };
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to ITMS - Integrated Tax Management System';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Welcome to ITMS!</h2>
      <p>Dear ${user.profile.firstName},</p>
      <p>Thank you for registering with the Integrated Tax Management System.</p>
      <p>You can now:</p>
      <ul>
        <li>Calculate your taxes accurately</li>
        <li>Make secure online payments</li>
        <li>Upload and manage tax documents</li>
        <li>Track compliance and deadlines</li>
      </ul>
      <p>Get started by completing your tax profile.</p>
      <br>
      <p>Best regards,<br>ITMS Team</p>
    </div>
  `;
  
  await sendEmail({
    to: user.email,
    subject,
    html,
    text: `Welcome to ITMS, ${user.profile.firstName}!`,
  });
};

/**
 * Send payment success email
 */
export const sendPaymentSuccessEmail = async (user, transaction) => {
  const subject = `Payment Successful - ${transaction.transactionId}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">Payment Successful</h2>
      <p>Dear ${user.profile.firstName},</p>
      <p>Your payment has been successfully processed.</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Transaction ID:</strong> ${transaction.transactionId}</p>
        <p><strong>Amount:</strong> ₹${transaction.amount.toLocaleString('en-IN')}</p>
        <p><strong>Type:</strong> ${transaction.type.replace('_', ' ').toUpperCase()}</p>
        <p><strong>Date:</strong> ${new Date(transaction.paidAt).toLocaleString('en-IN')}</p>
      </div>
      <p>Your receipt has been generated and is available in your dashboard.</p>
      <br>
      <p>Best regards,<br>ITMS Team</p>
    </div>
  `;
  
  await sendEmail({
    to: user.email,
    subject,
    html,
    text: `Payment of ₹${transaction.amount} successful. Transaction ID: ${transaction.transactionId}`,
  });
};

/**
 * Send payment failed email
 */
export const sendPaymentFailedEmail = async (user, transaction) => {
  const subject = `Payment Failed - ${transaction.orderId}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ef4444;">Payment Failed</h2>
      <p>Dear ${user.profile.firstName},</p>
      <p>Unfortunately, your payment could not be processed.</p>
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
        <p><strong>Order ID:</strong> ${transaction.orderId}</p>
        <p><strong>Amount:</strong> ₹${transaction.amount.toLocaleString('en-IN')}</p>
        <p><strong>Reason:</strong> ${transaction.failureReason || 'Unknown error'}</p>
      </div>
      <p>Please try again or contact support if the issue persists.</p>
      <br>
      <p>Best regards,<br>ITMS Team</p>
    </div>
  `;
  
  await sendEmail({
    to: user.email,
    subject,
    html,
    text: `Payment of ₹${transaction.amount} failed. Please try again.`,
  });
};

/**
 * Send tax deadline reminder
 */
export const sendDeadlineReminderEmail = async (user, deadline) => {
  const subject = `Tax Deadline Reminder - ${deadline.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">Important Deadline Reminder</h2>
      <p>Dear ${user.profile.firstName},</p>
      <p>This is a reminder about an upcoming tax deadline:</p>
      <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <h3>${deadline.title}</h3>
        <p><strong>Due Date:</strong> ${new Date(deadline.dueDate).toLocaleDateString('en-IN')}</p>
        <p>${deadline.description}</p>
      </div>
      <p>Please ensure compliance to avoid penalties.</p>
      <br>
      <p>Best regards,<br>ITMS Team</p>
    </div>
  `;
  
  await sendEmail({
    to: user.email,
    subject,
    html,
    text: `Reminder: ${deadline.title} due on ${new Date(deadline.dueDate).toLocaleDateString('en-IN')}`,
  });
};

/**
 * Send document verification email
 */
export const sendDocumentVerificationEmail = async (user, document, status) => {
  const subject = `Document ${status === 'verified' ? 'Verified' : 'Rejected'} - ${document.title}`;
  const color = status === 'verified' ? '#10b981' : '#ef4444';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${color};">Document ${status === 'verified' ? 'Verified' : 'Rejected'}</h2>
      <p>Dear ${user.profile.firstName},</p>
      <p>Your document has been ${status}.</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Document:</strong> ${document.title}</p>
        <p><strong>Type:</strong> ${document.type.replace('_', ' ').toUpperCase()}</p>
        ${status === 'rejected' ? `<p><strong>Reason:</strong> ${document.verification.rejectionReason}</p>` : ''}
      </div>
      ${status === 'rejected' ? '<p>Please re-upload the correct document.</p>' : '<p>Thank you for your compliance.</p>'}
      <br>
      <p>Best regards,<br>ITMS Team</p>
    </div>
  `;
  
  await sendEmail({
    to: user.email,
    subject,
    html,
    text: `Your document "${document.title}" has been ${status}.`,
  });
};
