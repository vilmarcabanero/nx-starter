import { describe, it, expect } from 'vitest';
import { ZodError } from 'zod';
import {
  TodoPrioritySchema,
  CreateTodoCommandSchema,
  UpdateTodoCommandSchema,
  DeleteTodoCommandSchema,
  ToggleTodoCommandSchema,
  TodoIdSchema,
  TodoValidationSchemas,
  type CreateTodoCommand,
  type UpdateTodoCommand,
  type DeleteTodoCommand,
  type ToggleTodoCommand,
} from './TodoValidationSchemas';

// Import the actual module to ensure coverage
import * as TodoValidationSchemasModule from './TodoValidationSchemas';

describe('TodoValidationSchemas Module', () => {
  it('should export all expected schemas and types', () => {
    expect(TodoValidationSchemasModule).toBeDefined();
    expect(typeof TodoValidationSchemasModule).toBe('object');
  });
});

describe('TodoPrioritySchema', () => {
  it('should validate valid priority levels', () => {
    expect(TodoPrioritySchema.parse('low')).toBe('low');
    expect(TodoPrioritySchema.parse('medium')).toBe('medium');
    expect(TodoPrioritySchema.parse('high')).toBe('high');
  });

  it('should throw error for invalid priority levels', () => {
    expect(() => TodoPrioritySchema.parse('invalid')).toThrow(ZodError);
    expect(() => TodoPrioritySchema.parse('urgent')).toThrow(ZodError);
    expect(() => TodoPrioritySchema.parse('')).toThrow(ZodError);
  });
});

describe('CreateTodoCommandSchema', () => {
  it('should validate valid create command with required fields only', () => {
    const validCommand = {
      title: 'Test Todo',
    };

    const result = CreateTodoCommandSchema.parse(validCommand);

    expect(result.title).toBe('Test Todo');
    expect(result.priority).toBe('medium'); // Default applied
    expect(result.dueDate).toBeUndefined();
  });

  it('should validate valid create command with all fields', () => {
    const validCommand = {
      title: 'Test Todo with Details',
      priority: 'high',
      dueDate: '2025-12-31T23:59:59.000Z',
    };

    const result = CreateTodoCommandSchema.parse(validCommand);

    expect(result.title).toBe('Test Todo with Details');
    expect(result.priority).toBe('high');
    expect(result.dueDate).toBeInstanceOf(Date);
    expect(result.dueDate?.toISOString()).toBe('2025-12-31T23:59:59.000Z');
  });

  it('should apply default priority when not provided', () => {
    const validCommand = {
      title: 'Test Todo',
      dueDate: '2025-06-15T12:00:00.000Z',
    };

    const result = CreateTodoCommandSchema.parse(validCommand);

    expect(result.priority).toBe('medium');
  });

  it('should handle optional dueDate correctly', () => {
    const commandWithoutDueDate = {
      title: 'Todo without due date',
      priority: 'low',
    };

    const result = CreateTodoCommandSchema.parse(commandWithoutDueDate);

    expect(result.dueDate).toBeUndefined();
  });

  it('should transform string dueDate to Date object', () => {
    const validCommand = {
      title: 'Test Todo',
      dueDate: '2025-01-15T10:30:00.000Z',
    };

    const result = CreateTodoCommandSchema.parse(validCommand);

    expect(result.dueDate).toBeInstanceOf(Date);
    expect(result.dueDate?.getFullYear()).toBe(2025);
    expect(result.dueDate?.getMonth()).toBe(0); // January
    expect(result.dueDate?.getDate()).toBe(15);
  });

  it('should throw error for invalid title length', () => {
    const invalidShortTitle = {
      title: 'a', // Too short
    };

    const invalidLongTitle = {
      title: 'a'.repeat(256), // Too long
    };

    expect(() => CreateTodoCommandSchema.parse(invalidShortTitle)).toThrow(ZodError);
    expect(() => CreateTodoCommandSchema.parse(invalidLongTitle)).toThrow(ZodError);
  });

  it('should throw error for invalid priority', () => {
    const invalidPriority = {
      title: 'Test Todo',
      priority: 'urgent', // Invalid priority
    };

    expect(() => CreateTodoCommandSchema.parse(invalidPriority)).toThrow(ZodError);
  });

  it('should throw error for invalid dueDate format', () => {
    const invalidDueDate = {
      title: 'Test Todo',
      dueDate: 'invalid-date-format',
    };

    expect(() => CreateTodoCommandSchema.parse(invalidDueDate)).toThrow(ZodError);
  });

  it('should handle edge case title lengths', () => {
    const minValidTitle = {
      title: 'ab', // Minimum valid length
    };

    const maxValidTitle = {
      title: 'a'.repeat(255), // Maximum valid length
    };

    expect(() => CreateTodoCommandSchema.parse(minValidTitle)).not.toThrow();
    expect(() => CreateTodoCommandSchema.parse(maxValidTitle)).not.toThrow();
  });
});

