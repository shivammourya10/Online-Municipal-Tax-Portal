import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import xss from 'xss-clean';
import { config } from './config/index.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFound } from './middleware/error.js';
import logger from './utils/logger.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import taxRoutes from './routes/taxRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import taxProfileRoutes from './routes/taxProfileRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import waterConnectionRoutes from './routes/waterConnectionRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import buildingPlanRoutes from './routes/buildingPlanRoutes.js';
import municipalBillRoutes from './routes/municipalBillRoutes.js';
import taxDefaulterRoutes from './routes/taxDefaulterRoutes.js';

const app = express();

// Webhook routes (must be before body parser)
app.use('/api/webhooks', webhookRoutes);

// Security middleware
app.use(helmet());
app.use(xss());

// CORS configuration
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting
app.use('/api', apiLimiter);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ITMS API is running',
    timestamp: new Date(),
    environment: config.env,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tax', taxRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/tax-profile', taxProfileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/water-connections', waterConnectionRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/building-plans', buildingPlanRoutes);
app.use('/api/municipal-bills', municipalBillRoutes);
app.use('/api/tax-defaulters', taxDefaulterRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to ITMS API',
    version: '1.0.0',
    documentation: '/api/docs',
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;
