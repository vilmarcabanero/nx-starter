import { describe, it, expect } from 'vitest';
import {
  CreateTodoCommand,
  UpdateTodoCommand,
  DeleteTodoCommand,
  ToggleTodoCommand,
  CreateTodoCommandSchema,
  UpdateTodoCommandSchema,
  DeleteTodoCommandSchema,
  ToggleTodoCommandSchema,
} from './TodoCommands';

// Import the actual module to ensure coverage
import * as TodoCommandsModule from './TodoCommands';

describe('TodoCommands Module', () => {
  it('should export all expected types and schemas', () => {
    // This ensures the module is imported and coverage is tracked
    expect(TodoCommandsModule).toBeDefined();
    expect(typeof TodoCommandsModule).toBe('object');
    expect(TodoCommandsModule.CreateTodoCommandSchema).toBeDefined();
    expect(TodoCommandsModule.UpdateTodoCommandSchema).toBeDefined();
    expect(TodoCommandsModule.DeleteTodoCommandSchema).toBeDefined();
    expect(TodoCommandsModule.ToggleTodoCommandSchema).toBeDefined();
  });
});

describe('CreateTodoCommand Interface', () => {
  it('should define correct interface structure with required title', () => {
    const command: CreateTodoCommand = {
      title: 'Test Todo'
    };

    expect(command.title).toBe('Test Todo');
    expect(command.priority).toBeUndefined();
    expect(command.dueDate).toBeUndefined();
  });

  it('should allow optional priority and dueDate', () => {
    const command: CreateTodoCommand = {
      title: 'Complete Todo',
      priority: 'high',
      dueDate: new Date('2025-12-31')
    };

    expect(command.title).toBe('Complete Todo');
    expect(command.priority).toBe('high');
    expect(command.dueDate).toBeInstanceOf(Date);
  });
});

describe('UpdateTodoCommand Interface', () => {
  it('should define correct interface structure with required id', () => {
    const command: UpdateTodoCommand = {
      id: 'test-id'
    };

    expect(command.id).toBe('test-id');
    expect(command.title).toBeUndefined();
    expect(command.completed).toBeUndefined();
    expect(command.priority).toBeUndefined();
    expect(command.dueDate).toBeUndefined();
  });

  it('should allow all optional fields', () => {
    const command: UpdateTodoCommand = {
      id: 'test-id',
      title: 'Updated Todo',
      completed: true,
      priority: 'low',
      dueDate: new Date('2025-12-31')
    };

    expect(command.id).toBe('test-id');
    expect(command.title).toBe('Updated Todo');
    expect(command.completed).toBe(true);
    expect(command.priority).toBe('low');
    expect(command.dueDate).toBeInstanceOf(Date);
  });
});

describe('DeleteTodoCommand Interface', () => {
  it('should define correct interface structure', () => {
    const command: DeleteTodoCommand = {
      id: 'delete-id'
    };

    expect(command.id).toBe('delete-id');
  });
});

describe('ToggleTodoCommand Interface', () => {
  it('should define correct interface structure', () => {
    const command: ToggleTodoCommand = {
      id: 'toggle-id'
    };

    expect(command.id).toBe('toggle-id');
  });
});

describe('CreateTodoCommandSchema', () => {
  it('should validate valid create command', () => {
    const validCommand = {
      title: 'Valid Todo Title'
    };

    const result = CreateTodoCommandSchema.parse(validCommand);
    expect(result.title).toBe('Valid Todo Title');
    expect(result.priority).toBeUndefined();
    expect(result.dueDate).toBeUndefined();
  });

  it('should validate create command with all fields', () => {
    const validCommand = {
      title: 'Complete Todo',
      priority: 'high' as const,
      dueDate: '2025-12-31T23:59:59.000Z'
    };

    const result = CreateTodoCommandSchema.parse(validCommand);
    expect(result.title).toBe('Complete Todo');
    expect(result.priority).toBe('high');
    expect(result.dueDate).toBeInstanceOf(Date);
    expect(result.dueDate?.toISOString()).toBe('2025-12-31T23:59:59.000Z');
  });

  it('should transform dueDate string to Date object', () => {
    const validCommand = {
      title: 'Date Transform Test',
      dueDate: '2025-01-01T00:00:00.000Z'
    };

    const result = CreateTodoCommandSchema.parse(validCommand);
    expect(result.dueDate).toBeInstanceOf(Date);
    expect(result.dueDate?.toISOString()).toBe('2025-01-01T00:00:00.000Z');
  });

  it('should handle undefined dueDate (branch coverage for lines 38)', () => {
    const validCommand = {
      title: 'No Due Date Test'
      // dueDate is undefined
    };

    const result = CreateTodoCommandSchema.parse(validCommand);
    expect(result.dueDate).toBeUndefined();
  });

  it('should reject invalid title (too short)', () => {
    const invalidCommand = {
      title: 'a' // too short
    };

    expect(() => CreateTodoCommandSchema.parse(invalidCommand)).toThrow('Title must be at least 2 characters');
  });

  it('should reject invalid title (too long)', () => {
    const invalidCommand = {
      title: 'a'.repeat(256) // too long
    };

    expect(() => CreateTodoCommandSchema.parse(invalidCommand)).toThrow('Title cannot exceed 255 characters');
  });

  it('should reject invalid priority', () => {
    const invalidCommand = {
      title: 'Valid Title',
      priority: 'invalid' as any
    };

    expect(() => CreateTodoCommandSchema.parse(invalidCommand)).toThrow();
  });

  it('should validate all priority levels', () => {
    const priorities = ['low', 'medium', 'high'] as const;
    
    priorities.forEach(priority => {
      const command = {
        title: 'Priority Test',
        priority
      };
      
      const result = CreateTodoCommandSchema.parse(command);
      expect(result.priority).toBe(priority);
    });
  });
});

