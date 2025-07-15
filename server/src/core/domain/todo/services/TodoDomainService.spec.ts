import { describe, it, expect } from 'vitest';
import { TodoDomainService } from './TodoDomainService';
import { Todo } from '@/core/domain/todo/entities/Todo';

// Test UUIDs (32-character hex strings)
const TEST_UUIDS = {
  TODO_1: 'a1b2c3d4e5f6789012345678901234ab',
  TODO_2: 'b2c3d4e5f6789012345678901234abc1',
  TODO_3: 'c3d4e5f6789012345678901234abcd12',
  TODO_4: 'd4e5f6789012345678901234abcde123',
} as const;

describe('TodoDomainService', () => {
  describe('isOverdue', () => {
    it('should return false for completed todos', () => {
      const completedTodo = new Todo('Test Todo', true, new Date('2020-01-01'), TEST_UUIDS.TODO_1, 'high');
      const result = TodoDomainService.isOverdue(completedTodo, new Date('2020-01-10'));
      expect(result).toBe(false);
    });

    it('should return true for todos older than 7 days', () => {
      const oldTodo = new Todo('Test Todo', false, new Date('2020-01-01'), TEST_UUIDS.TODO_1, 'high');
      const result = TodoDomainService.isOverdue(oldTodo, new Date('2020-01-10'));
      expect(result).toBe(true);
    });

    it('should return false for todos less than 7 days old', () => {
      const recentTodo = new Todo('Test Todo', false, new Date('2020-01-05'), TEST_UUIDS.TODO_1, 'high');
      const result = TodoDomainService.isOverdue(recentTodo, new Date('2020-01-10'));
      expect(result).toBe(false);
    });

    it('should use current date when no date provided', () => {
      const recentTodo = new Todo('Test Todo', false, new Date(), TEST_UUIDS.TODO_1, 'high');
      const result = TodoDomainService.isOverdue(recentTodo);
      expect(result).toBe(false);
    });
  });

  describe('calculateUrgencyScore', () => {
    it('should return 0 for completed todos', () => {
      const completedTodo = new Todo('Test Todo', true, new Date('2020-01-01'), TEST_UUIDS.TODO_1, 'high');
      const result = TodoDomainService.calculateUrgencyScore(completedTodo, new Date('2020-01-10'));
      expect(result).toBe(0);
    });

    it('should calculate urgency based on priority and age', () => {
      const highPriorityTodo = new Todo('Test Todo', false, new Date('2020-01-01'), TEST_UUIDS.TODO_1, 'high');
      const result = TodoDomainService.calculateUrgencyScore(highPriorityTodo, new Date('2020-01-08'));
      expect(result).toBeGreaterThan(3); // High priority (3) + age weight
    });

    it('should handle low priority todos', () => {
      const lowPriorityTodo = new Todo('Test Todo', false, new Date('2020-01-01'), TEST_UUIDS.TODO_1, 'low');
      const result = TodoDomainService.calculateUrgencyScore(lowPriorityTodo, new Date('2020-01-08'));
      expect(result).toBeGreaterThan(1);
    });

    it('should limit age weight to 3x multiplier', () => {
      const oldTodo = new Todo('Test Todo', false, new Date('2020-01-01'), TEST_UUIDS.TODO_1, 'high');
      const result = TodoDomainService.calculateUrgencyScore(oldTodo, new Date('2020-02-01'));
      expect(result).toBeLessThanOrEqual(12); // 3 * (1 + 3)
    });

    it('should handle undefined priority with default weight', () => {
      // Create a todo with undefined priority (test the || 2 fallback)
      const todo = new Todo('Test', false, new Date(), TEST_UUIDS.TODO_1, 'medium');
      // Manually set priority to undefined to test the fallback
      Object.defineProperty(todo, 'priority', {
        get: () => undefined,
        configurable: true
      });
      
      const urgencyScore = TodoDomainService.calculateUrgencyScore(todo, new Date());
      
      // Should use default weight of 2
      expect(urgencyScore).toBe(2); // 2 * (1 + 0) for a new todo
    });
  });

  describe('canComplete', () => {
    it('should allow completion for active todos', () => {
      const activeTodo = new Todo('Test Todo', false, new Date(), TEST_UUIDS.TODO_1, 'medium');
      const result = TodoDomainService.canComplete(activeTodo);
      expect(result.canComplete).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should prevent completion for already completed todos', () => {
      const completedTodo = new Todo('Test Todo', true, new Date(), TEST_UUIDS.TODO_1, 'medium');
      const result = TodoDomainService.canComplete(completedTodo);
      expect(result.canComplete).toBe(false);
      expect(result.reason).toBe('Todo is already completed');
    });
  });

  describe('sortByPriority', () => {
    it('should sort completed todos to bottom', () => {
      const activeTodo = new Todo('Active', false, new Date(), TEST_UUIDS.TODO_1, 'low');
      const completedTodo = new Todo('Completed', true, new Date(), TEST_UUIDS.TODO_2, 'high');
      
      const sorted = TodoDomainService.sortByPriority([completedTodo, activeTodo]);
      
      expect(sorted[0]).toBe(activeTodo);
      expect(sorted[1]).toBe(completedTodo);
    });

    it('should handle mixed completion statuses', () => {
      const activeTodo1 = new Todo('Active 1', false, new Date(), TEST_UUIDS.TODO_1, 'low');
      const activeTodo2 = new Todo('Active 2', false, new Date(), TEST_UUIDS.TODO_2, 'high');
      const completedTodo1 = new Todo('Completed 1', true, new Date(), TEST_UUIDS.TODO_3, 'high');
      const completedTodo2 = new Todo('Completed 2', true, new Date(), TEST_UUIDS.TODO_4, 'low');
      
      const sorted = TodoDomainService.sortByPriority([completedTodo1, activeTodo1, completedTodo2, activeTodo2]);
      
      // All active todos should come before completed todos
      expect(sorted[0].completed).toBe(false);
      expect(sorted[1].completed).toBe(false);
      expect(sorted[2].completed).toBe(true);
      expect(sorted[3].completed).toBe(true);
      
      // Within active todos, high priority should come first
      expect(sorted[0]).toBe(activeTodo2);
      expect(sorted[1]).toBe(activeTodo1);
    });

    it('should sort by urgency score within same completion status', () => {
      const lowPriorityTodo = new Todo('Low', false, new Date(), TEST_UUIDS.TODO_1, 'low');
      const highPriorityTodo = new Todo('High', false, new Date(), TEST_UUIDS.TODO_2, 'high');
      
      const sorted = TodoDomainService.sortByPriority([lowPriorityTodo, highPriorityTodo]);
      
      expect(sorted[0]).toBe(highPriorityTodo);
      expect(sorted[1]).toBe(lowPriorityTodo);
    });

    it('should not mutate original array', () => {
      const todos = [
        new Todo('Todo 1', false, new Date(), TEST_UUIDS.TODO_1, 'low'),
        new Todo('Todo 2', false, new Date(), TEST_UUIDS.TODO_2, 'high')
      ];
      const original = [...todos];
      
      TodoDomainService.sortByPriority(todos);
      
      expect(todos).toEqual(original);
    });
  });
});