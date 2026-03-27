import logger from '../utils/logger.js';

// Email sending is disabled; provide a stub transporter to keep callers working
export const transporter = {
  async sendMail(options) {
    logger.info(`[email disabled] To: ${options?.to || 'n/a'}, Subject: ${options?.subject || 'n/a'}`);
    return { messageId: 'email-disabled' };
  },
};

export default transporter;
