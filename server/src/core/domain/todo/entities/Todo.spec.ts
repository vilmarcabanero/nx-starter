import { describe, it, expect } from 'vitest';
import { Todo } from './Todo';
import { TodoTitle } from '@/core/domain/todo/value-objects/TodoTitle';
import { TodoPriority } from '@/core/domain/todo/value-objects/TodoPriority';
import { TodoId } from '@/core/domain/todo/value-objects/TodoId';
import { TodoAlreadyCompletedException } from '@/core/domain/todo/exceptions/DomainExceptions';

// Test UUIDs (32-character hex strings)
const TEST_UUIDS = {
  TODO_1: 'a1b2c3d4e5f6789012345678901234ab',
  TODO_2: 'b2c3d4e5f6789012345678901234abc1',
  TODO_3: 'c3d4e5f6789012345678901234abcd12',
} as const;

describe('Todo', () => {
  describe('constructor', () => {
    it('should create todo with title string', () => {
      const todo = new Todo('Test Todo');
      
      expect(todo.title.value).toBe('Test Todo');
      expect(todo.completed).toBe(false);
      expect(todo.priority.level).toBe('medium');
      expect(todo.createdAt).toBeInstanceOf(Date);
    });

    it('should create todo with TodoTitle object', () => {
      const todoTitle = new TodoTitle('Test Todo');
      const todo = new Todo(todoTitle);
      
      expect(todo.title).toBe(todoTitle);
    });

    it('should create todo with specified completion status', () => {
      const activeTodo = new Todo('Active Todo', false);
      const completedTodo = new Todo('Completed Todo', true);
      
      expect(activeTodo.completed).toBe(false);
      expect(completedTodo.completed).toBe(true);
    });

    it('should create todo with specified creation date', () => {
      const createdAt = new Date('2020-01-01');
      const todo = new Todo('Test Todo', false, createdAt);
      
      expect(todo.createdAt).toBe(createdAt);
    });

    it('should create todo with id string', () => {
      const todo = new Todo('Test Todo', false, new Date(), TEST_UUIDS.TODO_1);
      
      expect(todo.id).toBeInstanceOf(TodoId);
      expect(todo.id?.value).toBe(TEST_UUIDS.TODO_1);
    });

    it('should create todo with TodoId object', () => {
      const todoId = new TodoId(TEST_UUIDS.TODO_1);
      const todo = new Todo('Test Todo', false, new Date(), todoId);
      
      expect(todo.id).toBe(todoId);
    });

    it('should create todo with specified priority', () => {
      const highTodo = new Todo('High Priority Todo', false, new Date(), undefined, 'high');
      const lowTodo = new Todo('Low Priority Todo', false, new Date(), undefined, 'low');
      
      expect(highTodo.priority.level).toBe('high');
      expect(lowTodo.priority.level).toBe('low');
    });

    it('should create todo with due date', () => {
      const dueDate = new Date('2020-12-31');
      const todo = new Todo('Todo with due date', false, new Date(), undefined, 'medium', dueDate);
      
      expect(todo.dueDate).toBe(dueDate);
    });

    it('should create todo without id', () => {
      const todo = new Todo('Test Todo');
      
      expect(todo.id).toBeUndefined();
    });
  });

  describe('getters', () => {
    it('should return correct title', () => {
      const todo = new Todo('Test Todo');
      expect(todo.title).toBeInstanceOf(TodoTitle);
      expect(todo.title.value).toBe('Test Todo');
    });

    it('should return correct priority', () => {
      const todo = new Todo('Test Todo', false, new Date(), undefined, 'high');
      expect(todo.priority).toBeInstanceOf(TodoPriority);
      expect(todo.priority.level).toBe('high');
    });

    it('should return correct completion status', () => {
      const activeTodo = new Todo('Active Todo', false);
      const completedTodo = new Todo('Completed Todo', true);
      
      expect(activeTodo.completed).toBe(false);
      expect(completedTodo.completed).toBe(true);
    });

    it('should return correct creation date', () => {
      const createdAt = new Date('2020-01-01');
      const todo = new Todo('Test Todo', false, createdAt);
      
      expect(todo.createdAt).toBe(createdAt);
    });

    it('should return correct due date', () => {
      const dueDate = new Date('2020-12-31');
      const todo = new Todo('Test Todo', false, new Date(), undefined, 'medium', dueDate);
      
      expect(todo.dueDate).toBe(dueDate);
    });

    it('should return undefined for due date when not set', () => {
      const todo = new Todo('Test Todo');
      expect(todo.dueDate).toBeUndefined();
    });
  });

  describe('business methods', () => {
    it('should determine if todo is overdue', () => {
      // Test with due date
      const pastDueDate = new Date('2020-01-01');
      const overdueTodo = new Todo('Overdue Todo', false, new Date('2020-01-05'), undefined, 'medium', pastDueDate);
      expect(overdueTodo.isOverdue()).toBe(true);

      // Test without due date - uses 7 day rule
      const oldTodo = new Todo('Old Todo', false, new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)); // 8 days ago
      expect(oldTodo.isOverdue()).toBe(true);

      const recentTodo = new Todo('Recent Todo', false, new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)); // 5 days ago
      expect(recentTodo.isOverdue()).toBe(false);
    });

    it('should determine if todo can be completed', () => {
      const activeTodo = new Todo('Active Todo', false);
      const completedTodo = new Todo('Completed Todo', true);
      
      expect(activeTodo.canBeCompleted()).toBe(true);
      expect(completedTodo.canBeCompleted()).toBe(false);
    });

    it('should handle completion for active todos', () => {
      const activeTodo = new Todo('Active Todo', false);
      const completedTodo = activeTodo.complete();
      
      expect(completedTodo.completed).toBe(true);
      expect(completedTodo.title.value).toBe('Active Todo');
    });

    it('should throw error when completing already completed todo', () => {
      const completedTodo = new Todo('Completed Todo', true);
      
      expect(() => completedTodo.complete()).toThrow(TodoAlreadyCompletedException);
    });

    it('should toggle completion status', () => {
      const activeTodo = new Todo('Active Todo', false);
      const toggledTodo = activeTodo.toggle();
      
      expect(toggledTodo.completed).toBe(true);
      expect(activeTodo.completed).toBe(false); // Original unchanged
    });

    it('should update title', () => {
      const todo = new Todo('Original Title', false);
      const updatedTodo = todo.updateTitle('Updated Title');
      
      expect(updatedTodo.title.value).toBe('Updated Title');
      expect(todo.title.value).toBe('Original Title'); // Original unchanged
    });

    it('should update priority', () => {
      const todo = new Todo('Test Todo', false, new Date(), undefined, 'low');
      const updatedTodo = todo.updatePriority('high');
      
      expect(updatedTodo.priority.level).toBe('high');
      expect(todo.priority.level).toBe('low'); // Original unchanged
    });

    it('should update due date', () => {
      const todo = new Todo('Test Todo', false);
      const dueDate = new Date('2025-01-01');
      const updatedTodo = todo.updateDueDate(dueDate);
      
      expect(updatedTodo.dueDate).toBe(dueDate);
      expect(todo.dueDate).toBeUndefined(); // Original unchanged
    });

    it('should validate business invariants', () => {
      const validTodo = new Todo('Valid Todo', false);
      expect(() => validTodo.validate()).not.toThrow();
      
      // Note: Invalid title would be caught at construction time by TodoTitle
      // Due date validation - using current date as creation date to avoid timing issues
      const creationDate = new Date();
      const futureDate = new Date(creationDate.getTime() + 24 * 60 * 60 * 1000); // 1 day later
      const validTodoWithDueDate = new Todo('Valid Todo', false, creationDate, undefined, 'medium', futureDate);
      expect(() => validTodoWithDueDate.validate()).not.toThrow();
    });

    it('should check equality based on ID', () => {
      const todo1 = new Todo('Todo 1', false, new Date(), TEST_UUIDS.TODO_1);
      const todo2 = new Todo('Todo 2', false, new Date(), TEST_UUIDS.TODO_1);
      const todo3 = new Todo('Todo 3', false, new Date(), TEST_UUIDS.TODO_2);
      const todoWithoutId = new Todo('No ID Todo', false);
      
      expect(todo1.equals(todo2)).toBe(true);
      expect(todo1.equals(todo3)).toBe(false);
      expect(todo1.equals(todoWithoutId)).toBe(false);
      expect(todoWithoutId.equals(todo1)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should be immutable - complete returns new instance', () => {
      const originalTodo = new Todo('Test Todo', false);
      const completedTodo = originalTodo.complete();
      
      expect(originalTodo.completed).toBe(false);
      expect(completedTodo.completed).toBe(true);
      expect(originalTodo).not.toBe(completedTodo);
    });

    it('should be immutable - toggle returns new instance', () => {
      const originalTodo = new Todo('Test Todo', false);
      const toggledTodo = originalTodo.toggle();
      
      expect(originalTodo.completed).toBe(false);
      expect(toggledTodo.completed).toBe(true);
      expect(originalTodo).not.toBe(toggledTodo);
    });

    it('should be immutable - updateTitle returns new instance', () => {
      const originalTodo = new Todo('Original Title', false);
      const updatedTodo = originalTodo.updateTitle('Updated Title');
      
      expect(originalTodo.title.value).toBe('Original Title');
      expect(updatedTodo.title.value).toBe('Updated Title');
      expect(originalTodo).not.toBe(updatedTodo);
    });
  });

  describe('edge cases', () => {
    it('should handle todos with same creation time', () => {
      const createdAt = new Date();
      const todo1 = new Todo('Todo 1', false, createdAt);
      const todo2 = new Todo('Todo 2', false, createdAt);
      
      expect(todo1.createdAt).toEqual(todo2.createdAt);
    });

    it('should handle very old todos for overdue calculation', () => {
      const veryOldTodo = new Todo('Very Old Todo', false, new Date('1990-01-01'));
      const currentDate = new Date();
      
      expect(veryOldTodo.isOverdue(currentDate)).toBe(true);
    });

    it('should handle future due dates', () => {
      const futureDate = new Date('2030-01-01');
      const todo = new Todo('Future Todo', false, new Date(), undefined, 'medium', futureDate);
      
      expect(todo.dueDate).toBe(futureDate);
    });
  });
});