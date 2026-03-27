import Stripe from 'stripe';
import { config } from './index.js';

export const stripeInstance = config.stripe.secretKey 
  ? new Stripe(config.stripe.secretKey) 
  : null;

export default stripeInstance;
