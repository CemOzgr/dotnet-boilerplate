const { faker } = require('@faker-js/faker');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Mock data storage
const mockData = {
  users: [],
  notifications: [],
  files: [],
  refreshTokens: new Set(),
  userSettings: new Map(),
  emails: [],
  sms: [],
  llmResponses: [],
  plans: [],
  agentResponses: [],
  mcpResponses: [],
};

// JWT secret for mock tokens
const JWT_SECRET = 'mock-server-secret-key';

// Utility functions
const generateMockUser = (overrides = {}) => ({
  id: uuidv4(),
  email: faker.internet.email(),
  username: faker.internet.userName(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  avatar: faker.image.avatar(),
  role: 'user',
  isActive: true,
  createdAt: faker.date.past().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const generateMockTokens = (user) => {
  const accessToken = jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  const refreshToken = jwt.sign(
    { userId: user.id, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  mockData.refreshTokens.add(refreshToken);

  return {
    accessToken,
    refreshToken,
    expiresIn: 3600,
    tokenType: 'Bearer',
  };
};

const generateMockNotification = (userId, overrides = {}) => ({
  id: uuidv4(),
  title: faker.lorem.sentence(3),
  message: faker.lorem.sentence(10),
  type: faker.helpers.arrayElement(['info', 'success', 'warning', 'error']),
  isRead: faker.datatype.boolean(),
  createdAt: faker.date.recent().toISOString(),
  metadata: {
    source: faker.helpers.arrayElement(['system', 'admin', 'user']),
    priority: faker.helpers.arrayElement(['low', 'medium', 'high']),
  },
  userId,
  ...overrides,
});

const generateMockFile = (userId, overrides = {}) => ({
  id: uuidv4(),
  filename: faker.system.fileName(),
  originalName: faker.system.fileName(),
  mimeType: faker.helpers.arrayElement([
    'image/jpeg',
    'image/png',
    'application/pdf',
    'text/plain',
    'application/zip',
  ]),
  size: faker.number.int({ min: 1024, max: 10485760 }), // 1KB to 10MB
  url: faker.internet.url(),
  uploadedBy: userId,
  uploadedAt: new Date().toISOString(),
  ...overrides,
});

const generateMockUserSettings = (overrides = {}) => ({
  theme: faker.helpers.arrayElement(['light', 'dark', 'auto']),
  language: 'en',
  timezone: faker.location.timeZone(),
  notifications: {
    email: faker.datatype.boolean(),
    push: faker.datatype.boolean(),
    sms: faker.datatype.boolean(),
  },
  preferences: {
    showTutorials: faker.datatype.boolean(),
    compactMode: faker.datatype.boolean(),
    autoSave: faker.datatype.boolean(),
    language: faker.helpers.arrayElement(['en', 'tr', 'es', 'fr', 'de']),
  },
  ...overrides,
});

const generateMockEmail = (overrides = {}) => ({
  id: uuidv4(),
  to: faker.internet.email(),
  from: faker.internet.email(),
  subject: faker.lorem.sentence(4),
  body: faker.lorem.paragraphs(2),
  isHtml: faker.datatype.boolean(),
  status: faker.helpers.arrayElement(['sent', 'delivered', 'failed', 'pending']),
  sentAt: new Date().toISOString(),
  deliveredAt: faker.datatype.boolean() ? faker.date.recent().toISOString() : null,
  ...overrides,
});

const generateMockSMS = (overrides = {}) => ({
  id: uuidv4(),
  to: faker.phone.number(),
  from: faker.phone.number(),
  message: faker.lorem.sentence(8),
  status: faker.helpers.arrayElement(['sent', 'delivered', 'failed', 'pending']),
  sentAt: new Date().toISOString(),
  deliveredAt: faker.datatype.boolean() ? faker.date.recent().toISOString() : null,
  ...overrides,
});

const generateMockLLMResponse = (prompt, overrides = {}) => ({
  id: uuidv4(),
  response: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })),
  usage: {
    promptTokens: Math.ceil(prompt.length / 4),
    completionTokens: faker.number.int({ min: 50, max: 500 }),
    totalTokens: 0,
  },
  model: faker.helpers.arrayElement(['gpt-3.5-turbo', 'gpt-4', 'claude-3', 'llama-2']),
  timestamp: new Date().toISOString(),
  ...overrides,
});

const generateMockPlan = (goal, overrides = {}) => {
  const stepCount = faker.number.int({ min: 3, max: 8 });
  const steps = [];
  
  for (let i = 1; i <= stepCount; i++) {
    steps.push({
      step: i,
      description: faker.lorem.sentence(),
      estimated_time: faker.number.int({ min: 5, max: 120 }),
      dependencies: i > 1 ? [faker.number.int({ min: 1, max: i - 1 })] : [],
    });
  }
  
  return {
    id: uuidv4(),
    goal,
    steps,
    total_estimated_time: steps.reduce((acc, step) => acc + step.estimated_time, 0),
    confidence: faker.number.float({ min: 0.6, max: 0.95, precision: 0.01 }),
    timestamp: new Date().toISOString(),
    ...overrides,
  };
};

const generateMockAgentResponse = (agentType, input, overrides = {}) => ({
  id: uuidv4(),
  agentType,
  result: {
    output: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 2 })),
    confidence: faker.number.float({ min: 0.7, max: 0.98, precision: 0.01 }),
    reasoning: faker.lorem.sentence(),
    actions_taken: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => 
      faker.lorem.words(faker.number.int({ min: 2, max: 5 }))
    ),
  },
  execution_time_ms: faker.number.int({ min: 100, max: 5000 }),
  timestamp: new Date().toISOString(),
  ...overrides,
});