describe('UpdateTodoCommandSchema', () => {
  it('should validate valid update command with id only', () => {
    const validCommand = {
      id: 'valid-id'
    };

    const result = UpdateTodoCommandSchema.parse(validCommand);
    expect(result.id).toBe('valid-id');
    expect(result.title).toBeUndefined();
    expect(result.completed).toBeUndefined();
    expect(result.priority).toBeUndefined();
    expect(result.dueDate).toBeUndefined();
  });

  it('should validate update command with all fields', () => {
    const validCommand = {
      id: 'update-id',
      title: 'Updated Title',
      completed: true,
      priority: 'low' as const,
      dueDate: '2025-12-31T23:59:59.000Z'
    };

    const result = UpdateTodoCommandSchema.parse(validCommand);
    expect(result.id).toBe('update-id');
    expect(result.title).toBe('Updated Title');
    expect(result.completed).toBe(true);
    expect(result.priority).toBe('low');
    expect(result.dueDate).toBeInstanceOf(Date);
  });

  it('should transform dueDate string to Date object', () => {
    const validCommand = {
      id: 'update-id',
      dueDate: '2025-06-15T12:00:00.000Z'
    };

    const result = UpdateTodoCommandSchema.parse(validCommand);
    expect(result.dueDate).toBeInstanceOf(Date);
    expect(result.dueDate?.toISOString()).toBe('2025-06-15T12:00:00.000Z');
  });

  it('should handle undefined dueDate (branch coverage for lines 54)', () => {
    const validCommand = {
      id: 'update-id',
      title: 'Updated Title'
      // dueDate is undefined
    };

    const result = UpdateTodoCommandSchema.parse(validCommand);
    expect(result.dueDate).toBeUndefined();
  });

  it('should reject empty id', () => {
    const invalidCommand = {
      id: '' // empty id
    };

    expect(() => UpdateTodoCommandSchema.parse(invalidCommand)).toThrow('ID is required');
  });

  it('should reject invalid title (too short)', () => {
    const invalidCommand = {
      id: 'valid-id',
      title: 'a' // too short
    };

    expect(() => UpdateTodoCommandSchema.parse(invalidCommand)).toThrow('Title must be at least 2 characters');
  });

  it('should validate completed boolean field', () => {
    const trueCommand = {
      id: 'valid-id',
      completed: true
    };

    const falseCommand = {
      id: 'valid-id',
      completed: false
    };

    const trueResult = UpdateTodoCommandSchema.parse(trueCommand);
    const falseResult = UpdateTodoCommandSchema.parse(falseCommand);

    expect(trueResult.completed).toBe(true);
    expect(falseResult.completed).toBe(false);
  });
});

describe('DeleteTodoCommandSchema', () => {
  it('should validate valid delete command', () => {
    const validCommand = {
      id: 'delete-id'
    };

    const result = DeleteTodoCommandSchema.parse(validCommand);
    expect(result.id).toBe('delete-id');
  });

  it('should reject empty id', () => {
    const invalidCommand = {
      id: '' // empty id
    };

    expect(() => DeleteTodoCommandSchema.parse(invalidCommand)).toThrow('ID is required');
  });
});

describe('ToggleTodoCommandSchema', () => {
  it('should validate valid toggle command', () => {
    const validCommand = {
      id: 'toggle-id'
    };

    const result = ToggleTodoCommandSchema.parse(validCommand);
    expect(result.id).toBe('toggle-id');
  });

  it('should reject empty id', () => {
    const invalidCommand = {
      id: '' // empty id
    };

    expect(() => ToggleTodoCommandSchema.parse(invalidCommand)).toThrow('ID is required');
  });
});