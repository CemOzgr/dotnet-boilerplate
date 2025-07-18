const express = require('express');
const jwt = require('jsonwebtoken');
const { faker } = require('@faker-js/faker');
const { mockData } = require('../mock-utils');
const router = express.Router();

const JWT_SECRET = 'mock-server-secret-key';

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
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
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }
}

// GET /api/v1/users/profile
router.get('/profile', authenticateToken, (req, res) => {
  const user = mockData.users.find(u => u.id === req.user.userId);
  
  if (!user) {
    return res.status(404).json({
      error: 'User not found',
      code: 'USER_NOT_FOUND'
    });
  }
  
  res.json({
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    role: user.role,
    isActive: user.isActive,
    settings: user.settings || {
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        sms: false
      }
    },
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  });
});

// PUT /api/v1/users/profile
router.put('/profile', authenticateToken, (req, res) => {
  const { firstName, lastName, username } = req.body;
  const userIndex = mockData.users.findIndex(u => u.id === req.user.userId);
  
  if (userIndex === -1) {
    return res.status(404).json({
      error: 'User not found',
      code: 'USER_NOT_FOUND'
    });
  }
  
  // Update user
  if (firstName) mockData.users[userIndex].firstName = firstName;
  if (lastName) mockData.users[userIndex].lastName = lastName;
  if (username) mockData.users[userIndex].username = username;
  mockData.users[userIndex].updatedAt = new Date().toISOString();
  
  const updatedUser = mockData.users[userIndex];
  
  res.json({
    id: updatedUser.id,
    email: updatedUser.email,
    username: updatedUser.username,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    avatar: updatedUser.avatar,
    role: updatedUser.role,
    isActive: updatedUser.isActive,
    updatedAt: updatedUser.updatedAt
  });
});

// POST /api/v1/users/avatar
router.post('/avatar', authenticateToken, (req, res) => {
  const userIndex = mockData.users.findIndex(u => u.id === req.user.userId);
  
  if (userIndex === -1) {
    return res.status(404).json({
      error: 'User not found',
      code: 'USER_NOT_FOUND'
    });
  }
  
  // Mock file upload - generate new avatar URL
  const newAvatar = faker.image.avatar();
  mockData.users[userIndex].avatar = newAvatar;
  mockData.users[userIndex].updatedAt = new Date().toISOString();
  
  res.json({
    avatar: newAvatar,
    message: 'Avatar updated successfully'
  });
});

// GET /api/v1/users/settings
router.get('/settings', authenticateToken, (req, res) => {
  const user = mockData.users.find(u => u.id === req.user.userId);
  
  if (!user) {
    return res.status(404).json({
      error: 'User not found',
      code: 'USER_NOT_FOUND'
    });
  }
  
  const settings = user.settings || {
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    notifications: {
      email: true,
      push: true,
      sms: false,
      desktop: true
    },
    privacy: {
      profileVisible: true,
      showEmail: false,
      showPhone: false
    },
    preferences: {
      itemsPerPage: 20,
      defaultView: 'grid',
      autoSave: true
    }
  };
  
  res.json(settings);
});

// PUT /api/v1/users/settings
router.put('/settings', authenticateToken, (req, res) => {
  const userIndex = mockData.users.findIndex(u => u.id === req.user.userId);
  
  if (userIndex === -1) {
    return res.status(404).json({
      error: 'User not found',
      code: 'USER_NOT_FOUND'
    });
  }
  
  // Update settings
  mockData.users[userIndex].settings = {
    ...mockData.users[userIndex].settings,
    ...req.body
  };
  mockData.users[userIndex].updatedAt = new Date().toISOString();
  
  res.json({
    settings: mockData.users[userIndex].settings,
    message: 'Settings updated successfully'
  });
});

// DELETE /api/v1/users/account
router.delete('/account', authenticateToken, (req, res) => {
  const userIndex = mockData.users.findIndex(u => u.id === req.user.userId);
  
  if (userIndex === -1) {
    return res.status(404).json({
      error: 'User not found',
      code: 'USER_NOT_FOUND'
    });
  }
  
  // Soft delete - just mark as inactive
  mockData.users[userIndex].isActive = false;
  mockData.users[userIndex].deletedAt = new Date().toISOString();
  
  res.json({
    message: 'Account deactivated successfully'
  });
});

// GET /api/v1/users/activity
router.get('/activity', authenticateToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  // Generate mock activity data
  const activities = Array.from({ length: 50 }, (_, i) => ({
    id: faker.string.uuid(),
    type: faker.helpers.arrayElement(['login', 'profile_update', 'password_change', 'file_upload', 'logout']),
    description: faker.lorem.sentence(),
    timestamp: faker.date.recent({ days: 30 }).toISOString(),
    ipAddress: faker.internet.ip(),
    userAgent: faker.internet.userAgent()
  }));
  
  const paginatedActivities = activities.slice(skip, skip + limit);
  
  res.json({
    activities: paginatedActivities,
    pagination: {
      page,
      limit,
      total: activities.length,
      pages: Math.ceil(activities.length / limit)
    }
  });
});

module.exports = router;
