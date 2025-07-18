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

// POST /api/v1/ai/llm/call
router.post('/llm/call', authenticateToken, (req, res) => {
  const { model, prompt, options = {} } = req.body;
  
  // Validation
  if (!model || !prompt) {
    return res.status(400).json({
      error: 'Model and prompt are required',
      code: 'VALIDATION_ERROR'
    });
  }
  
  // Simulate processing delay
  setTimeout(() => {
    // Mock LLM response
    const response = {
      id: faker.string.uuid(),
      model,
      prompt,
      response: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })),
      usage: {
        promptTokens: faker.number.int({ min: 10, max: 100 }),
        completionTokens: faker.number.int({ min: 50, max: 200 }),
        totalTokens: faker.number.int({ min: 60, max: 300 })
      },
      finishReason: faker.helpers.arrayElement(['stop', 'length', 'content_filter']),
      createdAt: new Date().toISOString(),
      processingTime: faker.number.int({ min: 500, max: 3000 }),
      requestedBy: req.user.userId,
      options
    };
    
    // Initialize AI calls if not exists
    if (!mockData.aiCalls) {
      mockData.aiCalls = [];
    }
    
    mockData.aiCalls.push(response);
    
    res.json(response);
  }, faker.number.int({ min: 300, max: 1000 })); // Simulate API delay
});

// POST /api/v1/ai/planner/call
router.post('/planner/call', authenticateToken, (req, res) => {
  const { goal, context, constraints = [] } = req.body;
  
  // Validation
  if (!goal) {
    return res.status(400).json({
      error: 'Goal is required',
      code: 'VALIDATION_ERROR'
    });
  }
  
  // Simulate processing delay
  setTimeout(() => {
    // Mock planner response
    const steps = Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, (_, i) => ({
      id: i + 1,
      action: faker.helpers.arrayElement([
        'analyze_data',
        'fetch_information',
        'process_request',
        'validate_input',
        'generate_output',
        'review_results',
        'optimize_solution',
        'finalize_plan'
      ]),
      description: faker.lorem.sentence(),
      estimated_time: faker.number.int({ min: 1, max: 30 }),
      dependencies: i > 0 ? [faker.number.int({ min: 1, max: i })] : [],
      status: 'pending'
    }));
    
    const response = {
      id: faker.string.uuid(),
      goal,
      context,
      constraints,
      plan: {
        steps,
        totalSteps: steps.length,
        estimatedTime: steps.reduce((sum, step) => sum + step.estimated_time, 0),
        complexity: faker.helpers.arrayElement(['low', 'medium', 'high']),
        confidence: faker.number.float({ min: 0.7, max: 0.95, fractionDigits: 2 })
      },
      createdAt: new Date().toISOString(),
      processingTime: faker.number.int({ min: 800, max: 2000 }),
      requestedBy: req.user.userId,
      status: 'completed'
    };
    
    // Initialize planner calls if not exists
    if (!mockData.plannerCalls) {
      mockData.plannerCalls = [];
    }
    
    mockData.plannerCalls.push(response);
    
    res.json(response);
  }, faker.number.int({ min: 500, max: 1500 })); // Simulate API delay
});

// POST /api/v1/ai/agent/call
router.post('/agent/call', authenticateToken, (req, res) => {
  const { agentType, task, parameters = {} } = req.body;
  
  // Validation
  if (!agentType || !task) {
    return res.status(400).json({
      error: 'Agent type and task are required',
      code: 'VALIDATION_ERROR'
    });
  }
  
  // Simulate processing delay
  setTimeout(() => {
    // Mock agent response
    const response = {
      id: faker.string.uuid(),
      agentType,
      task,
      parameters,
      result: {
        success: faker.datatype.boolean({ probability: 0.9 }),
        data: {
          output: faker.lorem.paragraphs(2),
          confidence: faker.number.float({ min: 0.6, max: 0.98, fractionDigits: 2 }),
          recommendations: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => 
            faker.lorem.sentence()
          )
        },
        executionSteps: Array.from({ length: faker.number.int({ min: 2, max: 6 }) }, (_, i) => ({
          step: i + 1,
          action: faker.lorem.words(3),
          status: 'completed',
          duration: faker.number.int({ min: 100, max: 1000 })
        }))
      },
      metrics: {
        processingTime: faker.number.int({ min: 1000, max: 5000 }),
        resourceUsage: faker.number.float({ min: 0.1, max: 0.8, fractionDigits: 2 }),
        accuracy: faker.number.float({ min: 0.85, max: 0.99, fractionDigits: 2 })
      },
      createdAt: new Date().toISOString(),
      completedAt: new Date(Date.now() + faker.number.int({ min: 1000, max: 5000 })).toISOString(),
      requestedBy: req.user.userId,
      status: 'completed'
    };
    
    // Initialize agent calls if not exists
    if (!mockData.agentCalls) {
      mockData.agentCalls = [];
    }
    
    mockData.agentCalls.push(response);
    
    res.json(response);
  }, faker.number.int({ min: 800, max: 2000 })); // Simulate API delay
});

