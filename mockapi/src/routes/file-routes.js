const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { faker } = require('@faker-js/faker');
const path = require('path');
const fs = require('fs');
const { mockData } = require('../mock-utils');
const router = express.Router();

const JWT_SECRET = 'mock-server-secret-key';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|csv|xlsx|xls/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const allowedMimes = /image\/jpeg|image\/jpg|image\/png|image\/gif|application\/pdf|application\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document|text\/plain|text\/csv|application\/vnd.ms-excel|application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet/;
    const mimetype = allowedMimes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed types: images (jpg, png, gif), PDF, documents (doc, docx), text files (txt, csv), spreadsheets (xls, xlsx)'));
    }
  }
});

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

// Initialize files if not exists
if (!mockData.files) {
  mockData.files = Array.from({ length: 10 }, () => ({
    id: faker.string.uuid(),
    filename: faker.system.fileName(),
    originalName: faker.system.fileName(),
    mimetype: faker.helpers.arrayElement(['image/jpeg', 'image/png', 'application/pdf', 'text/plain']),
    size: faker.number.int({ min: 1024, max: 5242880 }), // 1KB to 5MB
    url: faker.image.url(),
    uploadedBy: faker.helpers.arrayElement(mockData.users).id,
    uploadedAt: faker.date.recent({ days: 30 }).toISOString(),
    tags: faker.helpers.arrayElements(['work', 'personal', 'important', 'archive'], { min: 0, max: 3 }),
    isPublic: faker.datatype.boolean()
  }));
}

// POST /api/v1/files/upload
router.post('/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'No file uploaded',
      code: 'NO_FILE'
    });
  }
  
  const fileData = {
    id: faker.string.uuid(),
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    url: `/api/v1/files/${req.file.filename}`,
    uploadedBy: req.user.userId,
    uploadedAt: new Date().toISOString(),
    tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
    isPublic: req.body.isPublic === 'true'
  };
  
  mockData.files.push(fileData);
  
  res.status(201).json({
    file: fileData,
    message: 'File uploaded successfully'
  });
});

