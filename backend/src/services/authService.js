import User from '../models/User.js';
import TaxProfile from '../models/TaxProfile.js';
import { generateTokens } from '../utils/jwt.js';
import { sendWelcomeEmail } from '../utils/email.js';
import logger from '../utils/logger.js';

/**
 * Register new user
 */
export const registerUser = async (userData) => {
  const { email, password, firstName, lastName, role = 'taxpayer' } = userData;
  
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email already registered');
  }
  
  // Create user
  const user = await User.create({
    email,
    password,
    role,
    profile: {
      firstName,
      lastName,
    },
  });
  
  // Generate tokens
  const tokens = generateTokens(user._id);
  
  // Save refresh token
  user.refreshToken = tokens.refreshToken;
  await user.save();
  
  // Send welcome email (non-blocking)
  sendWelcomeEmail(user).catch(err => 
    logger.error(`Welcome email failed: ${err.message}`)
  );
  
  return {
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      profile: user.profile,
    },
    tokens,
  };
};

/**
 * Login user
 */
export const loginUser = async (email, password) => {
  // Find user and include password
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  if (!user.isActive) {
    throw new Error('Account is deactivated');
  }
  
  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }
  
  // Generate tokens
  const tokens = generateTokens(user._id);
  
  // Save refresh token and last login
  user.refreshToken = tokens.refreshToken;
  user.lastLogin = new Date();
  await user.save();
  
  return {
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      profile: user.profile,
    },
    tokens,
  };
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken) => {
  const user = await User.findOne({ refreshToken });
  
  if (!user) {
    throw new Error('Invalid refresh token');
  }
  
  // Generate new tokens
  const tokens = generateTokens(user._id);
  
  // Update refresh token
  user.refreshToken = tokens.refreshToken;
  await user.save();
  
  return tokens;
};

/**
 * Logout user
 */
export const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
  return true;
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).populate('taxProfile');
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Update profile fields
  if (updateData.firstName) user.profile.firstName = updateData.firstName;
  if (updateData.lastName) user.profile.lastName = updateData.lastName;
  if (updateData.phone) user.profile.phone = updateData.phone;
  if (updateData.dateOfBirth) user.profile.dateOfBirth = updateData.dateOfBirth;
  if (updateData.address) user.profile.address = { ...user.profile.address, ...updateData.address };
  
  await user.save();
  
  return user;
};

/**
 * Change password
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  return true;
};
