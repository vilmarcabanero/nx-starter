import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { errorHandler, notFoundHandler, requestLogger } from './errorHandler';

describe('ErrorHandler Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let consoleErrorSpy: any;
  let consoleLogSpy: any;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      path: '/test',
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      headersSent: false,
      on: vi.fn(),
    };

    mockNext = vi.fn();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Mock environment
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe('errorHandler', () => {
    it('should handle general errors in development mode', () => {
      const error = new Error('Test error');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Global error handler:', error);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        message: 'Test error',
      });
    });

    it('should handle general errors in production mode', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Test error');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Global error handler:', error);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        message: 'Something went wrong',
      });
    });

    it('should handle JSON parsing errors', () => {
      const error = { type: 'entity.parse.failed' };

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid JSON format',
        message: 'Request body contains invalid JSON',
      });
    });

    it('should delegate to Express error handler if headers already sent', () => {
      const error = new Error('Test error');
      mockRes.headersSent = true;

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should handle non-Error objects', () => {
      const error = 'String error';

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Global error handler:', error);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        message: undefined, // String doesn't have .message property
      });
    });
  });

  describe('notFoundHandler', () => {
    it('should handle 404 errors with GET method', () => {
      mockReq.method = 'GET';
      mockReq.path = '/unknown';

      notFoundHandler(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not found',
        message: 'Route GET /unknown not found',
      });
    });

    it('should handle 404 errors with POST method', () => {
      mockReq.method = 'POST';
      mockReq.path = '/api/unknown';

      notFoundHandler(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not found',
        message: 'Route POST /api/unknown not found',
      });
    });
  });

  describe('requestLogger', () => {
    it('should log request details when response finishes', () => {
      mockRes.statusCode = 200;

      // Mock Date.now to control timing
      const mockDateNow = vi.spyOn(Date, 'now');
      mockDateNow.mockReturnValueOnce(1000).mockReturnValueOnce(1100); // 100ms duration

      let finishCallback: Function;
      mockRes.on = vi.fn((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));

      // Simulate response finish
      finishCallback();

      expect(consoleLogSpy).toHaveBeenCalledWith('GET /test - 200 - 100ms');

      mockDateNow.mockRestore();
    });

    it('should handle different status codes and methods', () => {
      mockReq.method = 'POST';
      mockReq.path = '/api/todos';
      mockRes.statusCode = 201;

      const mockDateNow = vi.spyOn(Date, 'now');
      mockDateNow.mockReturnValueOnce(2000).mockReturnValueOnce(2050); // 50ms duration

      let finishCallback: Function;
      mockRes.on = vi.fn((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      finishCallback();

      expect(consoleLogSpy).toHaveBeenCalledWith('POST /api/todos - 201 - 50ms');

      mockDateNow.mockRestore();
    });
  });
});
