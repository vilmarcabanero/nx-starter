import { ZodSchema, ZodError } from 'zod';
import { injectable } from 'tsyringe';

/**
 * Abstract base class for validation services
 * Follows the Single Responsibility Principle by focusing solely on validation
 */
export abstract class ValidationService<TInput = unknown, TOutput = TInput> {
  protected abstract schema: ZodSchema<TOutput>;

  /**
   * Validates input data against the schema
   * @param data - The data to validate
   * @returns Validated and transformed data
   * @throws ZodError if validation fails
   */
  validate(data: TInput): TOutput {
    try {
      return this.schema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        // Re-throw with enhanced error context
        throw new ValidationError(
          error.issues.map(issue => ({
            code: issue.code,
            path: issue.path.map(p => String(p)),
            message: issue.message,
            expected: (issue as any).expected,
            received: (issue as any).received,
          })),
          `Validation failed for ${this.constructor.name}`
        );
      }
      throw error;
    }
  }

  /**
   * Safely validates input data without throwing
   * @param data - The data to validate
   * @returns Result object with success status and data or error
   */
  safeParse(data: TInput): ValidationResult<TOutput> {
    try {
      const result = this.schema.parse(data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof ZodError) {
        return { 
          success: false, 
          error: new ValidationError(
            error.issues.map(issue => ({
              code: issue.code,
              path: issue.path.map(p => String(p)),
              message: issue.message,
              expected: (issue as any).expected,
              received: (issue as any).received,
            })),
            `Validation failed for ${this.constructor.name}`
          )
        };
      }
      return { success: false, error: error as Error };
    }
  }
}

/**
 * Custom validation error that extends the standard Error
 * Provides structured error information for better error handling
 */
export class ValidationError extends Error {
  constructor(
    public readonly issues: Array<{
      code: string;
      path: (string | number)[];
      message: string;
      expected?: string;
      received?: string;
    }>,
    message?: string
  ) {
    super(message || 'Validation failed');
    this.name = 'ValidationError';
  }

  /**
   * Returns a formatted error message with all validation issues
   */
  getFormattedMessage(): string {
    const issueMessages = this.issues.map(issue => {
      const path = issue.path.length > 0 ? ` at ${issue.path.join('.')}` : '';
      return `${issue.message}${path}`;
    });
    return `Validation failed:\n${issueMessages.join('\n')}`;
  }

  /**
   * Returns validation issues grouped by field path
   */
  getIssuesByField(): Record<string, string[]> {
    const issuesByField: Record<string, string[]> = {};
    
    this.issues.forEach(issue => {
      const fieldPath = issue.path.join('.') || 'root';
      if (!issuesByField[fieldPath]) {
        issuesByField[fieldPath] = [];
      }
      issuesByField[fieldPath].push(issue.message);
    });

    return issuesByField;
  }
}

/**
 * Result type for safe validation operations
 */
export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ValidationError | Error };

/**
 * Interface for dependency injection of validation services
 */
export interface IValidationService<TInput = unknown, TOutput = TInput> {
  validate(data: TInput): TOutput;
  safeParse(data: TInput): ValidationResult<TOutput>;
}