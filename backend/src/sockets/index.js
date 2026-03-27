import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });
  
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }
      
      socket.userId = user._id.toString();
      socket.userRole = user.role;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });
  
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.userId}`);
    
    // Join user's personal room
    socket.join(socket.userId);
    
    // Join role-based rooms
    if (socket.userRole === 'admin' || socket.userRole === 'tax_officer') {
      socket.join('admin_room');
    }
    
    // Handle payment status updates
    socket.on('payment:status', (data) => {
      logger.info(`Payment status update: ${data.transactionId}`);
      // Emit to user's room
      io.to(socket.userId).emit('payment:update', data);
    });
    
    // Handle notification updates
    socket.on('notification:new', (data) => {
      io.to(socket.userId).emit('notification:received', data);
    });
    
    // Handle dashboard updates (Admin)
    socket.on('dashboard:refresh', () => {
      if (socket.userRole === 'admin') {
        socket.emit('dashboard:updated', { timestamp: new Date() });
      }
    });
    
    // Typing indicators for chat (future feature)
    socket.on('chat:typing', (data) => {
      socket.broadcast.to('admin_room').emit('chat:userTyping', {
        userId: socket.userId,
        isTyping: data.isTyping,
      });
    });
    
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.userId}`);
    });
    
    socket.on('error', (error) => {
      logger.error(`Socket error: ${error.message}`);
    });
  });
  
  return io;
};

export const emitPaymentUpdate = (io, userId, data) => {
  io.to(userId.toString()).emit('payment:update', data);
};

export const emitNotification = (io, userId, notification) => {
  io.to(userId.toString()).emit('notification:received', notification);
};

export const emitDashboardUpdate = (io, data) => {
  io.to('admin_room').emit('dashboard:updated', data);
};
