import { Request, Response, NextFunction } from 'express';
import { Middleware, ExpressMiddlewareInterface } from 'routing-controllers';
import { injectable } from 'tsyringe';
import { ValidationError } from '../ValidationService';

/**
 * Middleware to handle validation errors globally
 * Integrates with routing-controllers middleware system
 */
@Middleware({ type: 'before' })
@injectable()
export class ValidationMiddleware implements ExpressMiddlewareInterface {
  use(request: Request, response: Response, next: NextFunction): void {
    // This middleware runs before each request
    // We can add any pre-validation logic here if needed
    next();
  }
}

/**
 * Middleware to transform validation errors into proper HTTP responses
 * This should be used in the error handling chain
 */
@Middleware({ type: 'after' })
@injectable()
export class ValidationErrorMiddleware implements ExpressMiddlewareInterface {
  use(request: Request, response: Response, next: NextFunction): void {
    // This runs after the request has been processed
    // Error handling is done in the main error handler
    next();
  }
}

/**
 * Utility function to check if an error is a validation error
 */
export function isValidationError(error: any): error is ValidationError {
  return error instanceof ValidationError || error.name === 'ValidationError';
}

/**
 * Utility function to format validation errors for API responses
 */
export function formatValidationErrorResponse(error: ValidationError) {
  return {
    success: false,
    error: 'Validation failed',
    code: 'VALIDATION_ERROR',
    details: {
      message: error.message,
      issues: error.issues,
      fieldErrors: error.getIssuesByField(),
    },
  };
}