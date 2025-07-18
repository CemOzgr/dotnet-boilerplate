const { setupServer } = require('msw/node');
const { initializeMockData } = require('./mock-utils');
const YAML = require('yaml');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

// Import all MSW handlers
const { handlers } = require('./handlers/core-handlers');
const authHandlers = require('./handlers/auth-handlers');
const userHandlers = require('./handlers/user-handlers');
const adminHandlers = require('./handlers/admin-handlers');
const notificationHandlers = require('./handlers/notification-handlers');
const fileHandlers = require('./handlers/file-handlers');
const communicationHandlers = require('./handlers/communication-handlers');
const aiHandlers = require('./handlers/ai-handlers');

class MSWMockServer {
  constructor() {
    this.port = process.env.PORT || 3001;
    this.httpsPort = process.env.HTTPS_PORT || 3443;
    this.swaggerSpec = null;
    this.mswServer = null;
    
    // Initialize mock data first
    initializeMockData();
    
    this.loadOpenAPISpec();
    this.setupMSWServer();
    this.setupFileWatcher();
  }

  loadOpenAPISpec() {
    try {
      const specPath = path.join(__dirname, '../specs/openapi.yaml');
      const fileContents = fs.readFileSync(specPath, 'utf8');
      this.swaggerSpec = YAML.parse(fileContents);
      console.log('✅ OpenAPI specification loaded successfully');
    } catch (error) {
      console.error('❌ Error loading OpenAPI specification:', error.message);
      process.exit(1);
    }
  }

  setupMSWServer() {
    // Combine all handlers
    const allHandlers = [
      ...handlers, // core handlers from core-handlers.js
      ...authHandlers,
      ...userHandlers,
      ...adminHandlers,
      ...notificationHandlers,
      ...fileHandlers,
      ...communicationHandlers,
      ...aiHandlers,
    ];

    console.log(`🔧 Total MSW handlers registered: ${allHandlers.length}`);

    // Create MSW server
    this.mswServer = setupServer(...allHandlers);
  }

  setupFileWatcher() {
    // Watch for changes in OpenAPI spec
    const specPath = path.join(__dirname, '../specs/openapi.yaml');
    const watcher = chokidar.watch(specPath, {
      persistent: true,
      ignoreInitial: true,
    });

    watcher.on('change', () => {
      console.log('📄 OpenAPI spec changed, reloading...');
      try {
        this.loadOpenAPISpec();
        console.log('✅ OpenAPI spec reloaded successfully');
      } catch (error) {
        console.error('❌ Error reloading OpenAPI spec:', error.message);
      }
    });

    // Gracefully close watcher on exit
    process.on('SIGINT', () => {
      watcher.close();
      this.stop();
      process.exit(0);
    });
  }

  start() {
    if (!this.mswServer) {
      console.error('❌ MSW server not initialized');
      return;
    }

    this.mswServer.listen({
      onUnhandledRequest: 'warn',
    });

    console.log(`
🚀 MSW Mock Server started successfully!

🎭 Mock Service Worker is now intercepting HTTP requests
📍 Base URLs:
   - HTTP: http://localhost:${this.port}/api/v1
   - HTTPS: https://localhost:${this.httpsPort}/api/v1

📚 Available Endpoints:
   - Authentication: /api/v1/auth/*
   - User Profile: /api/v1/users/*
   - Notifications: /api/v1/notifications/*
   - File Upload: /api/v1/files/*
   - Admin Tools: /api/v1/admin/*
   - Communications: /api/v1/communications/*
   - AI Tools: /api/v1/ai/*
   - Core Data: /api/v1/core/*

🔑 Test Credentials:
   - Admin: admin@example.com (any password)
   - User: user@example.com (any password)

🔥 Hot-reload enabled for OpenAPI specification
⚡ MSW is intercepting API calls - no Express server needed!

Note: MSW intercepts network requests at the service worker level.
This means your frontend applications can make normal HTTP requests
and MSW will respond with mock data automatically.
    `);
  }

  stop() {
    if (this.mswServer) {
      this.mswServer.close();
      console.log('⏹️  MSW Mock Server stopped');
    }
  }

  reset() {
    if (this.mswServer) {
      this.mswServer.resetHandlers();
      console.log('🔄 MSW handlers reset');
    }
  }

  use(...handlers) {
    if (this.mswServer) {
      this.mswServer.use(...handlers);
      console.log(`➕ Added ${handlers.length} new MSW handler(s)`);
    }
  }
}

// Start the MSW server
if (require.main === module) {
  const server = new MSWMockServer();
  server.start();

  // Keep the process alive
  process.stdin.resume();
}

module.exports = MSWMockServer;
