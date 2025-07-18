# 🚀 Mock Server API - Working Example

Your mock server is now **FULLY FUNCTIONAL** and ready to use! 

## ✅ Current Status: WORKING

- ✅ **HTTP Server**: Running on http://localhost:3001
- ✅ **HTTPS Server**: Running on https://localhost:3443  
- ✅ **Swagger UI**: Available at http://localhost:3001/api-docs
- ✅ **Authentication**: JWT-based auth with real endpoints
- ✅ **File Uploads**: Working with validation
- ✅ **All APIs**: Auth, Users, Admin, Files, Communication, AI

## 🎯 Test Your APIs Right Now!

### 1. Login (Get Your Token)
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}'
```

### 2. Get User Profile
```bash
TOKEN="YOUR_ACCESS_TOKEN_FROM_STEP_1"
curl -X GET http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Upload a File
```bash
echo "Test file content" > test.txt
curl -X POST http://localhost:3001/api/v1/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.txt" \
  -F "tags=test,demo"
```

### 4. Send an Email
```bash
curl -X POST http://localhost:3001/api/v1/communication/email/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com", "subject": "Hello", "body": "Test email"}'
```

### 5. Call AI Service
```bash
curl -X POST http://localhost:3001/api/v1/ai/llm/call \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4", "prompt": "Hello World!"}'
```

## 🔐 Default Users
- **Admin**: `admin@example.com` / `password123`
- **User**: `user@example.com` / `password123`

## 📚 Explore APIs
- **Interactive Docs**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/health
- **API Status**: http://localhost:3001/api/v1/status

## 🛠️ Commands
```bash
npm start              # Start server
npm run dev           # Start with auto-reload
npm run test:http     # Test endpoints
```

## 🎉 Your Mock Server Includes:

### ✅ Authentication & Security
- JWT login/logout/refresh
- Role-based access (admin/user)
- Password reset flow

### ✅ User Management  
- Profile management
- Settings & preferences
- Avatar uploads
- Activity logs

### ✅ Admin Tools
- User administration
- System statistics
- User impersonation
- System logs

### ✅ File Management
- Multi-file uploads
- File metadata
- Download endpoints
- Type validation

### ✅ Communication
- Email sending (single/bulk)
- SMS sending (single/bulk)
- Template system
- Delivery tracking

### ✅ AI Services
- LLM API calls
- AI Planning
- Agent interactions
- MCP integration

### ✅ Notifications
- Real-time notifications
- Read/unread status
- Bulk operations

**Everything is working and ready for your frontend integration! 🎯**
