import { Request, Response, NextFunction } from 'express';
import { DomainException } from '@nx-starter/domain';
import { ZodError } from 'zod';

/**
 * Async error handler wrapper to avoid repetitive try-catch blocks
 * Wraps controller methods and automatically handles errors
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      handleControllerError(error, req, res, next);
    });
  };
};

/**
 * Centralized error handling for controllers
 */
export const handleControllerError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Controller error:', error);

  if (error instanceof DomainException) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
      code: error.code,
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.issues,
    });
    return;
  }

  if (error.message?.includes('not found')) {
    res.status(404).json({
      success: false,
      error: error.message,
    });
    return;
  }

  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: error.message,
    });
    return;
  }

  if (error.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: 'Invalid ID format',
    });
    return;
  }

  // Generic server error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
};

/**
 * Express error middleware for unhandled errors
 */
export const errorMiddleware = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Handle JSON parsing errors
  if (error.type === 'entity.parse.failed') {
    res.status(400).json({
      success: false,
      error: 'Invalid JSON format',
    });
    return;
  }

  handleControllerError(error, req, res, next);
};