// POST /api/v1/files/upload-multiple
router.post('/upload-multiple', authenticateToken, upload.array('files', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      error: 'No files uploaded',
      code: 'NO_FILES'
    });
  }
  
  const uploadedFiles = req.files.map(file => {
    const fileData = {
      id: faker.string.uuid(),
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/api/v1/files/${file.filename}`,
      uploadedBy: req.user.userId,
      uploadedAt: new Date().toISOString(),
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
      isPublic: req.body.isPublic === 'true'
    };
    
    mockData.files.push(fileData);
    return fileData;
  });
  
  res.status(201).json({
    files: uploadedFiles,
    count: uploadedFiles.length,
    message: `${uploadedFiles.length} files uploaded successfully`
  });
});

// GET /api/v1/files
router.get('/', authenticateToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const mimetype = req.query.mimetype;
  const tag = req.query.tag;
  const myFiles = req.query.myFiles === 'true';
  
  let filteredFiles = mockData.files;
  
  // Filter by owner if requested
  if (myFiles) {
    filteredFiles = filteredFiles.filter(f => f.uploadedBy === req.user.userId);
  } else {
    // Only show public files if not owner
    filteredFiles = filteredFiles.filter(f => 
      f.isPublic || f.uploadedBy === req.user.userId
    );
  }
  
  // Apply search filter
  if (search) {
    filteredFiles = filteredFiles.filter(f => 
      f.originalName.toLowerCase().includes(search.toLowerCase()) ||
      f.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    );
  }
  
  // Filter by mimetype
  if (mimetype) {
    filteredFiles = filteredFiles.filter(f => f.mimetype.startsWith(mimetype));
  }
  
  // Filter by tag
  if (tag) {
    filteredFiles = filteredFiles.filter(f => f.tags.includes(tag));
  }
  
  // Sort by upload date (newest first)
  filteredFiles.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  
  // Pagination
  const skip = (page - 1) * limit;
  const paginatedFiles = filteredFiles.slice(skip, skip + limit);
  
  // Add uploader info
  const filesWithUploader = paginatedFiles.map(file => {
    const uploader = mockData.users.find(u => u.id === file.uploadedBy);
    return {
      ...file,
      uploader: uploader ? {
        id: uploader.id,
        username: uploader.username,
        firstName: uploader.firstName,
        lastName: uploader.lastName
      } : null
    };
  });
  
  res.json({
    files: filesWithUploader,
    pagination: {
      page,
      limit,
      total: filteredFiles.length,
      pages: Math.ceil(filteredFiles.length / limit)
    }
  });
});

// GET /api/v1/files/:id
router.get('/:id', authenticateToken, (req, res) => {
  const file = mockData.files.find(f => f.id === req.params.id);
  
  if (!file) {
    return res.status(404).json({
      error: 'File not found',
      code: 'FILE_NOT_FOUND'
    });
  }
  
  // Check permissions
  if (!file.isPublic && file.uploadedBy !== req.user.userId) {
    return res.status(403).json({
      error: 'Access denied',
      code: 'ACCESS_DENIED'
    });
  }
  
  const uploader = mockData.users.find(u => u.id === file.uploadedBy);
  
  res.json({
    ...file,
    uploader: uploader ? {
      id: uploader.id,
      username: uploader.username,
      firstName: uploader.firstName,
      lastName: uploader.lastName
    } : null
  });
});

// GET /api/v1/files/download/:filename
router.get('/download/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../../uploads', req.params.filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      error: 'File not found',
      code: 'FILE_NOT_FOUND'
    });
  }
  
  res.download(filePath);
});

// GET /api/v1/files/view/:filename (for direct file access)
router.get('/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../../uploads', req.params.filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      error: 'File not found',
      code: 'FILE_NOT_FOUND'
    });
  }
  
  res.sendFile(filePath);
});

// PUT /api/v1/files/:id
router.put('/:id', authenticateToken, (req, res) => {
  const fileIndex = mockData.files.findIndex(f => f.id === req.params.id);
  
  if (fileIndex === -1) {
    return res.status(404).json({
      error: 'File not found',
      code: 'FILE_NOT_FOUND'
    });
  }
  
  const file = mockData.files[fileIndex];
  
  // Check permissions
  if (file.uploadedBy !== req.user.userId) {
    return res.status(403).json({
      error: 'Access denied',
      code: 'ACCESS_DENIED'
    });
  }
  
  // Update allowed fields
  const { tags, isPublic } = req.body;
  
  if (tags) {
    mockData.files[fileIndex].tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
  }
  
  if (typeof isPublic === 'boolean') {
    mockData.files[fileIndex].isPublic = isPublic;
  }
  
  res.json({
    file: mockData.files[fileIndex],
    message: 'File updated successfully'
  });
});

// DELETE /api/v1/files/:id
router.delete('/:id', authenticateToken, (req, res) => {
  const fileIndex = mockData.files.findIndex(f => f.id === req.params.id);
  
  if (fileIndex === -1) {
    return res.status(404).json({
      error: 'File not found',
      code: 'FILE_NOT_FOUND'
    });
  }
  
  const file = mockData.files[fileIndex];
  
  // Check permissions
  if (file.uploadedBy !== req.user.userId && req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied',
      code: 'ACCESS_DENIED'
    });
  }
  
  // Delete physical file
  const filePath = path.join(__dirname, '../../uploads', file.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  
  // Remove from mock data
  mockData.files.splice(fileIndex, 1);
  
  res.json({
    message: 'File deleted successfully'
  });
});

// GET /api/v1/files/stats/overview
router.get('/stats/overview', authenticateToken, (req, res) => {
  const userFiles = mockData.files.filter(f => f.uploadedBy === req.user.userId);
  const totalSize = userFiles.reduce((sum, f) => sum + f.size, 0);
  
  const typeStats = userFiles.reduce((stats, file) => {
    const type = file.mimetype.split('/')[0];
    stats[type] = (stats[type] || 0) + 1;
    return stats;
  }, {});
  
  res.json({
    totalFiles: userFiles.length,
    totalSize,
    totalSizeFormatted: `${(totalSize / (1024 * 1024)).toFixed(2)} MB`,
    typeBreakdown: typeStats,
    recentUploads: userFiles
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
      .slice(0, 5)
  });
});

module.exports = router;
