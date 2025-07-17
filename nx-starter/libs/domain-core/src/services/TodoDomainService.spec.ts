import { describe, it, expect, beforeEach } from 'vitest';
import { TodoDomainService } from './TodoDomainService';
import { Todo } from '../entities/Todo';

// Local test constants (replaces test-helpers dependency)
const TEST_UUIDS = {
  TODO_1: 'f47ac10b58cc4372a5670e02b2c3d479',
  TODO_2: '6ba7b8109dad11d180b400c04fd430c8',
  TODO_3: '6ba7b8119dad11d180b400c04fd430c8',
  TODO_4: '6ba7b8129dad11d180b400c04fd430c8',
  TODO_5: '6ba7b8139dad11d180b400c04fd430c8',
};

const generateTestUuid = (num: number): string => {
  const hex = num.toString(16).padStart(2, '0');
  return `6ba7b8${hex}9dad11d180b400c04fd430c8`;
};

describe('TodoDomainService', () => {
  let baseTodo: Todo;
  let currentDate: Date;

  beforeEach(() => {
    currentDate = new Date('2024-07-13T10:00:00Z');
    baseTodo = new Todo(
      'Test todo',
      false,
      new Date('2024-07-06T10:00:00Z'), // 7 days ago
      TEST_UUIDS.TODO_1,
      'medium'
    );
  });

  describe('isOverdue', () => {
    it('should return false for completed todos', () => {
      const completedTodo = new Todo(
        'Completed todo',
        true,
        new Date('2024-06-01T10:00:00Z'), // Very old
        TEST_UUIDS.TODO_2,
        'medium'
      );

      const result = TodoDomainService.isOverdue(completedTodo, currentDate);

      expect(result).toBe(false);
    });

    it('should return false for recent todos (within 7 days)', () => {
      const recentTodo = new Todo(
        'Recent todo',
        false,
        new Date('2024-07-10T10:00:00Z'), // 3 days ago
        TEST_UUIDS.TODO_3,
        'medium'
      );

      const result = TodoDomainService.isOverdue(recentTodo, currentDate);

      expect(result).toBe(false);
    });

    it('should return false for todo exactly 7 days old', () => {
      const sevenDayTodo = new Todo(
        'Seven day todo',
        false,
        new Date('2024-07-06T10:00:00Z'), // Exactly 7 days ago
        TEST_UUIDS.TODO_4,
        'medium'
      );

      const result = TodoDomainService.isOverdue(sevenDayTodo, currentDate);

      expect(result).toBe(false);
    });

    it('should return true for todos older than 7 days', () => {
      const oldTodo = new Todo(
        'Old todo',
        false,
        new Date('2024-07-05T10:00:00Z'), // 8 days ago
        TEST_UUIDS.TODO_5,
        'medium'
      );

      const result = TodoDomainService.isOverdue(oldTodo, currentDate);

      expect(result).toBe(true);
    });

    it('should use current date when no date provided', () => {
      const now = new Date();
      const oldTodo = new Todo(
        'Old todo',
        false,
        new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        generateTestUuid(100),
        'medium'
      );

      const result = TodoDomainService.isOverdue(oldTodo);

      expect(result).toBe(true);
    });
  });

  describe('calculateUrgencyScore', () => {
    it('should return 0 for completed todos', () => {
      const completedTodo = new Todo(
        'Completed todo',
        true,
        new Date('2024-06-01T10:00:00Z'),
        generateTestUuid(101),
        'high'
      );

      const score = TodoDomainService.calculateUrgencyScore(
        completedTodo,
        currentDate
      );

      expect(score).toBe(0);
    });

    it('should calculate score based on priority for new todos', () => {
      const newTodo = new Todo(
        'New todo',
        false,
        currentDate, // Just created
        generateTestUuid(102),
        'high'
      );

      const score = TodoDomainService.calculateUrgencyScore(
        newTodo,
        currentDate
      );

      expect(score).toBe(3); // High priority (3) * (1 + 0 age weight)
    });

    it('should increase score based on age', () => {
      const oldTodo = new Todo(
        'Old todo',
        false,
        new Date('2024-06-29T10:00:00Z'), // 14 days ago
        generateTestUuid(103),
        'medium'
      );

      const score = TodoDomainService.calculateUrgencyScore(
        oldTodo,
        currentDate
      );

      // Medium priority (2) * (1 + 2 age weight) = 6
      expect(score).toBe(6);
    });

    it('should cap age weight at 3x multiplier', () => {
      const veryOldTodo = new Todo(
        'Very old todo',
        false,
        new Date('2024-05-01T10:00:00Z'), // Very old (more than 21 days)
        generateTestUuid(104),
        'low'
      );

      const score = TodoDomainService.calculateUrgencyScore(
        veryOldTodo,
        currentDate
      );

      // Low priority (1) * (1 + 3 max age weight) = 4
      expect(score).toBe(4);
    });

    it('should handle todos with different priorities', () => {
      const highPriorityTodo = new Todo(
        'High',
        false,
        baseTodo.createdAt,
        generateTestUuid(1),
        'high'
      );
      const mediumPriorityTodo = new Todo(
        'Medium',
        false,
        baseTodo.createdAt,
        generateTestUuid(2),
        'medium'
      );
      const lowPriorityTodo = new Todo(
        'Low',
        false,
        baseTodo.createdAt,
        generateTestUuid(3),
        'low'
      );

      const highScore = TodoDomainService.calculateUrgencyScore(
        highPriorityTodo,
        currentDate
      );
      const mediumScore = TodoDomainService.calculateUrgencyScore(
        mediumPriorityTodo,
        currentDate
      );
      const lowScore = TodoDomainService.calculateUrgencyScore(
        lowPriorityTodo,
        currentDate
      );

      expect(highScore).toBeGreaterThan(mediumScore);
      expect(mediumScore).toBeGreaterThan(lowScore);
    });

    it('should use default priority when priority is undefined', () => {
      const todoWithoutPriority = new Todo(
        'No priority todo',
        false,
        currentDate,
        generateTestUuid(105)
      );

      const score = TodoDomainService.calculateUrgencyScore(
        todoWithoutPriority,
        currentDate
      );

      expect(score).toBe(2); // Default priority weight (2) * (1 + 0 age weight)
    });

    it('should handle edge case where priority.numericValue is falsy', () => {
      // Create a todo and mock its priority property to test the || 2 fallback
      const mockTodo = {
        completed: false,
        createdAt: currentDate,
        priority: {
          numericValue: 0, // Falsy but not undefined, should trigger || 2
        },
      } as unknown as Todo;

      const score = TodoDomainService.calculateUrgencyScore(
        mockTodo,
        currentDate
      );

      expect(score).toBe(2); // Should fallback to default priority weight (2) * (1 + 0 age weight)
    });
  });

  describe('canComplete', () => {
    it('should allow completion of incomplete todos', () => {
      const incompleteTodo = new Todo(
        'Incomplete',
        false,
        currentDate,
        generateTestUuid(1),
        'medium'
      );

      const result = TodoDomainService.canComplete(incompleteTodo);

      expect(result.canComplete).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should not allow completion of already completed todos', () => {
      const completedTodo = new Todo(
        'Completed',
        true,
        currentDate,
        generateTestUuid(1),
        'medium'
      );

      const result = TodoDomainService.canComplete(completedTodo);

      expect(result.canComplete).toBe(false);
      expect(result.reason).toBe('Todo is already completed');
    });
  });

  describe('sortByPriority', () => {
    it('should sort incomplete todos by urgency score (highest first)', () => {
      const todos = [
        new Todo(
          'Low priority',
          false,
          currentDate,
          generateTestUuid(1),
          'low'
        ),
        new Todo(
          'High priority',
          false,
          currentDate,
          generateTestUuid(2),
          'high'
        ),
        new Todo(
          'Medium priority',
          false,
          currentDate,
          generateTestUuid(3),
          'medium'
        ),
      ];

      const sorted = TodoDomainService.sortByPriority(todos, currentDate);

      expect(sorted[0].title.value).toBe('High priority');
      expect(sorted[1].title.value).toBe('Medium priority');
      expect(sorted[2].title.value).toBe('Low priority');
    });

    it('should place completed todos at the bottom', () => {
      const todos = [
        new Todo(
          'Incomplete low',
          false,
          currentDate,
          generateTestUuid(1),
          'low'
        ),
        new Todo(
          'Completed high',
          true,
          currentDate,
          generateTestUuid(2),
          'high'
        ),
        new Todo(
          'Incomplete high',
          false,
          currentDate,
          generateTestUuid(3),
          'high'
        ),
        new Todo(
          'Completed medium',
          true,
          currentDate,
          generateTestUuid(4),
          'medium'
        ),
      ];

      const sorted = TodoDomainService.sortByPriority(todos, currentDate);

      expect(sorted[0].title.value).toBe('Incomplete high');
      expect(sorted[1].title.value).toBe('Incomplete low');
      expect(sorted[2].completed).toBe(true); // Completed todos at bottom
      expect(sorted[3].completed).toBe(true);
    });

    it('should consider age in sorting', () => {
      const todos = [
        new Todo('New high', false, currentDate, generateTestUuid(1), 'high'),
        new Todo(
          'Old medium',
          false,
          new Date('2024-06-29T10:00:00Z'),
          generateTestUuid(2),
          'medium'
        ), // 14 days old
      ];

      const sorted = TodoDomainService.sortByPriority(todos, currentDate);

      // Old medium with age boost (2 * 3 = 6) should rank higher than new high (3 * 1 = 3)
      expect(sorted[0].title.value).toBe('Old medium');
      expect(sorted[1].title.value).toBe('New high');
    });

    it('should not mutate the original array', () => {
      const todos = [
        new Todo('Second', false, currentDate, generateTestUuid(1), 'low'),
        new Todo('First', false, currentDate, generateTestUuid(2), 'high'),
      ];
      const originalOrder = todos.map((t) => t.title.value);

      const sorted = TodoDomainService.sortByPriority(todos, currentDate);

      expect(todos.map((t) => t.title.value)).toEqual(originalOrder);
      expect(sorted).not.toBe(todos);
    });

    it('should handle empty array', () => {
      const todos: Todo[] = [];

      const sorted = TodoDomainService.sortByPriority(todos, currentDate);

      expect(sorted).toEqual([]);
    });

    it('should handle single todo', () => {
      const todos = [
        new Todo('Single', false, currentDate, generateTestUuid(1), 'medium'),
      ];

      const sorted = TodoDomainService.sortByPriority(todos, currentDate);

      expect(sorted).toHaveLength(1);
      expect(sorted[0].title.value).toBe('Single');
    });

    it('should use current date when no date provided', () => {
      const todos = [
        new Todo('Low priority', false, new Date(), generateTestUuid(1), 'low'),
        new Todo(
          'High priority',
          false,
          new Date(),
          generateTestUuid(2),
          'high'
        ),
      ];

      const sorted = TodoDomainService.sortByPriority(todos);

      expect(sorted[0].title.value).toBe('High priority');
      expect(sorted[1].title.value).toBe('Low priority');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complex sorting scenario with mixed completion and urgency', () => {
      const baseDate = new Date('2024-07-01T10:00:00Z');

      const todos = [
        new Todo(
          'Completed old high',
          true,
          new Date('2024-06-01T10:00:00Z'),
          generateTestUuid(1),
          'high'
        ),
        new Todo(
          'Active new low',
          false,
          new Date('2024-06-30T10:00:00Z'),
          generateTestUuid(2),
          'low'
        ),
        new Todo(
          'Active old medium',
          false,
          new Date('2024-06-15T10:00:00Z'),
          generateTestUuid(3),
          'medium'
        ),
        new Todo(
          'Completed recent medium',
          true,
          new Date('2024-06-28T10:00:00Z'),
          generateTestUuid(4),
          'medium'
        ),
        new Todo(
          'Active new high',
          false,
          new Date('2024-06-30T10:00:00Z'),
          generateTestUuid(5),
          'high'
        ),
      ];

      const sorted = TodoDomainService.sortByPriority(todos, baseDate);

      // Active todos should come first, sorted by urgency
      expect(sorted[0].completed).toBe(false);
      expect(sorted[1].completed).toBe(false);
      expect(sorted[2].completed).toBe(false);

      // Completed todos should be at the end
      expect(sorted[3].completed).toBe(true);
      expect(sorted[4].completed).toBe(true);
    });
  });
});