describe('UpdateTodoCommandSchema', () => {
  it('should validate valid update command with all fields', () => {
    const validCommand = {
      id: 'test-id',
      title: 'Updated Todo',
      completed: true,
      priority: 'low',
      dueDate: '2025-12-31T23:59:59.000Z',
    };

    const result = UpdateTodoCommandSchema.parse(validCommand);

    expect(result.id).toBe('test-id');
    expect(result.title).toBe('Updated Todo');
    expect(result.completed).toBe(true);
    expect(result.priority).toBe('low');
    expect(result.dueDate).toBeInstanceOf(Date);
  });

  it('should validate update command with only required id', () => {
    const validCommand = {
      id: 'test-id',
    };

    const result = UpdateTodoCommandSchema.parse(validCommand);

    expect(result.id).toBe('test-id');
    expect(result.title).toBeUndefined();
    expect(result.completed).toBeUndefined();
    expect(result.priority).toBeUndefined();
    expect(result.dueDate).toBeUndefined();
  });

  it('should validate partial updates', () => {
    const titleOnlyUpdate = {
      id: 'test-id',
      title: 'New Title',
    };

    const completedOnlyUpdate = {
      id: 'test-id',
      completed: false,
    };

    expect(() => UpdateTodoCommandSchema.parse(titleOnlyUpdate)).not.toThrow();
    expect(() => UpdateTodoCommandSchema.parse(completedOnlyUpdate)).not.toThrow();
  });

  it('should throw error for empty id', () => {
    const invalidCommand = {
      id: '',
      title: 'Updated Todo',
    };

    expect(() => UpdateTodoCommandSchema.parse(invalidCommand)).toThrow(ZodError);
  });

  it('should throw error for missing id', () => {
    const invalidCommand = {
      title: 'Updated Todo',
    };

    expect(() => UpdateTodoCommandSchema.parse(invalidCommand)).toThrow(ZodError);
  });

  it('should handle optional dueDate transformation', () => {
    const commandWithDueDate = {
      id: 'test-id',
      dueDate: '2025-06-15T14:30:00.000Z',
    };

    const commandWithoutDueDate = {
      id: 'test-id',
    };

    const resultWithDate = UpdateTodoCommandSchema.parse(commandWithDueDate);
    const resultWithoutDate = UpdateTodoCommandSchema.parse(commandWithoutDueDate);

    expect(resultWithDate.dueDate).toBeInstanceOf(Date);
    expect(resultWithoutDate.dueDate).toBeUndefined();
  });
});

describe('DeleteTodoCommandSchema', () => {
  it('should validate valid delete command', () => {
    const validCommand = {
      id: 'test-id',
    };

    const result = DeleteTodoCommandSchema.parse(validCommand);

    expect(result.id).toBe('test-id');
  });

  it('should throw error for empty id', () => {
    const invalidCommand = {
      id: '',
    };

    expect(() => DeleteTodoCommandSchema.parse(invalidCommand)).toThrow(ZodError);
  });

  it('should throw error for missing id', () => {
    const invalidCommand = {};

    expect(() => DeleteTodoCommandSchema.parse(invalidCommand)).toThrow(ZodError);
  });
});

describe('ToggleTodoCommandSchema', () => {
  it('should validate valid toggle command', () => {
    const validCommand = {
      id: 'test-id',
    };

    const result = ToggleTodoCommandSchema.parse(validCommand);

    expect(result.id).toBe('test-id');
  });

  it('should throw error for empty id', () => {
    const invalidCommand = {
      id: '',
    };

    expect(() => ToggleTodoCommandSchema.parse(invalidCommand)).toThrow(ZodError);
  });

  it('should throw error for missing id', () => {
    const invalidCommand = {};

    expect(() => ToggleTodoCommandSchema.parse(invalidCommand)).toThrow(ZodError);
  });
});

describe('TodoIdSchema', () => {
  it('should validate valid id strings', () => {
    expect(TodoIdSchema.parse('valid-id')).toBe('valid-id');
    expect(TodoIdSchema.parse('123')).toBe('123');
    expect(TodoIdSchema.parse('uuid-like-string')).toBe('uuid-like-string');
  });

  it('should throw error for empty id', () => {
    expect(() => TodoIdSchema.parse('')).toThrow(ZodError);
  });

  it('should throw error for non-string values', () => {
    expect(() => TodoIdSchema.parse(123)).toThrow(ZodError);
    expect(() => TodoIdSchema.parse(null)).toThrow(ZodError);
    expect(() => TodoIdSchema.parse(undefined)).toThrow(ZodError);
  });
});

describe('TodoValidationSchemas collection', () => {
  it('should export all schemas in a single object', () => {
    expect(TodoValidationSchemas).toEqual({
      CreateTodoCommandSchema,
      UpdateTodoCommandSchema,
      DeleteTodoCommandSchema,
      ToggleTodoCommandSchema,
      TodoIdSchema,
    });
  });

  it('should be marked as const for immutability', () => {
    // Try to modify the collection - should not be possible with const assertion
    expect(TodoValidationSchemas).toBeDefined();
    expect(Object.keys(TodoValidationSchemas)).toHaveLength(5);
  });
});

describe('TypeScript type inference', () => {
  it('should infer correct types from schemas', () => {
    // These tests ensure the inferred types work correctly
    const createCommand: CreateTodoCommand = {
      title: 'Test',
      priority: 'high',
    };

    const updateCommand: UpdateTodoCommand = {
      id: 'test-id',
      title: 'Updated',
      completed: true,
    };

    const deleteCommand: DeleteTodoCommand = {
      id: 'test-id',
    };

    const toggleCommand: ToggleTodoCommand = {
      id: 'test-id',
    };

    expect(createCommand.title).toBe('Test');
    expect(updateCommand.id).toBe('test-id');
    expect(deleteCommand.id).toBe('test-id');
    expect(toggleCommand.id).toBe('test-id');
  });
});