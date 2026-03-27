import http from 'http';
import app from './src/app.js';
import { config } from './src/config/index.js';
import { connectDatabase } from './src/config/database.js';
import { initializeSocket } from './src/sockets/index.js';
import logger from './src/utils/logger.js';

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);

// Make io accessible to routes
app.set('io', io);

// Connect to database
connectDatabase();

// Start server
const PORT = config.port;

server.listen(PORT, () => {
  logger.info(`🚀 Server running in ${config.env} mode on port ${PORT}`);
  logger.info(`📊 Dashboard: ${config.clientUrl}`);
  logger.info(`🔌 WebSocket: Ready`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
  });
});
