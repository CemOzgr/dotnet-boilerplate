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

// POST /api/v1/communication/email/send
router.post('/email/send', authenticateToken, (req, res) => {
  const { to, subject, body, templateId, templateData } = req.body;
  
  // Validation
  if (!to || !subject || (!body && !templateId)) {
    return res.status(400).json({
      error: 'Missing required fields: to, subject, and (body or templateId)',
      code: 'VALIDATION_ERROR'
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const recipients = Array.isArray(to) ? to : [to];
  
  for (const email of recipients) {
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: `Invalid email format: ${email}`,
        code: 'INVALID_EMAIL'
      });
    }
  }
  
  // Mock email sending
  const emailId = faker.string.uuid();
  const mockEmail = {
    id: emailId,
    from: 'noreply@mockserver.com',
    to: recipients,
    subject,
    body: body || `Email from template: ${templateId}`,
    templateId,
    templateData,
    status: 'sent',
    sentAt: new Date().toISOString(),
    sentBy: req.user.userId,
    deliveryStatus: faker.helpers.arrayElement(['delivered', 'pending', 'bounced']),
    opens: 0,
    clicks: 0
  };
  
  // Initialize emails array if not exists
  if (!mockData.emails) {
    mockData.emails = [];
  }
  
  mockData.emails.push(mockEmail);
  
  res.status(201).json({
    emailId,
    status: 'sent',
    message: `Email sent successfully to ${recipients.length} recipient(s)`,
    recipients: recipients.length,
    sentAt: mockEmail.sentAt
  });
});

// POST /api/v1/communication/email/send-bulk
router.post('/email/send-bulk', authenticateToken, (req, res) => {
  const { recipients, subject, body, templateId, templateData } = req.body;
  
  // Validation
  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({
      error: 'Recipients array is required and must not be empty',
      code: 'VALIDATION_ERROR'
    });
  }
  
  if (!subject || (!body && !templateId)) {
    return res.status(400).json({
      error: 'Missing required fields: subject, and (body or templateId)',
      code: 'VALIDATION_ERROR'
    });
  }
  
  // Validate email formats
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalidEmails = recipients.filter(email => !emailRegex.test(email));
  
  if (invalidEmails.length > 0) {
    return res.status(400).json({
      error: 'Invalid email formats found',
      code: 'INVALID_EMAIL',
      invalidEmails
    });
  }
  
  // Mock bulk email sending
  const campaignId = faker.string.uuid();
  const sentEmails = recipients.map(email => ({
    id: faker.string.uuid(),
    campaignId,
    from: 'noreply@mockserver.com',
    to: email,
    subject,
    body: body || `Bulk email from template: ${templateId}`,
    templateId,
    templateData,
    status: faker.helpers.arrayElement(['sent', 'failed']),
    sentAt: new Date().toISOString(),
    sentBy: req.user.userId,
    deliveryStatus: faker.helpers.arrayElement(['delivered', 'pending', 'bounced']),
    opens: faker.number.int({ min: 0, max: 3 }),
    clicks: faker.number.int({ min: 0, max: 2 })
  }));
  
  if (!mockData.emails) {
    mockData.emails = [];
  }
  
  mockData.emails.push(...sentEmails);
  
  const successCount = sentEmails.filter(e => e.status === 'sent').length;
  const failureCount = sentEmails.length - successCount;
  
  res.status(201).json({
    campaignId,
    status: 'completed',
    message: 'Bulk email campaign completed',
    totalRecipients: recipients.length,
    successful: successCount,
    failed: failureCount,
    sentAt: new Date().toISOString()
  });
});

// POST /api/v1/communication/sms/send
router.post('/sms/send', authenticateToken, (req, res) => {
  const { to, message, templateId, templateData } = req.body;
  
  // Validation
  if (!to || (!message && !templateId)) {
    return res.status(400).json({
      error: 'Missing required fields: to, and (message or templateId)',
      code: 'VALIDATION_ERROR'
    });
  }
  
  // Validate phone number format (basic validation)
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  const recipients = Array.isArray(to) ? to : [to];
  
  for (const phone of recipients) {
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        error: `Invalid phone number format: ${phone}`,
        code: 'INVALID_PHONE'
      });
    }
  }
  
  // Mock SMS sending
  const smsId = faker.string.uuid();
  const mockSms = {
    id: smsId,
    to: recipients,
    message: message || `SMS from template: ${templateId}`,
    templateId,
    templateData,
    status: 'sent',
    sentAt: new Date().toISOString(),
    sentBy: req.user.userId,
    deliveryStatus: faker.helpers.arrayElement(['delivered', 'pending', 'failed']),
    cost: recipients.length * 0.05 // Mock cost calculation
  };
  
  // Initialize sms array if not exists
  if (!mockData.sms) {
    mockData.sms = [];
  }
  
  mockData.sms.push(mockSms);
  
  res.status(201).json({
    smsId,
    status: 'sent',
    message: `SMS sent successfully to ${recipients.length} recipient(s)`,
    recipients: recipients.length,
    cost: mockSms.cost,
    sentAt: mockSms.sentAt
  });
});

