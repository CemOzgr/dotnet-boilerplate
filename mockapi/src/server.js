const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const https = require('https');

// Import mock utilities
const { initializeMockData } = require('./mock-utils');

// Import route handlers
const authRoutes = require('./routes/auth-routes');
const userRoutes = require('./routes/user-routes');
const adminRoutes = require('./routes/admin-routes');
const notificationRoutes = require('./routes/notification-routes');
const fileRoutes = require('./routes/file-routes');
const communicationRoutes = require('./routes/communication-routes');
const aiRoutes = require('./routes/ai-routes');
const coreRoutes = require('./routes/core-routes');

class MockServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001;
    this.httpsPort = process.env.HTTPS_PORT || 3443;
    this.swaggerSpec = null;
    
    // Initialize mock data
    initializeMockData();
    
    this.loadOpenAPISpec();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupSwagger();
    this.setupFileWatcher();
    this.setupErrorHandling();
  }

  loadOpenAPISpec() {
    try {
      const specPath = path.join(__dirname, '../specs/openapi.yaml');
      const fileContents = fs.readFileSync(specPath, 'utf8');
      this.swaggerSpec = YAML.parse(fileContents);
      console.log('✅ OpenAPI specification loaded successfully');
    } catch (error) {
      console.error('❌ Error loading OpenAPI specification:', error.message);
      // Create a basic spec if file doesn't exist
      this.swaggerSpec = {
        openapi: '3.0.3',
        info: {
          title: 'Mock Server API',
          version: '1.0.0',
          description: 'Development Mock Server'
        },
        servers: [
          { url: `http://localhost:${this.port}/api/v1`, description: 'HTTP Development Server' },
          { url: `https://localhost:${this.httpsPort}/api/v1`, description: 'HTTPS Development Server' }
        ],
        paths: {}
      };
    }
  }

  setupMiddleware() {
    // Security
    this.app.use(helmet({
      contentSecurityPolicy: false, // Disable for Swagger UI
    }));
    
    // CORS
    this.app.use(cors({
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', "https://localhost:3443/"],
      credentials: true
    }));
    
    // Logging
    this.app.use(morgan('combined'));
    
    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Add delay middleware for realistic API simulation
    this.app.use((req, res, next) => {
      const delay = Math.floor(Math.random() * 500) + 200; // 200-700ms delay
      setTimeout(next, delay);
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // API routes
    this.app.use('/api/v1/auth', authRoutes);
    this.app.use('/api/v1/users', userRoutes);
    this.app.use('/api/v1/admin', adminRoutes);
    this.app.use('/api/v1/notifications', notificationRoutes);
    this.app.use('/api/v1/files', fileRoutes);
    this.app.use('/api/v1/communication', communicationRoutes);
    this.app.use('/api/v1/ai', aiRoutes);
    this.app.use('/api/v1', coreRoutes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        message: 'Mock Server API',
        version: '1.0.0',
        documentation: '/api-docs',
        health: '/health',
        timestamp: new Date().toISOString()
      });
    });
  }

  setupSwagger() {
    // Swagger UI options
    const swaggerOptions = {
      explorer: true,
      swaggerOptions: {
        persistAuthorization: true,
      },
    };

    // Serve Swagger UI
    this.app.use('/api-docs', swaggerUi.serve);
    this.app.get('/api-docs', swaggerUi.setup(this.swaggerSpec, swaggerOptions));
    
    // Serve raw OpenAPI spec
    this.app.get('/api-spec', (req, res) => {
      res.json(this.swaggerSpec);
    });
  }

  setupFileWatcher() {
    // Watch for changes in OpenAPI spec and reload
    const specPath = path.join(__dirname, '../specs/openapi.yaml');
    chokidar.watch(specPath).on('change', () => {
      console.log('📝 OpenAPI spec changed, reloading...');
      this.loadOpenAPISpec();
    });

    // Watch handlers directory for changes
    const handlersPath = path.join(__dirname, 'handlers');
    chokidar.watch(handlersPath).on('change', (filePath) => {
      console.log(`📝 Handler file changed: ${filePath}`);
      // Clear require cache for hot reload
      delete require.cache[require.resolve(filePath)];
    });
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Not Found',
        code: 'NOT_FOUND',
        message: `Endpoint ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString()
      });
    });

    // Error handler
    this.app.use((error, req, res, next) => {
      console.error('Server Error:', error);
      res.status(error.status || 500).json({
        error: error.message || 'Internal Server Error',
        code: error.code || 'INTERNAL_ERROR',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
        timestamp: new Date().toISOString()
      });
    });
  }

  startHTTP() {
    const server = this.app.listen(this.port, () => {
      console.log(`🚀 HTTP Mock Server running on http://localhost:${this.port}`);
      console.log(`📚 Swagger UI available at http://localhost:${this.port}/api-docs`);
      console.log(`💓 Health check at http://localhost:${this.port}/health`);
    });

    return server;
  }

  startHTTPS() {
    try {
      const certPath = path.join(__dirname, '../certs/cert.pem');
      const keyPath = path.join(__dirname, '../certs/key.pem');
      
      if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
        console.log('⚠️  HTTPS certificates not found. Run: npm run generate:cert');
        return null;
      }

      const options = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      };

      const httpsServer = https.createServer(options, this.app);
      httpsServer.listen(this.httpsPort, () => {
        console.log(`🔒 HTTPS Mock Server running on https://localhost:${this.httpsPort}`);
        console.log(`📚 Swagger UI available at https://localhost:${this.httpsPort}/api-docs`);
      });

      return httpsServer;
    } catch (error) {
      console.error('❌ Failed to start HTTPS server:', error.message);
      return null;
    }
  }

  start() {
    const httpServer = this.startHTTP();
    const httpsServer = this.startHTTPS();

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down servers...');
      httpServer.close(() => {
        console.log('✅ HTTP server closed');
      });
      if (httpsServer) {
        httpsServer.close(() => {
          console.log('✅ HTTPS server closed');
        });
      }
      process.exit(0);
    });

    return { httpServer, httpsServer };
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new MockServer();
  server.start();
}

module.exports = MockServer;
