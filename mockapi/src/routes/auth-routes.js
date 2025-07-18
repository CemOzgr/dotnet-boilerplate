const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
const { mockData } = require('../mock-utils');
const router = express.Router();

const JWT_SECRET = 'mock-server-secret-key';
const JWT_REFRESH_SECRET = 'mock-server-refresh-secret-key';

// Helper function to generate tokens
function generateTokens(user) {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
}

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Validation
  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required',
      code: 'VALIDATION_ERROR'
    });
  }
  
  // Find user
  const user = mockData.users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({
      error: 'Invalid credentials',
      code: 'INVALID_CREDENTIALS'
    });
  }
  
  // Check password (in mock server, accept any password for development)
  // For demo purposes, accept: password123, test, admin, user, or any password length > 3
  const validPasswords = ['password123', 'test', 'admin', 'user'];
  const isValidPassword = validPasswords.includes(password) || password.length > 3;
  
  if (!isValidPassword) {
    return res.status(401).json({
      error: 'Invalid credentials',
      code: 'INVALID_CREDENTIALS'
    });
  }
  
  const tokens = generateTokens(user);
  
  res.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar
    },
    ...tokens,
    expiresIn: 900 // 15 minutes
  });
});

// POST /api/v1/auth/register
router.post('/register', async (req, res) => {
  const { email, password, username, firstName, lastName } = req.body;
  
  // Validation
  if (!email || !password || !username) {
    return res.status(400).json({
      error: 'Email, password, and username are required',
      code: 'VALIDATION_ERROR'
    });
  }
  
  // Check if user exists
  if (mockData.users.find(u => u.email === email)) {
    return res.status(409).json({
      error: 'User already exists',
      code: 'USER_EXISTS'
    });
  }
  
  // Create new user
  const newUser = {
    id: faker.string.uuid(),
    email,
    username,
    firstName: firstName || faker.person.firstName(),
    lastName: lastName || faker.person.lastName(),
    avatar: faker.image.avatar(),
    role: 'user',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  mockData.users.push(newUser);
  
  const tokens = generateTokens(newUser);
  
  res.status(201).json({
    user: {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      avatar: newUser.avatar
    },
    ...tokens,
    expiresIn: 900
  });
});

// POST /api/v1/auth/refresh
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({
      error: 'Refresh token is required',
      code: 'VALIDATION_ERROR'
    });
  }
  
  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = mockData.users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        code: 'INVALID_TOKEN'
      });
    }
    
    const tokens = generateTokens(user);
    
    res.json({
      ...tokens,
      expiresIn: 900
    });
  } catch (error) {
    res.status(401).json({
      error: 'Invalid refresh token',
      code: 'INVALID_TOKEN'
    });
  }
});

// POST /api/v1/auth/logout
router.post('/logout', (req, res) => {
  // In a real app, you'd invalidate the token
  res.json({
    message: 'Logged out successfully'
  });
});

// GET /api/v1/auth/me
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Access token is required',
      code: 'UNAUTHORIZED'
    });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = mockData.users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    res.status(401).json({
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }
});

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      error: 'Email is required',
      code: 'VALIDATION_ERROR'
    });
  }
  
  const user = mockData.users.find(u => u.email === email);
  if (!user) {
    // Don't reveal if user exists or not
    return res.json({
      message: 'If the email exists, a reset link has been sent'
    });
  }
  
  res.json({
    message: 'Password reset link sent to your email',
    resetToken: faker.string.alphanumeric(32) // Mock token
  });
});

// POST /api/v1/auth/reset-password
router.post('/reset-password', (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    return res.status(400).json({
      error: 'Token and new password are required',
      code: 'VALIDATION_ERROR'
    });
  }
  
  // Mock validation - in real app, verify token
  if (token.length < 10) {
    return res.status(400).json({
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }
  
  res.json({
    message: 'Password reset successfully'
  });
});

module.exports = router;
