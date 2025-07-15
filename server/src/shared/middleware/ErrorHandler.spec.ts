import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from './ErrorHandler';

describe('ErrorHandler', () => {
  describe('asyncHandler', () => {
    it('should call handleControllerError when async function throws', async () => {
      const error = new Error('Test error');
      const asyncFn = vi.fn().mockRejectedValue(error);
      const req = {} as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      } as unknown as Response;
      const next = vi.fn() as NextFunction;

      const wrappedFn = asyncHandler(asyncFn);
      await wrappedFn(req, res, next);

      expect(asyncFn).toHaveBeenCalledWith(req, res, next);
      // Error should be handled by handleControllerError, not passed to next
      expect(next).not.toHaveBeenCalled();
      // Should call res.status since it goes through handleControllerError
      expect(res.status).toHaveBeenCalled();
    });

    it('should not call handleControllerError when async function succeeds', async () => {
      const asyncFn = vi.fn().mockResolvedValue(undefined);
      const req = {} as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      } as unknown as Response;
      const next = vi.fn() as NextFunction;

      const wrappedFn = asyncHandler(asyncFn);
      await wrappedFn(req, res, next);

      expect(asyncFn).toHaveBeenCalledWith(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle synchronous functions that return promises', async () => {
      const asyncFn = vi.fn(() => Promise.resolve());
      const req = {} as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      } as unknown as Response;
      const next = vi.fn() as NextFunction;

      const wrappedFn = asyncHandler(asyncFn);
      await wrappedFn(req, res, next);

      expect(asyncFn).toHaveBeenCalledWith(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should pass through all arguments to wrapped function', async () => {
      const asyncFn = vi.fn().mockResolvedValue(undefined);
      const req = { body: { test: 'data' } } as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      } as unknown as Response;
      const next = vi.fn() as NextFunction;

      const wrappedFn = asyncHandler(asyncFn);
      await wrappedFn(req, res, next);

      expect(asyncFn).toHaveBeenCalledWith(req, res, next);
    });

    it('should handle validation errors through handleControllerError', async () => {
      const validationError = {
        name: 'ValidationError',
        message: 'Validation failed',
        issues: [{ field: 'title', message: 'Required' }]
      };
      const asyncFn = vi.fn().mockRejectedValue(validationError);
      const req = {} as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      } as unknown as Response;
      const next = vi.fn() as NextFunction;

      const wrappedFn = asyncHandler(asyncFn);
      await wrappedFn(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });
  });
});