const generateMockMCPResponse = (method, overrides = {}) => ({
  id: uuidv4(),
  method,
  result: {
    success: faker.datatype.boolean({ probability: 0.9 }),
    data: faker.lorem.paragraphs(1),
    metadata: {
      protocol_version: '1.0.0',
      server_version: faker.system.semver(),
      timestamp: new Date().toISOString(),
      capabilities: faker.helpers.arrayElements([
        'prompts', 'resources', 'tools', 'logging', 'completion'
      ], faker.number.int({ min: 1, max: 3 })),
    },
  },
  execution_time_ms: faker.number.int({ min: 50, max: 2000 }),
  ...overrides,
});

const simulateNetworkDelay = () => {
  const delay = faker.number.int({ min: 300, max: 800 });
  return new Promise(resolve => setTimeout(resolve, delay));
};

const validateToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = mockData.users.find(u => u.id === decoded.userId);
    return user || null;
  } catch (error) {
    return null;
  }
};

const requireAuth = (req) => {
  const user = validateToken(req.headers.authorization);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
};

const requireAdmin = (req) => {
  const user = requireAuth(req);
  if (user.role !== 'admin') {
    throw new Error('Forbidden');
  }
  return user;
};

// Initialize some mock data
const initializeMockData = () => {
  console.log('🔄 Initializing mock data...');
  
  // Create admin user
  const adminUser = generateMockUser({
    email: 'admin@example.com',
    username: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
  });
  mockData.users.push(adminUser);

  // Create regular user
  const regularUser = generateMockUser({
    email: 'user@example.com',
    username: 'user',
    firstName: 'Regular',
    lastName: 'User',
    role: 'user',
  });
  mockData.users.push(regularUser);

  // Create some notifications for the regular user
  for (let i = 0; i < 5; i++) {
    const notification = generateMockNotification(regularUser.id);
    mockData.notifications.push(notification);
  }

  // Create some files for the regular user
  for (let i = 0; i < 3; i++) {
    const file = generateMockFile(regularUser.id);
    mockData.files.push(file);
  }

  // Create some user settings
  const adminSettings = generateMockUserSettings({ theme: 'dark', language: 'en' });
  const userSettings = generateMockUserSettings({ theme: 'light', language: 'en' });
  mockData.userSettings.set(adminUser.id, adminSettings);
  mockData.userSettings.set(regularUser.id, userSettings);

  console.log('✅ Mock data initialized');
  console.log(`👤 Admin user: ${adminUser.email} (password: any)`);
  console.log(`👤 Regular user: ${regularUser.email} (password: any)`);
  console.log(`📊 Total users: ${mockData.users.length}`);
  console.log(`📧 Total notifications: ${mockData.notifications.length}`);
  console.log(`📁 Total files: ${mockData.files.length}`);
};

module.exports = {
  mockData,
  generateMockUser,
  generateMockTokens,
  generateMockNotification,
  generateMockFile,
  generateMockUserSettings,
  generateMockEmail,
  generateMockSMS,
  generateMockLLMResponse,
  generateMockPlan,
  generateMockAgentResponse,
  generateMockMCPResponse,
  simulateNetworkDelay,
  validateToken,
  requireAuth,
  requireAdmin,
  initializeMockData,
  JWT_SECRET,
  faker, // Export faker to avoid import conflicts
};
