import stripeInstance from '../config/stripe.js';
import Transaction from '../models/Transaction.js';
import Property from '../models/Property.js';
import logger from '../utils/logger.js';

/**
 * Handle Stripe webhook events
 */
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature if webhook secret is configured
    if (webhookSecret && stripeInstance) {
      event = stripeInstance.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // For testing without webhook secret, just parse the body
      event = JSON.parse(req.body.toString());
    }

    logger.info(`Stripe webhook received: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Find transaction by orderId (checkout session ID)
        const transaction = await Transaction.findOne({ orderId: session.id });
        
        if (transaction) {
          // Update transaction status
          transaction.status = 'success';
          transaction.paidAt = new Date();
          transaction.gatewayResponse = {
            stripePaymentIntentId: session.payment_intent,
            stripeSessionId: session.id,
          };
          await transaction.save();

          logger.info(`Transaction ${transaction.transactionId} marked as successful`);

          // Update property if propertyId exists
          const propertyId = transaction.metadata?.propertyId || transaction.property;
          if (propertyId) {
            const property = await Property.findById(propertyId);
            if (property) {
              property.taxDetails.pendingAmount = 0;
              property.taxDetails.lastPaymentDate = new Date();
              await property.save();
              logger.info(`Property ${propertyId} tax cleared after payment`);
            }
          }
        }
        break;
      }

      case 'checkout.session.expired':
      case 'payment_intent.payment_failed': {
        const session = event.data.object;
        const transaction = await Transaction.findOne({ orderId: session.id });
        
        if (transaction) {
          transaction.status = 'failed';
          transaction.failedAt = new Date();
          transaction.failureReason = 'Payment failed or session expired';
          await transaction.save();
          logger.info(`Transaction ${transaction.transactionId} marked as failed`);
        }
        break;
      }

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    logger.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
