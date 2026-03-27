import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { auditLog } from '../middleware/audit.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

// Public routes
router.post('/register', authLimiter, registerValidation, validate, auditLog('register', 'user'), authController.register);
router.post('/login', authLimiter, loginValidation, validate, auditLog('login', 'user'), authController.login);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.use(protect);

router.post('/logout', auditLog('logout', 'user'), authController.logout);
router.get('/me', authController.getMe);
router.put('/profile', auditLog('profile_update', 'user'), authController.updateProfile);
router.put('/change-password', changePasswordValidation, validate, auditLog('password_change', 'user'), authController.changePassword);

export default router;
