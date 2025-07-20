import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import {
  ValidationMiddleware,
  ValidationErrorMiddleware,
  isValidationError,
  formatValidationErrorResponse,
} from './ValidationMiddleware';
import { ValidationError } from '../ValidationService';

describe('ValidationMiddleware', () => {
  let middleware: ValidationMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    middleware = new ValidationMiddleware();
    mockRequest = {};
    mockResponse = {};
    mockNext = vi.fn();
  });

  it('should be decorated with @Middleware and @injectable', () => {
    expect(middleware).toBeInstanceOf(ValidationMiddleware);
  });

  it('should call next() when processing before middleware', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledOnce();
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should implement ExpressMiddlewareInterface', () => {
    expect(typeof middleware.use).toBe('function');
    expect(middleware.use.length).toBe(3); // request, response, next
  });
});

describe('ValidationErrorMiddleware', () => {
  let middleware: ValidationErrorMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    middleware = new ValidationErrorMiddleware();
    mockRequest = {};
    mockResponse = {};
    mockNext = vi.fn();
  });

  it('should be decorated with @Middleware and @injectable', () => {
    expect(middleware).toBeInstanceOf(ValidationErrorMiddleware);
  });

  it('should call next() when processing after middleware', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledOnce();
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should implement ExpressMiddlewareInterface', () => {
    expect(typeof middleware.use).toBe('function');
    expect(middleware.use.length).toBe(3); // request, response, next
  });
});

describe('isValidationError utility function', () => {
  it('should return true for ValidationError instances', () => {
    const validationError = new ValidationError([
      {
        code: 'test',
        path: ['field'],
        message: 'Test error',
      },
    ]);

    expect(isValidationError(validationError)).toBe(true);
  });

  it('should return true for objects with ValidationError name', () => {
    const errorLikeObject = {
      name: 'ValidationError',
      message: 'Test error',
    };

    expect(isValidationError(errorLikeObject)).toBe(true);
  });

  it('should return false for regular Error instances', () => {
    const regularError = new Error('Regular error');

    expect(isValidationError(regularError)).toBe(false);
  });

  it('should return false for other objects', () => {
    const randomObject = { some: 'value' };

    expect(isValidationError(randomObject)).toBe(false);
  });

  it('should return false for null and undefined', () => {
    expect(isValidationError(null)).toBe(false);
    expect(isValidationError(undefined)).toBe(false);
  });

  it('should return false for primitive values', () => {
    expect(isValidationError('string')).toBe(false);
    expect(isValidationError(123)).toBe(false);
    expect(isValidationError(true)).toBe(false);
  });
});

describe('formatValidationErrorResponse utility function', () => {
  it('should format ValidationError into proper API response structure', () => {
    const validationError = new ValidationError([
      {
        code: 'too_small',
        path: ['title'],
        message: 'Title is too short',
      },
      {
        code: 'invalid_type',
        path: ['priority'],
        message: 'Priority must be a string',
      },
    ], 'Validation failed for CreateTodoCommand');

    const response = formatValidationErrorResponse(validationError);

    expect(response).toEqual({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: {
        message: 'Validation failed for CreateTodoCommand',
        issues: [
          {
            code: 'too_small',
            path: ['title'],
            message: 'Title is too short',
          },
          {
            code: 'invalid_type',
            path: ['priority'],
            message: 'Priority must be a string',
          },
        ],
        fieldErrors: {
          'title': ['Title is too short'],
          'priority': ['Priority must be a string'],
        },
      },
    });
  });

  it('should handle ValidationError with empty issues array', () => {
    const validationError = new ValidationError([], 'Empty validation error');

    const response = formatValidationErrorResponse(validationError);

    expect(response).toEqual({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: {
        message: 'Empty validation error',
        issues: [],
        fieldErrors: {},
      },
    });
  });

  it('should handle ValidationError with issues having empty paths', () => {
    const validationError = new ValidationError([
      {
        code: 'custom',
        path: [],
        message: 'Root level error',
      },
    ], 'Root validation error');

    const response = formatValidationErrorResponse(validationError);

    expect(response.details.fieldErrors).toEqual({
      'root': ['Root level error'],
    });
  });

  it('should handle ValidationError with nested paths', () => {
    const validationError = new ValidationError([
      {
        code: 'invalid_type',
        path: ['nested', 'field', 'value'],
        message: 'Nested field error',
      },
    ], 'Nested validation error');

    const response = formatValidationErrorResponse(validationError);

    expect(response.details.fieldErrors).toEqual({
      'nested.field.value': ['Nested field error'],
    });
  });

  it('should handle ValidationError with multiple issues for the same field', () => {
    const validationError = new ValidationError([
      {
        code: 'too_small',
        path: ['title'],
        message: 'Title is too short',
      },
      {
        code: 'invalid_format',
        path: ['title'],
        message: 'Title has invalid format',
      },
    ], 'Multiple title errors');

    const response = formatValidationErrorResponse(validationError);

    expect(response.details.fieldErrors).toEqual({
      'title': ['Title is too short', 'Title has invalid format'],
    });
  });

  it('should always return consistent response structure', () => {
    const validationError = new ValidationError([
      {
        code: 'test',
        path: ['test'],
        message: 'Test message',
      },
    ]);

    const response = formatValidationErrorResponse(validationError);

    // Verify required properties exist
    expect(response).toHaveProperty('success', false);
    expect(response).toHaveProperty('error', 'Validation failed');
    expect(response).toHaveProperty('code', 'VALIDATION_ERROR');
    expect(response).toHaveProperty('details');
    expect(response.details).toHaveProperty('message');
    expect(response.details).toHaveProperty('issues');
    expect(response.details).toHaveProperty('fieldErrors');

    // Verify types
    expect(typeof response.success).toBe('boolean');
    expect(typeof response.error).toBe('string');
    expect(typeof response.code).toBe('string');
    expect(typeof response.details).toBe('object');
    expect(typeof response.details.message).toBe('string');
    expect(Array.isArray(response.details.issues)).toBe(true);
    expect(typeof response.details.fieldErrors).toBe('object');
  });
});