import { Request, Response, NextFunction } from 'express';
import { Middleware, ExpressErrorMiddlewareInterface } from 'routing-controllers';
import { DomainException } from '@nx-starter/domain';
import { ZodError } from 'zod';
import { ValidationError } from '@nx-starter/application-shared';

/**
 * Custom error handler for routing-controllers
 * Handles domain exceptions and validation errors properly
 */
@Middleware({ type: 'after' })
export class RoutingControllersErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: any, request: Request, response: Response, next: NextFunction): void {
    console.error('Controller error:', error);

    // If response already sent, delegate to default Express error handler
    if (response.headersSent) {
      return next(error);
    }

    // Handle domain exceptions FIRST (highest priority)
    if (error instanceof DomainException) {
      response.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
      });
      return;
    }

    // Handle our custom ValidationError (from OOP validation services)
    if (error instanceof ValidationError) {
      response.status(400).json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: {
          message: error.message,
          issues: error.issues,
          fieldErrors: error.getIssuesByField(),
        },
      });
      return;
    }

    // Handle validation errors (Zod)
    if (error instanceof ZodError) {
      response.status(400).json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.issues,
      });
      return;
    }

    // Handle JSON parsing errors
    if (error.type === 'entity.parse.failed') {
      response.status(400).json({
        success: false,
        error: 'Invalid JSON format',
        code: 'INVALID_JSON',
        message: 'Request body contains invalid JSON',
      });
      return;
    }

    // Handle routing-controllers HTTP errors (NotFoundError, BadRequestError, etc.)
    if (error.httpCode) {
      // Try to map to appropriate error codes
      let code = 'UNKNOWN_ERROR';
      if (error.httpCode === 404) {
        code = 'NOT_FOUND';
      } else if (error.httpCode === 400) {
        code = 'BAD_REQUEST';
      } else if (error.httpCode === 401) {
        code = 'UNAUTHORIZED';
      } else if (error.httpCode === 403) {
        code = 'FORBIDDEN';
      }

      response.status(error.httpCode).json({
        success: false,
        error: error.message,
        code: code,
      });
      return;
    }

    // Handle not found errors (fallback)
    if (error.message?.includes('not found')) {
      response.status(404).json({
        success: false,
        error: error.message,
        code: 'NOT_FOUND',
      });
      return;
    }

    // Handle validation errors (different type)
    if (error.name === 'ValidationError') {
      response.status(400).json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        message: error.message,
      });
      return;
    }

    // Handle cast errors
    if (error.name === 'CastError') {
      response.status(400).json({
        success: false,
        error: 'Invalid ID format',
        code: 'INVALID_ID_FORMAT',
      });
      return;
    }

    // Generic server error
    response.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    });
  }
}