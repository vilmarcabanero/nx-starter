import { describe, it, expect, beforeEach } from 'vitest';
import { ZodSchema, z, ZodError } from 'zod';
import {
  ValidationService,
  ValidationError,
  IValidationService,
  type ValidationResult,
} from './ValidationService';

// Create a concrete implementation for testing
class TestValidationService extends ValidationService<{ value: string }, { value: string; processed: boolean }> {
  protected schema: ZodSchema<{ value: string; processed: boolean }> = z.object({
    value: z.string().min(1, 'Value is required'),
  }).transform(data => ({
    value: data.value,
    processed: true,
  }));
}

describe('ValidationService', () => {
  let validationService: TestValidationService;

  beforeEach(() => {
    validationService = new TestValidationService();
  });

  describe('validate method', () => {
    it('should validate and transform valid data successfully', () => {
      const inputData = { value: 'test-input' };
      const result = validationService.validate(inputData);

      expect(result).toEqual({
        value: 'test-input',
        processed: true,
      });
    });

    it('should throw ValidationError for invalid data with proper error context', () => {
      const inputData = { value: '' };

      expect(() => validationService.validate(inputData)).toThrow(ValidationError);

      try {
        validationService.validate(inputData);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.message).toContain('Validation failed for TestValidationService');
        expect(validationError.issues).toHaveLength(1);
        expect(validationError.issues[0].code).toBe('too_small');
        expect(validationError.issues[0].message).toBe('Value is required');
        expect(validationError.issues[0].path).toEqual(['value']);
      }
    });

    it('should transform ZodError into ValidationError with enhanced context', () => {
      const inputData = { value: '', extra: 'field' };

      try {
        validationService.validate(inputData);
      } catch (error) {
        const validationError = error as ValidationError;
        expect(validationError.name).toBe('ValidationError');
        expect(validationError.issues[0].path).toEqual(['value']);
        expect(validationError.issues[0].message).toBe('Value is required');
      }
    });

    it('should re-throw non-ZodError errors as-is when schema throws non-ZodError', () => {
      const service = new TestValidationService();
      
      // Mock the schema.parse method to throw a non-ZodError
      const originalParse = service['schema'].parse;
      service['schema'].parse = vi.fn().mockImplementation(() => {
        throw new TypeError('Schema threw a non-ZodError');
      });

      expect(() => service.validate({ value: 'test' })).toThrow(TypeError);
      expect(() => service.validate({ value: 'test' })).toThrow('Schema threw a non-ZodError');
      
      // Restore original method
      service['schema'].parse = originalParse;
    });

    it('should handle non-ZodError in safeParse method', () => {
      const service = new TestValidationService();
      
      // Mock the schema.parse method to throw a non-ZodError
      const originalParse = service['schema'].parse;
      service['schema'].parse = vi.fn().mockImplementation(() => {
        throw new TypeError('Schema threw a non-ZodError in safeParse');
      });

      const result = service.safeParse({ value: 'test' });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(TypeError);
        expect(result.error.message).toBe('Schema threw a non-ZodError in safeParse');
      }
      
      // Restore original method
      service['schema'].parse = originalParse;
    });
  });

  describe('safeParse method', () => {
    it('should return success result for valid data', () => {
      const inputData = { value: 'test-input' };
      const result = validationService.safeParse(inputData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          value: 'test-input',
          processed: true,
        });
      }
    });

    it('should return failure result with ValidationError for invalid data', () => {
      const inputData = { value: '' };
      const result = validationService.safeParse(inputData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ValidationError);
        const validationError = result.error as ValidationError;
        expect(validationError.message).toContain('Validation failed for TestValidationService');
        expect(validationError.issues).toHaveLength(1);
        expect(validationError.issues[0].message).toBe('Value is required');
      }
    });

    it('should return failure result with Error for non-ZodError exceptions', () => {
      // This test is already handled above with the mock approach
      // but let's keep this simpler version as well for completeness
      const service = new TestValidationService();
      
      // Mock to throw a generic Error  
      const originalParse = service['schema'].parse;
      service['schema'].parse = vi.fn().mockImplementation(() => {
        throw new Error('Generic error from schema');
      });

      const result = service.safeParse({ value: 'test' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error.message).toBe('Generic error from schema');
        expect(result.error).not.toBeInstanceOf(ValidationError);
      }
      
      // Restore original method
      service['schema'].parse = originalParse;
    });
  });
});

