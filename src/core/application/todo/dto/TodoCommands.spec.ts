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
        id: 123,
        title: 'Updated Title',
        completed: true,
        priority: 'medium',
        dueDate: new Date(),
      };

      expect(command.id).toBe(123);
      expect(command.title).toBe('Updated Title');
      expect(command.completed).toBe(true);
      expect(command.priority).toBe('medium');
      expect(command.dueDate).toBeInstanceOf(Date);
    });

    it('should allow partial updates with just id', () => {
      const command: UpdateTodoCommand = {
        id: 456,
      };

      expect(command.id).toBe(456);
      expect(command.title).toBeUndefined();
      expect(command.completed).toBeUndefined();
      expect(command.priority).toBeUndefined();
      expect(command.dueDate).toBeUndefined();
    });

    it('should allow updating individual fields', () => {
      const titleOnlyCommand: UpdateTodoCommand = { id: 1, title: 'New Title' };
      const completedOnlyCommand: UpdateTodoCommand = { id: 2, completed: false };
      const priorityOnlyCommand: UpdateTodoCommand = { id: 3, priority: 'high' };

      expect(titleOnlyCommand.title).toBe('New Title');
      expect(completedOnlyCommand.completed).toBe(false);
      expect(priorityOnlyCommand.priority).toBe('high');
    });
  });

  describe('DeleteTodoCommand', () => {
    it('should define correct interface structure', () => {
      const command: DeleteTodoCommand = {
        id: 789,
      };

      expect(command.id).toBe(789);
    });

    it('should work with different id types', () => {
      const command1: DeleteTodoCommand = { id: 0 };
      const command2: DeleteTodoCommand = { id: 999999 };

      expect(command1.id).toBe(0);
      expect(command2.id).toBe(999999);
    });
  });

  describe('ToggleTodoCommand', () => {
    it('should define correct interface structure', () => {
      const command: ToggleTodoCommand = {
        id: 101,
      };

      expect(command.id).toBe(101);
    });

    it('should work with different id values', () => {
      const command1: ToggleTodoCommand = { id: 1 };
      const command2: ToggleTodoCommand = { id: 42 };

      expect(command1.id).toBe(1);
      expect(command2.id).toBe(42);
    });
  });

  describe('command type compatibility', () => {
    it('should maintain type safety for command interfaces', () => {
      // This test ensures TypeScript compilation and type checking
      const createCommand: CreateTodoCommand = { title: 'Test' };
      const updateCommand: UpdateTodoCommand = { id: 1 };
      const deleteCommand: DeleteTodoCommand = { id: 2 };
      const toggleCommand: ToggleTodoCommand = { id: 3 };

      // All commands should be properly typed
      expect(typeof createCommand.title).toBe('string');
      expect(typeof updateCommand.id).toBe('number');
      expect(typeof deleteCommand.id).toBe('number');
      expect(typeof toggleCommand.id).toBe('number');
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
