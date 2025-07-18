import { Request, Response, NextFunction } from 'express';
import { Middleware, ExpressErrorMiddlewareInterface } from 'routing-controllers';
import { DomainException } from '@nx-starter/domain-core';
import { ZodError } from 'zod';

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

    // Handle JSON parsing errors
    if (error.type === 'entity.parse.failed') {
      response.status(400).json({
        success: false,
        error: 'Invalid JSON format',
        message: 'Request body contains invalid JSON',
      });
      return;
    }

    // Handle routing-controllers HTTP errors (NotFoundError, BadRequestError, etc.)
    if (error.httpCode) {
      response.status(error.httpCode).json({
        success: false,
        error: error.message,
      });
      return;
    }

    // Handle domain exceptions
    if (error instanceof DomainException) {
      response.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
      });
      return;
    }

    // Handle validation errors
    if (error instanceof ZodError) {
      response.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.issues,
      });
      return;
    }

    // Handle not found errors
    if (error.message?.includes('not found')) {
      response.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }

    // Handle validation errors (different type)
    if (error.name === 'ValidationError') {
      response.status(400).json({
        success: false,
        error: 'Validation failed',
        message: error.message,
      });
      return;
    }

    // Handle cast errors
    if (error.name === 'CastError') {
      response.status(400).json({
        success: false,
        error: 'Invalid ID format',
      });
      return;
    }

    // Generic server error
    response.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    });
  }
}