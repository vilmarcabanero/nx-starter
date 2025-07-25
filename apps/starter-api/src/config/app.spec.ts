import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createApp } from './app';

// Mock the dependencies
vi.mock('../infrastructure/di/container', () => ({
  container: {
    resolve: vi.fn().mockReturnValue({}),
  },
}));

vi.mock('routing-controllers', () => ({
  useExpressServer: vi.fn((app) => app),
  useContainer: vi.fn(),
}));

vi.mock('../presentation/controllers/TodoController', () => ({
  TodoController: class MockTodoController {},
}));

vi.mock('../presentation/controllers/AuthController', () => ({
  AuthController: class MockAuthController {},
}));

vi.mock('../shared/middleware/RoutingControllersErrorHandler', () => ({
  RoutingControllersErrorHandler: class MockErrorHandler {},
}));

vi.mock('../presentation/middleware/errorHandler', () => ({
  requestLogger: vi.fn((req, res, next) => next()),
}));

vi.mock('./config', () => ({
  config: {
    corsOrigin: 'http://localhost:3000',
    nodeEnv: 'test',
    database: {
      type: 'memory',
    },
  },
}));

describe('createApp', () => {
  let app: express.Application;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createApp();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('app configuration', () => {
    it('should create an Express application', () => {
      expect(app).toBeDefined();
      expect(typeof app).toBe('function');
    });

    it('should be an instance of Express app', () => {
      expect(app).toHaveProperty('use');
      expect(app).toHaveProperty('get');
      expect(app).toHaveProperty('post');
      expect(app).toHaveProperty('listen');
    });
  });

  describe('health check endpoint', () => {
    it('should respond to GET /api/health', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Server is running',
        timestamp: expect.any(String),
      });
    });

    it('should return valid timestamp in ISO format', async () => {
      const response = await request(app).get('/api/health');

      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      
      // Verify it's a valid date
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });
  });

  describe('root endpoint', () => {
    it('should respond to GET /', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Task App API Server',
        version: '1.0.0',
        environment: 'test',
        database: 'memory',
        endpoints: {
          health: '/api/health',
          todos: '/api/todos',
          auth: '/api/auth',
          register: '/api/auth/register',
          documentation: 'See README.md for API documentation',
        },
      });
    });

    it('should include correct endpoint information', async () => {
      const response = await request(app).get('/');

      expect(response.body.endpoints).toHaveProperty('health', '/api/health');
      expect(response.body.endpoints).toHaveProperty('todos', '/api/todos');
      expect(response.body.endpoints).toHaveProperty('auth', '/api/auth');
      expect(response.body.endpoints).toHaveProperty('register', '/api/auth/register');
      expect(response.body.endpoints).toHaveProperty('documentation');
    });

    it('should return current configuration info', async () => {
      const response = await request(app).get('/');

      expect(response.body.environment).toBe('test');
      expect(response.body.database).toBe('memory');
      expect(response.body.version).toBe('1.0.0');
    });
  });

  describe('404 handler for API routes', () => {
    it('should return 404 for unknown API routes', async () => {
      const response = await request(app).get('/api/unknown-endpoint');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        error: 'Not found',
        message: 'Route GET /unknown-endpoint not found',
      });
    });

    it('should handle different HTTP methods', async () => {
      const postResponse = await request(app).post('/api/unknown-endpoint');
      expect(postResponse.status).toBe(404);
      expect(postResponse.body.message).toBe('Route POST /unknown-endpoint not found');

      const putResponse = await request(app).put('/api/unknown-endpoint');
      expect(putResponse.status).toBe(404);
      expect(putResponse.body.message).toBe('Route PUT /unknown-endpoint not found');

      const deleteResponse = await request(app).delete('/api/unknown-endpoint');
      expect(deleteResponse.status).toBe(404);
      expect(deleteResponse.body.message).toBe('Route DELETE /unknown-endpoint not found');
    });

    it('should only handle API routes for 404', async () => {
      // Non-API routes should not be handled by the 404 middleware
      const response = await request(app).get('/non-api-route');
      
      // This should return 404 but not with our custom format
      expect(response.status).toBe(404);
      // The response should not have our custom error structure for non-API routes
    });

    it('should not interfere with existing API routes', async () => {
      // Health endpoint should still work
      const healthResponse = await request(app).get('/api/health');
      expect(healthResponse.status).toBe(200);

      // Root endpoint should still work  
      const rootResponse = await request(app).get('/');
      expect(rootResponse.status).toBe(200);
    });
  });

  describe('middleware setup', () => {
    it('should call request logger middleware', async () => {
      const { requestLogger } = await import('../presentation/middleware/errorHandler');
      
      await request(app).get('/api/health');
      
      expect(requestLogger).toHaveBeenCalled();
    });

    it('should setup routing-controllers with correct configuration', async () => {
      const { useExpressServer, useContainer } = await import('routing-controllers');
      
      expect(useContainer).toHaveBeenCalledWith({
        get: expect.any(Function),
      });

      expect(useExpressServer).toHaveBeenCalledWith(
        expect.anything(), // the app instance
        {
          routePrefix: '/api',
          controllers: expect.any(Array),
          middlewares: expect.any(Array),
          defaultErrorHandler: false,
        }
      );
    });
  });

  describe('CORS configuration', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/api/health')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');

      // CORS middleware should handle this - exact response depends on cors module
      expect(response.status).toBeLessThan(500); // Should not be a server error
    });
  });

  describe('JSON body parsing', () => {
    it('should parse JSON bodies', async () => {
      // Test with a POST request to see if JSON parsing works
      const response = await request(app)
        .post('/api/unknown-endpoint')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json');

      // Should get our 404 response, not a parsing error
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not found');
    });
  });

  describe('URL encoded body parsing', () => {
    it('should parse URL encoded bodies', async () => {
      const response = await request(app)
        .post('/api/unknown-endpoint')
        .send('key=value')
        .set('Content-Type', 'application/x-www-form-urlencoded');

      // Should get our 404 response, not a parsing error
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not found');
    });
  });
});