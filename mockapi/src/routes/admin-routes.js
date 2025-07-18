const express = require('express');
const jwt = require('jsonwebtoken');
const { faker } = require('@faker-js/faker');
const { mockData } = require('../mock-utils');
const router = express.Router();

const JWT_SECRET = 'mock-server-secret-key';

// Middleware to verify JWT token and admin role
function authenticateAdmin(req, res, next) {
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
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        error: 'Admin access required',
        code: 'FORBIDDEN'
      });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }
}

// GET /api/v1/admin/users
router.get('/users', authenticateAdmin, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const role = req.query.role;
  const status = req.query.status;
  
  let filteredUsers = mockData.users;
  
  // Apply filters
  if (search) {
    filteredUsers = filteredUsers.filter(user => 
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  if (role) {
    filteredUsers = filteredUsers.filter(user => user.role === role);
  }
  
  if (status) {
    const isActive = status === 'active';
    filteredUsers = filteredUsers.filter(user => user.isActive === isActive);
  }
  
  // Pagination
  const skip = (page - 1) * limit;
  const paginatedUsers = filteredUsers.slice(skip, skip + limit);
  
  res.json({
    users: paginatedUsers.map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    })),
    pagination: {
      page,
      limit,
      total: filteredUsers.length,
      pages: Math.ceil(filteredUsers.length / limit)
    }
  });
});

// GET /api/v1/admin/users/:id
router.get('/users/:id', authenticateAdmin, (req, res) => {
  const user = mockData.users.find(u => u.id === req.params.id);
  
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
    settings: user.settings,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: faker.date.recent().toISOString(),
    loginCount: faker.number.int({ min: 1, max: 100 })
  });
});

// PUT /api/v1/admin/users/:id
router.put('/users/:id', authenticateAdmin, (req, res) => {
  const userIndex = mockData.users.findIndex(u => u.id === req.params.id);
  
  if (userIndex === -1) {
    return res.status(404).json({
      error: 'User not found',
      code: 'USER_NOT_FOUND'
    });
  }
  
  const { firstName, lastName, username, email, role, isActive } = req.body;
  
  // Update user
  if (firstName) mockData.users[userIndex].firstName = firstName;
  if (lastName) mockData.users[userIndex].lastName = lastName;
  if (username) mockData.users[userIndex].username = username;
  if (email) mockData.users[userIndex].email = email;
  if (role) mockData.users[userIndex].role = role;
  if (typeof isActive === 'boolean') mockData.users[userIndex].isActive = isActive;
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

// DELETE /api/v1/admin/users/:id
router.delete('/users/:id', authenticateAdmin, (req, res) => {
  const userIndex = mockData.users.findIndex(u => u.id === req.params.id);
  
  if (userIndex === -1) {
    return res.status(404).json({
      error: 'User not found',
      code: 'USER_NOT_FOUND'
    });
  }
  
  // Remove user from mock data
  mockData.users.splice(userIndex, 1);
  
  res.json({
    message: 'User deleted successfully'
  });
});

// POST /api/v1/admin/users/:id/impersonate
router.post('/users/:id/impersonate', authenticateAdmin, (req, res) => {
  const user = mockData.users.find(u => u.id === req.params.id);
  
  if (!user) {
    return res.status(404).json({
      error: 'User not found',
      code: 'USER_NOT_FOUND'
    });
  }
  
  // Generate impersonation token
  const impersonationToken = jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role,
      impersonatedBy: req.user.userId 
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  res.json({
    token: impersonationToken,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    },
    expiresIn: 3600,
    message: 'Impersonation token generated'
  });
});

// GET /api/v1/admin/stats
router.get('/stats', authenticateAdmin, (req, res) => {
  const totalUsers = mockData.users.length;
  const activeUsers = mockData.users.filter(u => u.isActive).length;
  const adminUsers = mockData.users.filter(u => u.role === 'admin').length;
  
  res.json({
    users: {
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers,
      admins: adminUsers,
      moderators: mockData.users.filter(u => u.role === 'moderator').length,
      regular: mockData.users.filter(u => u.role === 'user').length
    },
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    },
    activity: {
      requestsToday: faker.number.int({ min: 1000, max: 10000 }),
      errorsToday: faker.number.int({ min: 10, max: 100 }),
      averageResponseTime: faker.number.int({ min: 50, max: 500 })
    }
  });
});

// GET /api/v1/admin/logs
router.get('/logs', authenticateAdmin, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const level = req.query.level;
  
  // Generate mock logs
  const logs = Array.from({ length: 100 }, (_, i) => ({
    id: faker.string.uuid(),
    timestamp: faker.date.recent({ days: 7 }).toISOString(),
    level: faker.helpers.arrayElement(['error', 'warn', 'info', 'debug']),
    message: faker.lorem.sentence(),
    source: faker.helpers.arrayElement(['auth', 'api', 'database', 'cache']),
    userId: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.7 }),
    metadata: {
      ip: faker.internet.ip(),
      userAgent: faker.internet.userAgent(),
      endpoint: faker.helpers.arrayElement(['/api/v1/users', '/api/v1/auth/login', '/api/v1/files'])
    }
  }));
  
  let filteredLogs = logs;
  if (level) {
    filteredLogs = logs.filter(log => log.level === level);
  }
  
  const skip = (page - 1) * limit;
  const paginatedLogs = filteredLogs.slice(skip, skip + limit);
  
  res.json({
    logs: paginatedLogs,
    pagination: {
      page,
      limit,
      total: filteredLogs.length,
      pages: Math.ceil(filteredLogs.length / limit)
    }
  });
});

module.exports = router;