describe('ValidationError', () => {
  const mockIssues = [
    {
      code: 'too_small',
      path: ['field1'],
      message: 'Field1 is too small',
      expected: '1',
      received: '0',
    },
    {
      code: 'invalid_type',
      path: ['nested', 'field2'],
      message: 'Field2 must be a string',
      expected: 'string',
      received: 'number',
    },
    {
      code: 'custom',
      path: [],
      message: 'Root level error',
    },
  ];

  describe('constructor', () => {
    it('should create ValidationError with custom message', () => {
      const error = new ValidationError(mockIssues, 'Custom validation message');

      expect(error.message).toBe('Custom validation message');
      expect(error.name).toBe('ValidationError');
      expect(error.issues).toEqual(mockIssues);
    });

    it('should create ValidationError with default message when none provided', () => {
      const error = new ValidationError(mockIssues);

      expect(error.message).toBe('Validation failed');
      expect(error.name).toBe('ValidationError');
      expect(error.issues).toEqual(mockIssues);
    });
  });

  describe('getFormattedMessage', () => {
    it('should format error message with all validation issues', () => {
      const error = new ValidationError(mockIssues);
      const formattedMessage = error.getFormattedMessage();

      expect(formattedMessage).toContain('Validation failed:');
      expect(formattedMessage).toContain('Field1 is too small at field1');
      expect(formattedMessage).toContain('Field2 must be a string at nested.field2');
      expect(formattedMessage).toContain('Root level error');
    });

    it('should handle issues without path correctly', () => {
      const issuesWithoutPath = [
        {
          code: 'custom',
          path: [],
          message: 'Root error',
        },
      ];

      const error = new ValidationError(issuesWithoutPath);
      const formattedMessage = error.getFormattedMessage();

      expect(formattedMessage).toBe('Validation failed:\nRoot error');
    });
  });

  describe('getIssuesByField', () => {
    it('should group issues by field path', () => {
      const error = new ValidationError(mockIssues);
      const issuesByField = error.getIssuesByField();

      expect(issuesByField).toEqual({
        'field1': ['Field1 is too small'],
        'nested.field2': ['Field2 must be a string'],
        'root': ['Root level error'],
      });
    });

    it('should handle multiple issues for the same field', () => {
      const multipleIssues = [
        {
          code: 'too_small',
          path: ['field1'],
          message: 'Field1 is too small',
        },
        {
          code: 'invalid_format',
          path: ['field1'],
          message: 'Field1 has invalid format',
        },
      ];

      const error = new ValidationError(multipleIssues);
      const issuesByField = error.getIssuesByField();

      expect(issuesByField).toEqual({
        'field1': ['Field1 is too small', 'Field1 has invalid format'],
      });
    });

    it('should handle empty path as root field', () => {
      const rootIssues = [
        {
          code: 'custom',
          path: [],
          message: 'Root error 1',
        },
        {
          code: 'custom',
          path: [],
          message: 'Root error 2',
        },
      ];

      const error = new ValidationError(rootIssues);
      const issuesByField = error.getIssuesByField();

      expect(issuesByField).toEqual({
        'root': ['Root error 1', 'Root error 2'],
      });
    });
  });
});

describe('IValidationService interface', () => {
  it('should define the correct validation service contract', () => {
    const mockValidationService: IValidationService<string, { processed: string }> = {
      validate: (data: string) => ({ processed: data }),
      safeParse: (data: string) => ({ success: true, data: { processed: data } }),
    };

    expect(typeof mockValidationService.validate).toBe('function');
    expect(typeof mockValidationService.safeParse).toBe('function');

    // Test that the interface contract works
    const result = mockValidationService.validate('test');
    expect(result.processed).toBe('test');

    const safeResult = mockValidationService.safeParse('test');
    expect(safeResult.success).toBe(true);
  });
});

describe('ValidationResult type', () => {
  it('should support success result type', () => {
    const successResult: ValidationResult<string> = {
      success: true,
      data: 'test-data',
    };

    expect(successResult.success).toBe(true);
    if (successResult.success) {
      expect(successResult.data).toBe('test-data');
    }
  });

  it('should support failure result with ValidationError', () => {
    const failureResult: ValidationResult<string> = {
      success: false,
      error: new ValidationError([
        {
          code: 'test',
          path: ['test'],
          message: 'Test error',
        },
      ]),
    };

    expect(failureResult.success).toBe(false);
    if (!failureResult.success) {
      expect(failureResult.error).toBeInstanceOf(ValidationError);
    }
  });

  it('should support failure result with generic Error', () => {
    const failureResult: ValidationResult<string> = {
      success: false,
      error: new Error('Generic error'),
    };

    expect(failureResult.success).toBe(false);
    if (!failureResult.success) {
      expect(failureResult.error).toBeInstanceOf(Error);
      expect(failureResult.error.message).toBe('Generic error');
    }
  });
});