// POST /api/v1/ai/mcp/call
router.post('/mcp/call', authenticateToken, (req, res) => {
  const { server, method, params = {} } = req.body;
  
  // Validation
  if (!server || !method) {
    return res.status(400).json({
      error: 'Server and method are required',
      code: 'VALIDATION_ERROR'
    });
  }
  
  // Simulate processing delay
  setTimeout(() => {
    // Mock MCP response
    const response = {
      id: faker.string.uuid(),
      server,
      method,
      params,
      result: {
        success: faker.datatype.boolean({ probability: 0.95 }),
        data: {
          response: faker.lorem.paragraphs(1),
          metadata: {
            version: faker.system.semver(),
            timestamp: new Date().toISOString(),
            processed_by: server
          }
        },
        capabilities: faker.helpers.arrayElements([
          'text_generation',
          'code_analysis',
          'data_processing',
          'file_handling',
          'web_scraping',
          'database_query'
        ], { min: 1, max: 3 })
      },
      performance: {
        latency: faker.number.int({ min: 50, max: 500 }),
        throughput: faker.number.float({ min: 1.0, max: 10.0, fractionDigits: 2 }),
        memory_usage: faker.number.float({ min: 0.1, max: 0.6, fractionDigits: 2 })
      },
      createdAt: new Date().toISOString(),
      requestedBy: req.user.userId,
      status: 'completed'
    };
    
    // Initialize MCP calls if not exists
    if (!mockData.mcpCalls) {
      mockData.mcpCalls = [];
    }
    
    mockData.mcpCalls.push(response);
    
    res.json(response);
  }, faker.number.int({ min: 200, max: 800 })); // Simulate API delay
});

// GET /api/v1/ai/models
router.get('/models', authenticateToken, (req, res) => {
  const models = [
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'OpenAI',
      type: 'text',
      maxTokens: 8192,
      costPer1kTokens: 0.03,
      capabilities: ['text_generation', 'reasoning', 'code_generation']
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'OpenAI',
      type: 'text',
      maxTokens: 4096,
      costPer1kTokens: 0.002,
      capabilities: ['text_generation', 'conversation']
    },
    {
      id: 'claude-3',
      name: 'Claude 3',
      provider: 'Anthropic',
      type: 'text',
      maxTokens: 100000,
      costPer1kTokens: 0.025,
      capabilities: ['text_generation', 'analysis', 'reasoning']
    },
    {
      id: 'dall-e-3',
      name: 'DALL-E 3',
      provider: 'OpenAI',
      type: 'image',
      maxTokens: null,
      costPerImage: 0.04,
      capabilities: ['image_generation']
    }
  ];
  
  res.json({
    models,
    count: models.length
  });
});

// GET /api/v1/ai/history
router.get('/history', authenticateToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const type = req.query.type; // 'llm', 'planner', 'agent', 'mcp'
  
  // Combine all AI calls
  let allCalls = [];
  
  if (mockData.aiCalls) {
    allCalls.push(...mockData.aiCalls.map(call => ({ ...call, type: 'llm' })));
  }
  if (mockData.plannerCalls) {
    allCalls.push(...mockData.plannerCalls.map(call => ({ ...call, type: 'planner' })));
  }
  if (mockData.agentCalls) {
    allCalls.push(...mockData.agentCalls.map(call => ({ ...call, type: 'agent' })));
  }
  if (mockData.mcpCalls) {
    allCalls.push(...mockData.mcpCalls.map(call => ({ ...call, type: 'mcp' })));
  }
  
  // Filter by user
  allCalls = allCalls.filter(call => call.requestedBy === req.user.userId);
  
  // Filter by type if specified
  if (type) {
    allCalls = allCalls.filter(call => call.type === type);
  }
  
  // Sort by creation date (newest first)
  allCalls.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // Pagination
  const skip = (page - 1) * limit;
  const paginatedCalls = allCalls.slice(skip, skip + limit);
  
  res.json({
    calls: paginatedCalls,
    pagination: {
      page,
      limit,
      total: allCalls.length,
      pages: Math.ceil(allCalls.length / limit)
    }
  });
});

// GET /api/v1/ai/stats
router.get('/stats', authenticateToken, (req, res) => {
  const userAiCalls = mockData.aiCalls ? mockData.aiCalls.filter(c => c.requestedBy === req.user.userId) : [];
  const userPlannerCalls = mockData.plannerCalls ? mockData.plannerCalls.filter(c => c.requestedBy === req.user.userId) : [];
  const userAgentCalls = mockData.agentCalls ? mockData.agentCalls.filter(c => c.requestedBy === req.user.userId) : [];
  const userMcpCalls = mockData.mcpCalls ? mockData.mcpCalls.filter(c => c.requestedBy === req.user.userId) : [];
  
  const totalCalls = userAiCalls.length + userPlannerCalls.length + userAgentCalls.length + userMcpCalls.length;
  const totalTokens = userAiCalls.reduce((sum, call) => sum + (call.usage?.totalTokens || 0), 0);
  const averageProcessingTime = totalCalls > 0 ? 
    [...userAiCalls, ...userPlannerCalls, ...userAgentCalls, ...userMcpCalls]
      .reduce((sum, call) => sum + (call.processingTime || 0), 0) / totalCalls : 0;
  
  res.json({
    overview: {
      totalCalls,
      totalTokens,
      averageProcessingTime: Math.round(averageProcessingTime),
      estimatedCost: (totalTokens / 1000) * 0.002 // Mock cost calculation
    },
    breakdown: {
      llm: userAiCalls.length,
      planner: userPlannerCalls.length,
      agent: userAgentCalls.length,
      mcp: userMcpCalls.length
    },
    recentActivity: [...userAiCalls, ...userPlannerCalls, ...userAgentCalls, ...userMcpCalls]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(call => ({
        id: call.id,
        type: call.model ? 'llm' : call.goal ? 'planner' : call.agentType ? 'agent' : 'mcp',
        timestamp: call.createdAt,
        processingTime: call.processingTime
      }))
  });
});

module.exports = router;
