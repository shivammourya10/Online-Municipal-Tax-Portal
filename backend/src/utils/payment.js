import crypto from 'crypto';

/**
 * Verify Razorpay payment signature
 */
export const verifyRazorpaySignature = (orderId, paymentId, signature, secret) => {
  const text = `${orderId}|${paymentId}`;
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(text)
    .digest('hex');
  
  return generatedSignature === signature;
};

/**
 * Generate payment receipt number
 */
export const generateReceiptNumber = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `RCPT${timestamp}${random}`.toUpperCase();
};

/**
 * Calculate installment amount
 */
export const calculateInstallments = (totalAmount, numberOfInstallments) => {
  const installmentAmount = Math.ceil(totalAmount / numberOfInstallments);
  return {
    installmentAmount,
    totalInstallments: numberOfInstallments,
    totalAmount: installmentAmount * numberOfInstallments,
  };
};
