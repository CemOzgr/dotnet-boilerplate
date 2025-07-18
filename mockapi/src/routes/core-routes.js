const express = require('express');
const { faker } = require('@faker-js/faker');
const router = express.Router();

// GET /api/v1/health
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// GET /api/v1/status
router.get('/status', (req, res) => {
  res.json({
    server: 'Mock Server',
    status: 'running',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      redis: 'connected', 
      external_api: 'available'
    },
    stats: {
      requests_today: faker.number.int({ min: 100, max: 1000 }),
      active_users: faker.number.int({ min: 10, max: 100 }),
      system_load: faker.number.float({ min: 0.1, max: 0.9, fractionDigits: 2 })
    }
  });
});

// GET /api/v1/version
router.get('/version', (req, res) => {
  res.json({
    version: '1.0.0',
    build: faker.git.shortSha(),
    environment: process.env.NODE_ENV || 'development',
    node_version: process.version,
    uptime: process.uptime()
  });
});

module.exports = router;
