import { describe, it, expect } from 'vitest';
import type {
  CreateTodoCommand,
  UpdateTodoCommand,
  DeleteTodoCommand,
  ToggleTodoCommand,
} from './TodoCommands';

describe('TodoCommands DTO', () => {
  describe('CreateTodoCommand', () => {
    it('should define correct interface structure', () => {
      const command: CreateTodoCommand = {
        title: 'Test Todo',
        priority: 'high',
        dueDate: new Date(),
      };

      expect(command.title).toBe('Test Todo');
      expect(command.priority).toBe('high');
      expect(command.dueDate).toBeInstanceOf(Date);
    });

    it('should allow minimal command with just title', () => {
      const command: CreateTodoCommand = {
        title: 'Minimal Todo',
      };

      expect(command.title).toBe('Minimal Todo');
      expect(command.priority).toBeUndefined();
      expect(command.dueDate).toBeUndefined();
    });

    it('should accept all priority levels', () => {
      const lowCommand: CreateTodoCommand = { title: 'Low', priority: 'low' };
      const mediumCommand: CreateTodoCommand = { title: 'Medium', priority: 'medium' };
      const highCommand: CreateTodoCommand = { title: 'High', priority: 'high' };

      expect(lowCommand.priority).toBe('low');
      expect(mediumCommand.priority).toBe('medium');
      expect(highCommand.priority).toBe('high');
    });
  });

  describe('UpdateTodoCommand', () => {
    it('should define correct interface structure', () => {
      const command: UpdateTodoCommand = {
        id: 'a1b2c3d4e5f6789012345678901234ab',
        title: 'Updated Title',
        completed: true,
        priority: 'medium',
        dueDate: new Date(),
      };

      expect(command.id).toBe('a1b2c3d4e5f6789012345678901234ab');
      expect(command.title).toBe('Updated Title');
      expect(command.completed).toBe(true);
      expect(command.priority).toBe('medium');
      expect(command.dueDate).toBeInstanceOf(Date);
    });

    it('should allow partial updates with just id', () => {
      const command: UpdateTodoCommand = {
        id: 'b2c3d4e5f6789012345678901234abcd',
      };

      expect(command.id).toBe('b2c3d4e5f6789012345678901234abcd');
      expect(command.title).toBeUndefined();
      expect(command.completed).toBeUndefined();
      expect(command.priority).toBeUndefined();
      expect(command.dueDate).toBeUndefined();
    });

    it('should allow updating individual fields', () => {
      const titleOnlyCommand: UpdateTodoCommand = { id: 'c3d4e5f6789012345678901234abcdef', title: 'New Title' };
      const completedOnlyCommand: UpdateTodoCommand = { id: 'd4e5f6789012345678901234abcdef01', completed: false };
      const priorityOnlyCommand: UpdateTodoCommand = { id: 'e5f6789012345678901234abcdef0123', priority: 'high' };

      expect(titleOnlyCommand.title).toBe('New Title');
      expect(completedOnlyCommand.completed).toBe(false);
      expect(priorityOnlyCommand.priority).toBe('high');
    });
  });

  describe('DeleteTodoCommand', () => {
    it('should define correct interface structure', () => {
      const command: DeleteTodoCommand = {
        id: 'f6789012345678901234abcdef0123456',
      };

      expect(command.id).toBe('f6789012345678901234abcdef0123456');
    });

    it('should work with different id types', () => {
      const command1: DeleteTodoCommand = { id: '789012345678901234abcdef01234567' };
      const command2: DeleteTodoCommand = { id: '89012345678901234abcdef0123456789' };

      expect(command1.id).toBe('789012345678901234abcdef01234567');
      expect(command2.id).toBe('89012345678901234abcdef0123456789');
    });
  });

  describe('ToggleTodoCommand', () => {
    it('should define correct interface structure', () => {
      const command: ToggleTodoCommand = {
        id: '9012345678901234abcdef0123456789a',
      };

      expect(command.id).toBe('9012345678901234abcdef0123456789a');
    });

    it('should work with different id values', () => {
      const command1: ToggleTodoCommand = { id: '012345678901234abcdef0123456789ab' };
      const command2: ToggleTodoCommand = { id: '12345678901234abcdef0123456789abc' };

      expect(command1.id).toBe('012345678901234abcdef0123456789ab');
      expect(command2.id).toBe('12345678901234abcdef0123456789abc');
    });
  });

  describe('command type compatibility', () => {
    it('should maintain type safety for command interfaces', () => {
      // This test ensures TypeScript compilation and type checking
      const createCommand: CreateTodoCommand = { title: 'Test' };
      const updateCommand: UpdateTodoCommand = { id: '2345678901234abcdef0123456789abcd' };
      const deleteCommand: DeleteTodoCommand = { id: '345678901234abcdef0123456789abcde' };
      const toggleCommand: ToggleTodoCommand = { id: '45678901234abcdef0123456789abcdef' };

      // All commands should be properly typed
      expect(typeof createCommand.title).toBe('string');
      expect(typeof updateCommand.id).toBe('string');
      expect(typeof deleteCommand.id).toBe('string');
      expect(typeof toggleCommand.id).toBe('string');
    });

    it('should prevent invalid priority values through TypeScript', () => {
      // This is primarily a compile-time check, but we can test at runtime too
      const validPriorities: Array<CreateTodoCommand['priority']> = ['low', 'medium', 'high', undefined];
      
      validPriorities.forEach(priority => {
        const command: CreateTodoCommand = { title: 'Test', priority };
        expect(['low', 'medium', 'high', undefined].includes(command.priority)).toBe(true);
      });
    });
  });
});