// POST /api/v1/communication/sms/send-bulk
router.post('/sms/send-bulk', authenticateToken, (req, res) => {
  const { recipients, message, templateId, templateData } = req.body;
  
  // Validation
  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({
      error: 'Recipients array is required and must not be empty',
      code: 'VALIDATION_ERROR'
    });
  }
  
  if (!message && !templateId) {
    return res.status(400).json({
      error: 'Either message or templateId is required',
      code: 'VALIDATION_ERROR'
    });
  }
  
  // Validate phone numbers
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  const invalidPhones = recipients.filter(phone => !phoneRegex.test(phone));
  
  if (invalidPhones.length > 0) {
    return res.status(400).json({
      error: 'Invalid phone number formats found',
      code: 'INVALID_PHONE',
      invalidPhones
    });
  }
  
  // Mock bulk SMS sending
  const campaignId = faker.string.uuid();
  const sentSms = recipients.map(phone => ({
    id: faker.string.uuid(),
    campaignId,
    to: phone,
    message: message || `Bulk SMS from template: ${templateId}`,
    templateId,
    templateData,
    status: faker.helpers.arrayElement(['sent', 'failed']),
    sentAt: new Date().toISOString(),
    sentBy: req.user.userId,
    deliveryStatus: faker.helpers.arrayElement(['delivered', 'pending', 'failed']),
    cost: 0.05 // Mock cost per SMS
  }));
  
  if (!mockData.sms) {
    mockData.sms = [];
  }
  
  mockData.sms.push(...sentSms);
  
  const successCount = sentSms.filter(s => s.status === 'sent').length;
  const failureCount = sentSms.length - successCount;
  const totalCost = successCount * 0.05;
  
  res.status(201).json({
    campaignId,
    status: 'completed',
    message: 'Bulk SMS campaign completed',
    totalRecipients: recipients.length,
    successful: successCount,
    failed: failureCount,
    totalCost,
    sentAt: new Date().toISOString()
  });
});

// GET /api/v1/communication/emails
router.get('/emails', authenticateToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;
  
  if (!mockData.emails) {
    mockData.emails = [];
  }
  
  let filteredEmails = mockData.emails.filter(e => e.sentBy === req.user.userId);
  
  if (status) {
    filteredEmails = filteredEmails.filter(e => e.status === status);
  }
  
  // Sort by sent date (newest first)
  filteredEmails.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
  
  // Pagination
  const skip = (page - 1) * limit;
  const paginatedEmails = filteredEmails.slice(skip, skip + limit);
  
  res.json({
    emails: paginatedEmails,
    pagination: {
      page,
      limit,
      total: filteredEmails.length,
      pages: Math.ceil(filteredEmails.length / limit)
    }
  });
});

// GET /api/v1/communication/sms
router.get('/sms', authenticateToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;
  
  if (!mockData.sms) {
    mockData.sms = [];
  }
  
  let filteredSms = mockData.sms.filter(s => s.sentBy === req.user.userId);
  
  if (status) {
    filteredSms = filteredSms.filter(s => s.status === status);
  }
  
  // Sort by sent date (newest first)
  filteredSms.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
  
  // Pagination
  const skip = (page - 1) * limit;
  const paginatedSms = filteredSms.slice(skip, skip + limit);
  
  res.json({
    sms: paginatedSms,
    pagination: {
      page,
      limit,
      total: filteredSms.length,
      pages: Math.ceil(filteredSms.length / limit)
    }
  });
});

// GET /api/v1/communication/templates
router.get('/templates', authenticateToken, (req, res) => {
  const type = req.query.type; // 'email' or 'sms'
  
  // Mock templates
  const templates = [
    {
      id: 'welcome-email',
      name: 'Welcome Email',
      type: 'email',
      subject: 'Welcome to {{appName}}!',
      body: 'Hello {{firstName}}, welcome to our platform!',
      variables: ['appName', 'firstName']
    },
    {
      id: 'password-reset',
      name: 'Password Reset',
      type: 'email',
      subject: 'Reset your password',
      body: 'Click here to reset your password: {{resetLink}}',
      variables: ['resetLink']
    },
    {
      id: 'welcome-sms',
      name: 'Welcome SMS',
      type: 'sms',
      body: 'Welcome to {{appName}}! Your account is ready.',
      variables: ['appName']
    },
    {
      id: 'verification-sms',
      name: 'Verification SMS',
      type: 'sms',
      body: 'Your verification code is: {{code}}',
      variables: ['code']
    }
  ];
  
  let filteredTemplates = templates;
  if (type) {
    filteredTemplates = templates.filter(t => t.type === type);
  }
  
  res.json({
    templates: filteredTemplates
  });
});

// GET /api/v1/communication/stats
router.get('/stats', authenticateToken, (req, res) => {
  const userEmails = mockData.emails ? mockData.emails.filter(e => e.sentBy === req.user.userId) : [];
  const userSms = mockData.sms ? mockData.sms.filter(s => s.sentBy === req.user.userId) : [];
  
  const emailStats = {
    total: userEmails.length,
    sent: userEmails.filter(e => e.status === 'sent').length,
    failed: userEmails.filter(e => e.status === 'failed').length,
    totalOpens: userEmails.reduce((sum, e) => sum + (e.opens || 0), 0),
    totalClicks: userEmails.reduce((sum, e) => sum + (e.clicks || 0), 0)
  };
  
  const smsStats = {
    total: userSms.length,
    sent: userSms.filter(s => s.status === 'sent').length,
    failed: userSms.filter(s => s.status === 'failed').length,
    totalCost: userSms.reduce((sum, s) => sum + (s.cost || 0), 0)
  };
  
  res.json({
    email: emailStats,
    sms: smsStats,
    period: 'all_time'
  });
});

module.exports = router;
