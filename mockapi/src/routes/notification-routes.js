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

// Initialize notifications if not exists
if (!mockData.notifications) {
  mockData.notifications = Array.from({ length: 20 }, () => ({
    id: faker.string.uuid(),
    userId: faker.helpers.arrayElement(mockData.users).id,
    title: faker.lorem.words(3),
    message: faker.lorem.sentence(),
    type: faker.helpers.arrayElement(['info', 'success', 'warning', 'error']),
    isRead: faker.datatype.boolean(),
    createdAt: faker.date.recent({ days: 30 }).toISOString(),
    readAt: faker.helpers.maybe(() => faker.date.recent({ days: 15 }).toISOString()),
    data: {
      action: faker.helpers.arrayElement(['user_registered', 'file_uploaded', 'password_changed', 'login_alert']),
      metadata: {}
    }
  }));
}

// GET /api/v1/notifications
router.get('/', authenticateToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const unreadOnly = req.query.unread === 'true';
  const type = req.query.type;
  
  // Filter notifications for current user
  let userNotifications = mockData.notifications.filter(n => n.userId === req.user.userId);
  
  // Apply filters
  if (unreadOnly) {
    userNotifications = userNotifications.filter(n => !n.isRead);
  }
  
  if (type) {
    userNotifications = userNotifications.filter(n => n.type === type);
  }
  
  // Sort by creation date (newest first)
  userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // Pagination
  const skip = (page - 1) * limit;
  const paginatedNotifications = userNotifications.slice(skip, skip + limit);
  
  res.json({
    notifications: paginatedNotifications,
    pagination: {
      page,
      limit,
      total: userNotifications.length,
      pages: Math.ceil(userNotifications.length / limit)
    },
    unreadCount: userNotifications.filter(n => !n.isRead).length
  });
});

// GET /api/v1/notifications/unread-count
router.get('/unread-count', authenticateToken, (req, res) => {
  const unreadCount = mockData.notifications.filter(
    n => n.userId === req.user.userId && !n.isRead
  ).length;
  
  res.json({
    count: unreadCount
  });
});

// GET /api/v1/notifications/:id
router.get('/:id', authenticateToken, (req, res) => {
  const notification = mockData.notifications.find(
    n => n.id === req.params.id && n.userId === req.user.userId
  );
  
  if (!notification) {
    return res.status(404).json({
      error: 'Notification not found',
      code: 'NOTIFICATION_NOT_FOUND'
    });
  }
  
  res.json(notification);
});

// PUT /api/v1/notifications/:id/read
router.put('/:id/read', authenticateToken, (req, res) => {
  const notificationIndex = mockData.notifications.findIndex(
    n => n.id === req.params.id && n.userId === req.user.userId
  );
  
  if (notificationIndex === -1) {
    return res.status(404).json({
      error: 'Notification not found',
      code: 'NOTIFICATION_NOT_FOUND'
    });
  }
  
  // Mark as read
  mockData.notifications[notificationIndex].isRead = true;
  mockData.notifications[notificationIndex].readAt = new Date().toISOString();
  
  res.json({
    message: 'Notification marked as read',
    notification: mockData.notifications[notificationIndex]
  });
});

// PUT /api/v1/notifications/mark-all-read
router.put('/mark-all-read', authenticateToken, (req, res) => {
  const now = new Date().toISOString();
  let markedCount = 0;
  
  mockData.notifications.forEach(notification => {
    if (notification.userId === req.user.userId && !notification.isRead) {
      notification.isRead = true;
      notification.readAt = now;
      markedCount++;
    }
  });
  
  res.json({
    message: `${markedCount} notifications marked as read`,
    markedCount
  });
});

// DELETE /api/v1/notifications/:id
router.delete('/:id', authenticateToken, (req, res) => {
  const notificationIndex = mockData.notifications.findIndex(
    n => n.id === req.params.id && n.userId === req.user.userId
  );
  
  if (notificationIndex === -1) {
    return res.status(404).json({
      error: 'Notification not found',
      code: 'NOTIFICATION_NOT_FOUND'
    });
  }
  
  // Remove notification
  mockData.notifications.splice(notificationIndex, 1);
  
  res.json({
    message: 'Notification deleted successfully'
  });
});

// DELETE /api/v1/notifications/clear-all
router.delete('/clear-all', authenticateToken, (req, res) => {
  const beforeCount = mockData.notifications.length;
  
  // Remove all notifications for current user
  mockData.notifications = mockData.notifications.filter(
    n => n.userId !== req.user.userId
  );
  
  const deletedCount = beforeCount - mockData.notifications.length;
  
  res.json({
    message: `${deletedCount} notifications deleted`,
    deletedCount
  });
});

// POST /api/v1/notifications (Create notification - for testing)
router.post('/', authenticateToken, (req, res) => {
  const { title, message, type = 'info', data = {} } = req.body;
  
  if (!title || !message) {
    return res.status(400).json({
      error: 'Title and message are required',
      code: 'VALIDATION_ERROR'
    });
  }
  
  const newNotification = {
    id: faker.string.uuid(),
    userId: req.user.userId,
    title,
    message,
    type,
    isRead: false,
    createdAt: new Date().toISOString(),
    readAt: null,
    data
  };
  
  mockData.notifications.unshift(newNotification);
  
  res.status(201).json({
    notification: newNotification,
    message: 'Notification created successfully'
  });
});

module.exports = router;
