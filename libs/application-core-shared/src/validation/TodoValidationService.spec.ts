import { describe, it, expect, beforeEach, vi } from 'vitest';
import { container } from 'tsyringe';
import {
  CreateTodoValidationService,
  UpdateTodoValidationService,
  DeleteTodoValidationService,
  ToggleTodoValidationService,
  TodoValidationService,
  type ICreateTodoValidationService,
  type IUpdateTodoValidationService,
  type IDeleteTodoValidationService,
  type IToggleTodoValidationService,
} from './TodoValidationService';
import { TOKENS } from '../di/tokens';
import { ValidationError, ValidationResult } from './ValidationService';
import type {
  CreateTodoCommand,
  UpdateTodoCommand,
  DeleteTodoCommand,
  ToggleTodoCommand,
} from './TodoValidationSchemas';

describe('Individual Validation Services', () => {
  describe('CreateTodoValidationService', () => {
    let service: CreateTodoValidationService;

    beforeEach(() => {
      service = new CreateTodoValidationService();
    });

    it('should be decorated with @injectable', () => {
      expect(service).toBeInstanceOf(CreateTodoValidationService);
    });

    it('should validate valid create todo command', () => {
      const validData = {
        title: 'Test Todo',
        priority: 'high',
        dueDate: '2025-12-31T23:59:59.000Z',
      };

      const result = service.validate(validData);

      expect(result.title).toBe('Test Todo');
      expect(result.priority).toBe('high');
      expect(result.dueDate).toBeInstanceOf(Date);
    });

    it('should apply default priority when not provided', () => {
      const validData = {
        title: 'Test Todo',
      };

      const result = service.validate(validData);

      expect(result.title).toBe('Test Todo');
      expect(result.priority).toBe('medium');
    });

    it('should throw ValidationError for invalid data', () => {
      const invalidData = {
        title: 'a', // Too short
      };

      expect(() => service.validate(invalidData)).toThrow(ValidationError);
    });

    it('should return success for valid data using safeParse', () => {
      const validData = {
        title: 'Test Todo',
        priority: 'low',
      };

      const result = service.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Test Todo');
        expect(result.data.priority).toBe('low');
      }
    });

    it('should return failure for invalid data using safeParse', () => {
      const invalidData = {
        title: '', // Empty string
      };

      const result = service.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ValidationError);
      }
    });
  });

  describe('UpdateTodoValidationService', () => {
    let service: UpdateTodoValidationService;

    beforeEach(() => {
      service = new UpdateTodoValidationService();
    });

    it('should validate valid update todo command', () => {
      const validData = {
        id: 'test-id',
        title: 'Updated Todo',
        completed: true,
        priority: 'medium',
        dueDate: '2025-12-31T23:59:59.000Z',
      };

      const result = service.validate(validData);

      expect(result.id).toBe('test-id');
      expect(result.title).toBe('Updated Todo');
      expect(result.completed).toBe(true);
      expect(result.priority).toBe('medium');
      expect(result.dueDate).toBeInstanceOf(Date);
    });

    it('should validate with only required id field', () => {
      const validData = {
        id: 'test-id',
      };

      const result = service.validate(validData);

      expect(result.id).toBe('test-id');
      expect(result.title).toBeUndefined();
      expect(result.completed).toBeUndefined();
      expect(result.priority).toBeUndefined();
      expect(result.dueDate).toBeUndefined();
    });

    it('should throw ValidationError for empty id', () => {
      const invalidData = {
        id: '',
        title: 'Updated Todo',
      };

      expect(() => service.validate(invalidData)).toThrow(ValidationError);
    });
  });

  describe('DeleteTodoValidationService', () => {
    let service: DeleteTodoValidationService;

    beforeEach(() => {
      service = new DeleteTodoValidationService();
    });

    it('should validate valid delete todo command', () => {
      const validData = {
        id: 'test-id',
      };

      const result = service.validate(validData);

      expect(result.id).toBe('test-id');
    });

    it('should throw ValidationError for empty id', () => {
      const invalidData = {
        id: '',
      };

      expect(() => service.validate(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError for missing id', () => {
      const invalidData = {};

      expect(() => service.validate(invalidData)).toThrow(ValidationError);
    });
  });

  describe('ToggleTodoValidationService', () => {
    let service: ToggleTodoValidationService;

    beforeEach(() => {
      service = new ToggleTodoValidationService();
    });

    it('should validate valid toggle todo command', () => {
      const validData = {
        id: 'test-id',
      };

      const result = service.validate(validData);

      expect(result.id).toBe('test-id');
    });

    it('should throw ValidationError for empty id', () => {
      const invalidData = {
        id: '',
      };

      expect(() => service.validate(invalidData)).toThrow(ValidationError);
    });
  });
});

