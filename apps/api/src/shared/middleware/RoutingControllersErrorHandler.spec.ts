import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { DomainException } from '@nx-starter/domain';
import { ValidationError } from '@nx-starter/application-shared';
import { RoutingControllersErrorHandler } from './RoutingControllersErrorHandler';

describe('RoutingControllersErrorHandler', () => {
  let errorHandler: RoutingControllersErrorHandler;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let consoleErrorSpy: any;

  beforeEach(() => {
    errorHandler = new RoutingControllersErrorHandler();
    
    mockReq = {
      method: 'GET',
      path: '/test',
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      headersSent: false,
    };

    mockNext = vi.fn();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Set default NODE_ENV for testing
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  describe('error method', () => {
    it('should handle errors when headers already sent', () => {
      mockRes.headersSent = true;
      const error = new Error('Test error');

      errorHandler.error(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should handle DomainException errors', () => {
      const error = new DomainException('Domain error message', 'DOMAIN_ERROR', 400);

      errorHandler.error(error, mockReq as Request, mockRes as Response, mockNext);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Controller error:', error);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Domain error message',
        code: 'DOMAIN_ERROR',
      });
    });

    it('should handle ValidationError from application layer', () => {
      const validationError = new ValidationError([
        { 
          code: 'invalid_type',
          path: ['title'], 
          message: 'Title is required',
          expected: 'string',
          received: 'undefined'
        }
      ], 'Validation failed');

      errorHandler.error(validationError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: {
          message: 'Validation failed',
          issues: [{ 
            code: 'invalid_type',
            path: ['title'], 
            message: 'Title is required',
            expected: 'string',
            received: 'undefined'
          }],
          fieldErrors: { title: ['Title is required'] },
        },
      });
    });

    it('should handle ZodError validation errors', () => {
      const zodError = new ZodError([
        { 
          path: ['title'], 
          message: 'String must contain at least 1 character(s)', 
          code: 'too_small',
          minimum: 1,
          type: 'string',
          inclusive: true
        } as never,
      ]);

      errorHandler.error(zodError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: zodError.issues,
      });
    });

    it('should handle JSON parsing errors', () => {
      const error = { type: 'entity.parse.failed', message: 'Invalid JSON' };

      errorHandler.error(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid JSON format',
        code: 'INVALID_JSON',
        message: 'Request body contains invalid JSON',
      });
    });

    it('should handle routing-controllers HTTP errors with 404 code', () => {
      const error = { httpCode: 404, message: 'Resource not found' };

      errorHandler.error(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Resource not found',
        code: 'NOT_FOUND',
      });
    });

    it('should handle routing-controllers HTTP errors with 400 code', () => {
      const error = { httpCode: 400, message: 'Bad request' };

      errorHandler.error(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Bad request',
        code: 'BAD_REQUEST',
      });
    });

    it('should handle routing-controllers HTTP errors with 401 code', () => {
      const error = { httpCode: 401, message: 'Unauthorized' };

      errorHandler.error(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized',
        code: 'UNAUTHORIZED',
      });
    });

    it('should handle routing-controllers HTTP errors with 403 code', () => {
      const error = { httpCode: 403, message: 'Forbidden' };

      errorHandler.error(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Forbidden',
        code: 'FORBIDDEN',
      });
    });

    it('should handle routing-controllers HTTP errors with unknown codes', () => {
      const error = { httpCode: 418, message: 'I am a teapot' };

      errorHandler.error(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(418);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'I am a teapot',
        code: 'UNKNOWN_ERROR',
      });
    });

    it('should handle errors with "not found" message', () => {
      const error = new Error('Todo with ID 123 not found');

      errorHandler.error(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Todo with ID 123 not found',
        code: 'NOT_FOUND',
      });
    });

    it('should handle ValidationError by name', () => {
      const error = { name: 'ValidationError', message: 'Validation failed' };

      errorHandler.error(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
      });
    });

    it('should handle CastError', () => {
      const error = { name: 'CastError', message: 'Cast to ObjectId failed' };

      errorHandler.error(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid ID format',
        code: 'INVALID_ID_FORMAT',
      });
    });

    it('should handle generic errors in development mode', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Generic development error');

      errorHandler.error(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Generic development error',
      });
    });

    it('should handle generic errors in production mode', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Generic production error');

      errorHandler.error(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong',
      });
    });

    it('should handle errors without message property', () => {
      const error = { code: 'UNKNOWN' };

      errorHandler.error(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
        message: process.env.NODE_ENV === 'development' ? undefined : 'Something went wrong',
      });
    });
  });
});