import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import {
  asyncHandler,
  handleControllerError,
  errorMiddleware,
} from './ErrorHandler';
import {
  DomainException,
  TodoNotFoundException,
  InvalidTodoTitleException,
} from '@nx-starter/domain';

describe('Shared ErrorHandler', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let consoleErrorSpy: any;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      path: '/test',
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  describe('asyncHandler', () => {
    it('should handle successful async operations', async () => {
      const mockController = vi.fn().mockResolvedValue(undefined);

      const wrappedHandler = asyncHandler(mockController);
      await wrappedHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(mockController).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should catch and handle async errors', async () => {
      const error = new Error('Async error');
      const mockController = vi.fn().mockRejectedValue(error);

      const wrappedHandler = asyncHandler(mockController);
      await wrappedHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(mockController).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Controller error:', error);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    it('should handle synchronous returns', async () => {
      const mockController = vi.fn().mockReturnValue('sync result');

      const wrappedHandler = asyncHandler(mockController);
      await wrappedHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(mockController).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('handleControllerError', () => {
    it('should handle DomainException errors', () => {
      const error = new TodoNotFoundException('test-id');

      handleControllerError(
        error,
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith('Controller error:', error);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: error.message,
        code: error.code,
      });
    });

    it('should handle InvalidTodoTitleException', () => {
      const error = new InvalidTodoTitleException(
        'must be at least 2 characters long'
      );

      handleControllerError(
        error,
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid todo title: must be at least 2 characters long',
        code: 'INVALID_TODO_TITLE',
      });
    });

    it('should handle ZodError validation errors', () => {
      const zodError = new ZodError([
        { 
          path: ['title'], 
          message: 'Invalid input: expected string, received undefined', 
          code: 'invalid_type',
          expected: 'string'
        } as never,
      ]);

      handleControllerError(
        zodError,
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        details: zodError.issues,
      });
    });

    it('should handle "not found" messages', () => {
      const error = new Error('Todo with ID test-id not found');

      handleControllerError(
        error,
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Todo with ID test-id not found',
      });
    });

    it('should handle ValidationError', () => {
      const error = { name: 'ValidationError', message: 'Validation failed' };

      handleControllerError(
        error,
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        message: 'Validation failed',
      });
    });

    it('should handle CastError', () => {
      const error = { name: 'CastError', message: 'Cast to ObjectId failed' };

      handleControllerError(
        error,
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid ID format',
      });
    });

    it('should handle generic errors as 500', () => {
      const error = new Error('Generic error');

      handleControllerError(
        error,
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
      });
    });

    it('should handle errors without message property', () => {
      const error = { code: 'UNKNOWN' };

      handleControllerError(
        error,
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
      });
    });
  });

  describe('errorMiddleware', () => {
    it('should handle JSON parsing errors', () => {
      const error = { type: 'entity.parse.failed', message: 'Invalid JSON' };

      errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid JSON format',
      });
    });

    it('should delegate non-JSON errors to handleControllerError', () => {
      const error = new Error('General error');

      errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Controller error:', error);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
      });
    });
  });
});