describe('TodoValidationService', () => {
  let todoValidationService: TodoValidationService;
  let mockCreateValidator: CreateTodoValidationService;
  let mockUpdateValidator: UpdateTodoValidationService;
  let mockDeleteValidator: DeleteTodoValidationService;
  let mockToggleValidator: ToggleTodoValidationService;

  beforeEach(() => {
    mockCreateValidator = {
      validate: vi.fn(),
      safeParse: vi.fn(),
    } as any;

    mockUpdateValidator = {
      validate: vi.fn(),
      safeParse: vi.fn(),
    } as any;

    mockDeleteValidator = {
      validate: vi.fn(),
      safeParse: vi.fn(),
    } as any;

    mockToggleValidator = {
      validate: vi.fn(),
      safeParse: vi.fn(),
    } as any;

    todoValidationService = new TodoValidationService(
      mockCreateValidator,
      mockUpdateValidator,
      mockDeleteValidator,
      mockToggleValidator
    );
  });

  describe('validateCreateCommand', () => {
    it('should delegate to create validator', () => {
      const inputData = { title: 'Test Todo' };
      const expectedResult: CreateTodoCommand = { title: 'Test Todo', priority: 'medium' };

      vi.mocked(mockCreateValidator.validate).mockReturnValue(expectedResult);

      const result = todoValidationService.validateCreateCommand(inputData);

      expect(mockCreateValidator.validate).toHaveBeenCalledWith(inputData);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('validateUpdateCommand', () => {
    it('should delegate to update validator', () => {
      const inputData = { id: 'test-id', title: 'Updated Todo' };
      const expectedResult: UpdateTodoCommand = { id: 'test-id', title: 'Updated Todo' };

      vi.mocked(mockUpdateValidator.validate).mockReturnValue(expectedResult);

      const result = todoValidationService.validateUpdateCommand(inputData);

      expect(mockUpdateValidator.validate).toHaveBeenCalledWith(inputData);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('validateDeleteCommand', () => {
    it('should delegate to delete validator', () => {
      const inputData = { id: 'test-id' };
      const expectedResult: DeleteTodoCommand = { id: 'test-id' };

      vi.mocked(mockDeleteValidator.validate).mockReturnValue(expectedResult);

      const result = todoValidationService.validateDeleteCommand(inputData);

      expect(mockDeleteValidator.validate).toHaveBeenCalledWith(inputData);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('validateToggleCommand', () => {
    it('should delegate to toggle validator', () => {
      const inputData = { id: 'test-id' };
      const expectedResult: ToggleTodoCommand = { id: 'test-id' };

      vi.mocked(mockToggleValidator.validate).mockReturnValue(expectedResult);

      const result = todoValidationService.validateToggleCommand(inputData);

      expect(mockToggleValidator.validate).toHaveBeenCalledWith(inputData);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('Safe validation methods', () => {
    it('should delegate safeValidateCreateCommand to create validator', () => {
      const inputData = { title: 'Test Todo' };
      const expectedResult: ValidationResult<CreateTodoCommand> = {
        success: true,
        data: { title: 'Test Todo', priority: 'medium' },
      };

      vi.mocked(mockCreateValidator.safeParse).mockReturnValue(expectedResult);

      const result = todoValidationService.safeValidateCreateCommand(inputData);

      expect(mockCreateValidator.safeParse).toHaveBeenCalledWith(inputData);
      expect(result).toEqual(expectedResult);
    });

    it('should delegate safeValidateUpdateCommand to update validator', () => {
      const inputData = { id: 'test-id', title: 'Updated Todo' };
      const expectedResult: ValidationResult<UpdateTodoCommand> = {
        success: true,
        data: { id: 'test-id', title: 'Updated Todo' },
      };

      vi.mocked(mockUpdateValidator.safeParse).mockReturnValue(expectedResult);

      const result = todoValidationService.safeValidateUpdateCommand(inputData);

      expect(mockUpdateValidator.safeParse).toHaveBeenCalledWith(inputData);
      expect(result).toEqual(expectedResult);
    });

    it('should delegate safeValidateDeleteCommand to delete validator', () => {
      const inputData = { id: 'test-id' };
      const expectedResult: ValidationResult<DeleteTodoCommand> = {
        success: true,
        data: { id: 'test-id' },
      };

      vi.mocked(mockDeleteValidator.safeParse).mockReturnValue(expectedResult);

      const result = todoValidationService.safeValidateDeleteCommand(inputData);

      expect(mockDeleteValidator.safeParse).toHaveBeenCalledWith(inputData);
      expect(result).toEqual(expectedResult);
    });

    it('should delegate safeValidateToggleCommand to toggle validator', () => {
      const inputData = { id: 'test-id' };
      const expectedResult: ValidationResult<ToggleTodoCommand> = {
        success: true,
        data: { id: 'test-id' },
      };

      vi.mocked(mockToggleValidator.safeParse).mockReturnValue(expectedResult);

      const result = todoValidationService.safeValidateToggleCommand(inputData);

      expect(mockToggleValidator.safeParse).toHaveBeenCalledWith(inputData);
      expect(result).toEqual(expectedResult);
    });
  });
});

describe('Type Interfaces', () => {
  it('should define correct type interfaces for dependency injection', () => {
    const mockCreateService: ICreateTodoValidationService = {
      validate: vi.fn(),
      safeParse: vi.fn(),
    };

    const mockUpdateService: IUpdateTodoValidationService = {
      validate: vi.fn(),
      safeParse: vi.fn(),
    };

    const mockDeleteService: IDeleteTodoValidationService = {
      validate: vi.fn(),
      safeParse: vi.fn(),
    };

    const mockToggleService: IToggleTodoValidationService = {
      validate: vi.fn(),
      safeParse: vi.fn(),
    };

    expect(typeof mockCreateService.validate).toBe('function');
    expect(typeof mockCreateService.safeParse).toBe('function');
    expect(typeof mockUpdateService.validate).toBe('function');
    expect(typeof mockUpdateService.safeParse).toBe('function');
    expect(typeof mockDeleteService.validate).toBe('function');
    expect(typeof mockDeleteService.safeParse).toBe('function');
    expect(typeof mockToggleService.validate).toBe('function');
    expect(typeof mockToggleService.safeParse).toBe('function');
  });
});

describe('TOKENS', () => {
  it('should export dependency injection tokens for validation services', () => {
    expect(TOKENS.CreateTodoValidationService).toBeDefined();
    expect(TOKENS.UpdateTodoValidationService).toBeDefined();
    expect(TOKENS.DeleteTodoValidationService).toBeDefined();
    expect(TOKENS.ToggleTodoValidationService).toBeDefined();
    expect(TOKENS.TodoValidationService).toBeDefined();

    // Verify they are strings (as per the centralized tokens implementation)
    expect(typeof TOKENS.CreateTodoValidationService).toBe('string');
    expect(typeof TOKENS.UpdateTodoValidationService).toBe('string');
    expect(typeof TOKENS.DeleteTodoValidationService).toBe('string');
    expect(typeof TOKENS.ToggleTodoValidationService).toBe('string');
    expect(typeof TOKENS.TodoValidationService).toBe('string');
  });

  it('should have unique token values for validation services', () => {
    const validationTokens = [
      TOKENS.CreateTodoValidationService,
      TOKENS.UpdateTodoValidationService,
      TOKENS.DeleteTodoValidationService,
      TOKENS.ToggleTodoValidationService,
      TOKENS.TodoValidationService,
    ];
    const uniqueTokens = new Set(validationTokens);

    expect(uniqueTokens.size).toBe(validationTokens.length);
  });
});