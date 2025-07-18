# 🎭 Mock Server Infrastructure

A comprehensive mock server setup for full-stack development with OpenAPI 3.0 specification, MSW (Mock Service Worker) handlers, and dynamic Swagger UI.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Mock Server

```bash
# Start the Swagger UI server (with hot-reload)
npm run dev

# Or start production mode
npm start
```

### 3. Start MSW Handlers (Optional)

```bash
# Start MSW server for additional mocking capabilities
npm run mock:dev
```

### 4. Access the API Documentation

- **HTTP Swagger UI**: http://localhost:3001/docs
- **HTTPS Swagger UI**: https://localhost:3443/docs
- **Health Check**: http://localhost:3001/health (HTTP) or https://localhost:3443/health (HTTPS)
- **OpenAPI Spec**: http://localhost:3001/api-spec (HTTP) or https://localhost:3443/api-spec (HTTPS)

⚠️ **Note**: You may need to accept the self-signed SSL certificate in your browser for HTTPS access.

## 📋 Available Endpoints

### 🔐 Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

### 👤 User Profile Management
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `POST /users/profile/avatar` - Upload avatar

### ⚙️ User Settings
- `GET /users/settings` - Get user settings
- `PUT /users/settings` - Update user settings

### 🔔 Notifications
- `GET /notifications` - List notifications (with pagination)
- `PUT /notifications/{id}/read` - Mark notification as read
- `DELETE /notifications/{id}` - Delete notification

### 📁 File Upload
- `POST /files/upload` - Upload file
- `GET /files/{id}` - Download file
- `DELETE /files/{id}` - Delete file

### 👑 Admin Tools
- `GET /admin/users` - List all users (admin only)
- `PUT /admin/users/{id}/role` - Update user role (admin only)
- `GET /admin/stats` - Get system statistics (admin only)
- `POST /admin/impersonate/{id}` - Impersonate user (admin only)

### 📧 Communications
- `POST /communications/email/send` - Send email
- `POST /communications/sms/send` - Send SMS

### 🤖 AI Tools
- `POST /ai/llm/call` - LLM API call
- `POST /ai/planner/call` - AI planner call
- `POST /ai/agent/call` - AI agent call
- `POST /ai/mcp/call` - Model Context Protocol call

## 🔑 Test Credentials

```javascript
// Admin User
{
  "email": "admin@example.com",
  "password": "any_password"
}

// Regular User
{
  "email": "user@example.com", 
  "password": "any_password"
}
```

## 🛠️ Development Tools

### Generate Handlers from OpenAPI Spec

```bash
npm run generate:handlers
```

This command automatically generates MSW handlers based on your OpenAPI specification.

### Scaffold New Endpoints

```bash
node scripts/scaffold-endpoint.js
```

Interactive CLI to create new API endpoints with both OpenAPI spec and MSW handlers.

### Validate OpenAPI Specification

```bash
npm run validate:spec
```

## 🔗 Frontend Integration

### Vite/React Setup

```javascript
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

### Create React App Setup

```javascript
// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
    })
  );
};
```

### Next.js Setup

```javascript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/v1/:path*',
      },
    ];
  },
};
```

## 🔧 Configuration

### Environment Variables

```bash
PORT=3001                    # HTTP server port
HTTPS_PORT=3443             # HTTPS server port
NODE_ENV=development         # Environment
CORS_ORIGIN=*               # CORS origin (comma-separated for multiple)
JWT_SECRET=your-secret-key  # JWT secret for token signing
SSL_CERT_PATH=./certs/cert.pem  # SSL certificate path
SSL_KEY_PATH=./certs/key.pem    # SSL private key path
```

### Project Structure

```
├── src/
│   ├── server.js              # Main Swagger UI server
│   ├── mock-server.js         # MSW server
│   ├── mock-utils.js          # Utility functions and mock data
│   └── handlers/              # MSW handlers
│       ├── core-handlers.js
│       ├── communication-handlers.js
│       └── ai-handlers.js
├── specs/
│   └── openapi.yaml          # OpenAPI 3.0 specification
├── scripts/
│   ├── generate-handlers.js  # Auto-generate handlers
│   └── scaffold-endpoint.js  # Interactive endpoint scaffolder
└── examples/                 # Frontend integration examples
```

## 🔥 Features

- ✅ **OpenAPI 3.0 Compliant** - Complete YAML specification
- ✅ **Dynamic Swagger UI** - Auto-updates with hot-reload
- ✅ **MSW Integration** - Mock Service Worker handlers
- ✅ **Realistic Mock Data** - Using Faker.js for realistic responses
- ✅ **Authentication Simulation** - JWT tokens and role-based access
- ✅ **Network Latency Simulation** - Configurable delays (300-800ms)
- ✅ **Error Handling** - Comprehensive error responses
- ✅ **File Upload Support** - Multipart form data handling
- ✅ **Admin Tools** - User management and system statistics
- ✅ **AI/ML Endpoints** - LLM, Planner, Agent, and MCP calls
- ✅ **Frontend Integration** - Examples for popular frameworks
- ✅ **Development Tools** - CLI scaffolding and code generation

## 🎯 Usage Examples

### Login and Get Profile

```javascript
// Login
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'any_password'
  })
});

const { user, tokens } = await loginResponse.json();

// Get profile with auth token
const profileResponse = await fetch('/api/v1/users/profile', {
  headers: { 
    'Authorization': `Bearer ${tokens.accessToken}` 
  }
});

const profile = await profileResponse.json();
```

### Upload File

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const uploadResponse = await fetch('/api/v1/files/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

const fileInfo = await uploadResponse.json();
```

### Call LLM API

```javascript
const llmResponse = await fetch('/api/v1/ai/llm/call', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    prompt: 'Explain the concept of mock servers',
    model: 'gpt-3.5-turbo',
    maxTokens: 500
  })
});

const result = await llmResponse.json();
```

## 🤝 Contributing

1. Add new endpoints to `specs/openapi.yaml`
2. Generate handlers: `npm run generate:handlers`
3. Customize handlers in `src/handlers/`
4. Test via Swagger UI at `/docs`

## 📜 License

MIT License - see LICENSE file for details.

---

**🎉 Happy Mocking!** Your frontend team can now develop against a fully-featured API without waiting for backend implementation.

## 🔒 SSL/HTTPS Configuration

The mock server supports both HTTP and HTTPS protocols with self-signed SSL certificates.

### SSL Certificate Setup

The server automatically loads SSL certificates from the `certs/` directory:
- `certs/cert.pem` - SSL certificate
- `certs/key.pem` - Private key

### Generate New SSL Certificates (if needed)

```bash
# Create certs directory
mkdir -p certs

# Generate new self-signed certificate
npm run generate:cert

# Or manually with OpenSSL
openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes -subj '/C=US/ST=CA/L=San Francisco/O=Mock Server/OU=Development/CN=localhost'
```

### Testing SSL Connection

```bash
# Test HTTP endpoint
npm run test:http

# Test HTTPS endpoint (with self-signed cert)
npm run test:https

# Or manually
curl -k https://localhost:3443/health
```

### Browser SSL Warning

When accessing HTTPS endpoints in your browser, you'll see a security warning due to the self-signed certificate. This is normal for development. Click "Advanced" → "Proceed to localhost" to continue.
