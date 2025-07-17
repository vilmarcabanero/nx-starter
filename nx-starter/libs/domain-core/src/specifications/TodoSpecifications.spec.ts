import { describe, it, expect, beforeEach } from 'vitest';
import {
  CompletedTodoSpecification,
  ActiveTodoSpecification,
  OverdueTodoSpecification,
  HighPriorityTodoSpecification,
} from './TodoSpecifications';
import { Todo } from '../entities/Todo';

// Local test constants (replaces test-helpers dependency)
const TEST_UUIDS = {
  TODO_1: 'f47ac10b58cc4372a5670e02b2c3d479',
  TODO_2: '6ba7b8109dad11d180b400c04fd430c8',
  TODO_3: '6ba7b8119dad11d180b400c04fd430c8',
  TODO_4: '6ba7b8129dad11d180b400c04fd430c8',
};

describe('TodoSpecifications', () => {
  describe('CompletedTodoSpecification', () => {
    let specification: CompletedTodoSpecification;

    beforeEach(() => {
      specification = new CompletedTodoSpecification();
    });

    it('should be satisfied by completed todo', () => {
      // Arrange
      const completedTodo = new Todo(
        'Completed Todo',
        true,
        new Date(),
        TEST_UUIDS.TODO_1
      );

      // Act
      const result = specification.isSatisfiedBy(completedTodo);

      // Assert
      expect(result).toBe(true);
    });

    it('should not be satisfied by active todo', () => {
      // Arrange
      const activeTodo = new Todo(
        'Active Todo',
        false,
        new Date(),
        TEST_UUIDS.TODO_1
      );

      // Act
      const result = specification.isSatisfiedBy(activeTodo);

      // Assert
      expect(result).toBe(false);
    });

    it('should work with different todo properties', () => {
      // Arrange
      const completedHighPriority = new Todo(
        'Completed High Priority',
        true,
        new Date(),
        TEST_UUIDS.TODO_1,
        'high'
      );
      const completedLowPriority = new Todo(
        'Completed Low Priority',
        true,
        new Date(),
        TEST_UUIDS.TODO_2,
        'low'
      );

      // Act
      const highResult = specification.isSatisfiedBy(completedHighPriority);
      const lowResult = specification.isSatisfiedBy(completedLowPriority);

      // Assert
      expect(highResult).toBe(true);
      expect(lowResult).toBe(true);
    });
  });

  describe('ActiveTodoSpecification', () => {
    let specification: ActiveTodoSpecification;

    beforeEach(() => {
      specification = new ActiveTodoSpecification();
    });

    it('should be satisfied by active todo', () => {
      // Arrange
      const activeTodo = new Todo(
        'Active Todo',
        false,
        new Date(),
        TEST_UUIDS.TODO_1
      );

      // Act
      const result = specification.isSatisfiedBy(activeTodo);

      // Assert
      expect(result).toBe(true);
    });

    it('should not be satisfied by completed todo', () => {
      // Arrange
      const completedTodo = new Todo(
        'Completed Todo',
        true,
        new Date(),
        TEST_UUIDS.TODO_1
      );

      // Act
      const result = specification.isSatisfiedBy(completedTodo);

      // Assert
      expect(result).toBe(false);
    });

    it('should work with different priority levels', () => {
      // Arrange
      const activeHigh = new Todo(
        'Active High',
        false,
        new Date(),
        TEST_UUIDS.TODO_1,
        'high'
      );
      const activeMedium = new Todo(
        'Active Medium',
        false,
        new Date(),
        TEST_UUIDS.TODO_2,
        'medium'
      );
      const activeLow = new Todo(
        'Active Low',
        false,
        new Date(),
        TEST_UUIDS.TODO_3,
        'low'
      );

      // Act & Assert
      expect(specification.isSatisfiedBy(activeHigh)).toBe(true);
      expect(specification.isSatisfiedBy(activeMedium)).toBe(true);
      expect(specification.isSatisfiedBy(activeLow)).toBe(true);
    });
  });

  describe('OverdueTodoSpecification', () => {
    it('should be satisfied by overdue active todo', () => {
      // Arrange
      const currentDate = new Date('2024-07-13T10:00:00Z');
      const oldDate = new Date('2024-07-01T10:00:00Z'); // 12 days ago
      const specification = new OverdueTodoSpecification(currentDate);
      const overdueTodo = new Todo(
        'Overdue Todo',
        false,
        oldDate,
        TEST_UUIDS.TODO_1
      );

      // Act
      const result = specification.isSatisfiedBy(overdueTodo);

      // Assert
      expect(result).toBe(true);
    });

    it('should not be satisfied by recent active todo', () => {
      // Arrange
      const currentDate = new Date('2024-07-13T10:00:00Z');
      const recentDate = new Date('2024-07-10T10:00:00Z'); // 3 days ago
      const specification = new OverdueTodoSpecification(currentDate);
      const recentTodo = new Todo(
        'Recent Todo',
        false,
        recentDate,
        TEST_UUIDS.TODO_1
      );

      // Act
      const result = specification.isSatisfiedBy(recentTodo);

      // Assert
      expect(result).toBe(false);
    });

    it('should not be satisfied by completed todo even if old', () => {
      // Arrange
      const currentDate = new Date('2024-07-13T10:00:00Z');
      const oldDate = new Date('2024-06-01T10:00:00Z'); // Very old
      const specification = new OverdueTodoSpecification(currentDate);
      const completedOldTodo = new Todo(
        'Completed Old Todo',
        true,
        oldDate,
        TEST_UUIDS.TODO_1
      );

      // Act
      const result = specification.isSatisfiedBy(completedOldTodo);

      // Assert
      expect(result).toBe(false);
    });

    it('should not be satisfied by todo exactly 7 days old', () => {
      // Arrange
      const currentDate = new Date('2024-07-13T10:00:00Z');
      const exactlySevenDaysAgo = new Date('2024-07-06T10:00:00Z');
      const specification = new OverdueTodoSpecification(currentDate);
      const sevenDayTodo = new Todo(
        'Seven Day Todo',
        false,
        exactlySevenDaysAgo,
        TEST_UUIDS.TODO_1
      );

      // Act
      const result = specification.isSatisfiedBy(sevenDayTodo);

      // Assert
      expect(result).toBe(false); // Should be false because it's exactly 7 days, not more than 7
    });

    it('should be satisfied by todo 8 days old', () => {
      // Arrange
      const currentDate = new Date('2024-07-13T10:00:00Z');
      const eightDaysAgo = new Date('2024-07-05T10:00:00Z');
      const specification = new OverdueTodoSpecification(currentDate);
      const eightDayTodo = new Todo(
        'Eight Day Todo',
        false,
        eightDaysAgo,
        TEST_UUIDS.TODO_1
      );

      // Act
      const result = specification.isSatisfiedBy(eightDayTodo);

      // Assert
      expect(result).toBe(true);
    });

    it('should use current date when no date provided', () => {
      // Arrange
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10); // 10 days ago
      const specification = new OverdueTodoSpecification(); // No date provided
      const overdueTodo = new Todo(
        'Overdue Todo',
        false,
        oldDate,
        TEST_UUIDS.TODO_1
      );

      // Act
      const result = specification.isSatisfiedBy(overdueTodo);

      // Assert
      expect(result).toBe(true);
    });

    it('should handle edge case with same time', () => {
      // Arrange
      const sameDate = new Date('2024-07-13T10:00:00Z');
      const specification = new OverdueTodoSpecification(sameDate);
      const sameDateTodo = new Todo(
        'Same Date Todo',
        false,
        sameDate,
        TEST_UUIDS.TODO_1
      );

      // Act
      const result = specification.isSatisfiedBy(sameDateTodo);

      // Assert
      expect(result).toBe(false); // 0 days old, not overdue
    });
  });

  describe('HighPriorityTodoSpecification', () => {
    let specification: HighPriorityTodoSpecification;

    beforeEach(() => {
      specification = new HighPriorityTodoSpecification();
    });

    it('should be satisfied by high priority todo', () => {
      // Arrange
      const highPriorityTodo = new Todo(
        'High Priority Todo',
        false,
        new Date(),
        TEST_UUIDS.TODO_1,
        'high'
      );

      // Act
      const result = specification.isSatisfiedBy(highPriorityTodo);

      // Assert
      expect(result).toBe(true);
    });

    it('should not be satisfied by medium priority todo', () => {
      // Arrange
      const mediumPriorityTodo = new Todo(
        'Medium Priority Todo',
        false,
        new Date(),
        TEST_UUIDS.TODO_1,
        'medium'
      );

      // Act
      const result = specification.isSatisfiedBy(mediumPriorityTodo);

      // Assert
      expect(result).toBe(false);
    });

    it('should not be satisfied by low priority todo', () => {
      // Arrange
      const lowPriorityTodo = new Todo(
        'Low Priority Todo',
        false,
        new Date(),
        TEST_UUIDS.TODO_1,
        'low'
      );

      // Act
      const result = specification.isSatisfiedBy(lowPriorityTodo);

      // Assert
      expect(result).toBe(false);
    });

    it('should work regardless of completion status', () => {
      // Arrange
      const activeHighPriority = new Todo(
        'Active High Priority',
        false,
        new Date(),
        TEST_UUIDS.TODO_1,
        'high'
      );
      const completedHighPriority = new Todo(
        'Completed High Priority',
        true,
        new Date(),
        TEST_UUIDS.TODO_2,
        'high'
      );

      // Act
      const activeResult = specification.isSatisfiedBy(activeHighPriority);
      const completedResult = specification.isSatisfiedBy(
        completedHighPriority
      );

      // Assert
      expect(activeResult).toBe(true);
      expect(completedResult).toBe(true);
    });

    it('should work with different creation dates', () => {
      // Arrange
      const oldHighPriority = new Todo(
        'Old High Priority',
        false,
        new Date('2024-01-01'),
        TEST_UUIDS.TODO_1,
        'high'
      );
      const newHighPriority = new Todo(
        'New High Priority',
        false,
        new Date(),
        TEST_UUIDS.TODO_2,
        'high'
      );

      // Act
      const oldResult = specification.isSatisfiedBy(oldHighPriority);
      const newResult = specification.isSatisfiedBy(newHighPriority);

      // Assert
      expect(oldResult).toBe(true);
      expect(newResult).toBe(true);
    });
  });

  describe('Specification composition', () => {
    it('should combine specifications with AND', () => {
      // Arrange
      const activeSpec = new ActiveTodoSpecification();
      const highPrioritySpec = new HighPriorityTodoSpecification();
      const combinedSpec = activeSpec.and(highPrioritySpec);

      const activeHighTodo = new Todo(
        'Active High Priority',
        false,
        new Date(),
        TEST_UUIDS.TODO_1,
        'high'
      );
      const completedHighTodo = new Todo(
        'Completed High Priority',
        true,
        new Date(),
        TEST_UUIDS.TODO_2,
        'high'
      );
      const activeLowTodo = new Todo(
        'Active Low Priority',
        false,
        new Date(),
        TEST_UUIDS.TODO_3,
        'low'
      );

      // Act & Assert
      expect(combinedSpec.isSatisfiedBy(activeHighTodo)).toBe(true);
      expect(combinedSpec.isSatisfiedBy(completedHighTodo)).toBe(false); // Not active
      expect(combinedSpec.isSatisfiedBy(activeLowTodo)).toBe(false); // Not high priority
    });

    it('should combine specifications with OR', () => {
      // Arrange
      const completedSpec = new CompletedTodoSpecification();
      const highPrioritySpec = new HighPriorityTodoSpecification();
      const combinedSpec = completedSpec.or(highPrioritySpec);

      const completedLowTodo = new Todo(
        'Completed Low Priority',
        true,
        new Date(),
        TEST_UUIDS.TODO_1,
        'low'
      );
      const activeHighTodo = new Todo(
        'Active High Priority',
        false,
        new Date(),
        TEST_UUIDS.TODO_2,
        'high'
      );
      const activeLowTodo = new Todo(
        'Active Low Priority',
        false,
        new Date(),
        TEST_UUIDS.TODO_3,
        'low'
      );

      // Act & Assert
      expect(combinedSpec.isSatisfiedBy(completedLowTodo)).toBe(true); // Completed
      expect(combinedSpec.isSatisfiedBy(activeHighTodo)).toBe(true); // High priority
      expect(combinedSpec.isSatisfiedBy(activeLowTodo)).toBe(false); // Neither completed nor high priority
    });

    it('should negate specifications with NOT', () => {
      // Arrange
      const completedSpec = new CompletedTodoSpecification();
      const notCompletedSpec = completedSpec.not();

      const completedTodo = new Todo(
        'Completed Todo',
        true,
        new Date(),
        TEST_UUIDS.TODO_1
      );
      const activeTodo = new Todo(
        'Active Todo',
        false,
        new Date(),
        TEST_UUIDS.TODO_2
      );

      // Act & Assert
      expect(notCompletedSpec.isSatisfiedBy(completedTodo)).toBe(false);
      expect(notCompletedSpec.isSatisfiedBy(activeTodo)).toBe(true);
    });

    it('should handle complex composition', () => {
      // Arrange
      const activeSpec = new ActiveTodoSpecification();
      const highPrioritySpec = new HighPriorityTodoSpecification();
      const overdueSpec = new OverdueTodoSpecification(
        new Date('2024-07-13T10:00:00Z')
      );

      // Active AND (High Priority OR Overdue)
      const complexSpec = activeSpec.and(highPrioritySpec.or(overdueSpec));

      const activeHighTodo = new Todo(
        'Active High',
        false,
        new Date('2024-07-10T10:00:00Z'),
        TEST_UUIDS.TODO_1,
        'high'
      );
      const activeOverdueTodo = new Todo(
        'Active Overdue',
        false,
        new Date('2024-07-01T10:00:00Z'),
        TEST_UUIDS.TODO_2,
        'low'
      );
      const completedHighTodo = new Todo(
        'Completed High',
        true,
        new Date('2024-07-10T10:00:00Z'),
        TEST_UUIDS.TODO_3,
        'high'
      );
      const activeLowRecentTodo = new Todo(
        'Active Low Recent',
        false,
        new Date('2024-07-10T10:00:00Z'),
        TEST_UUIDS.TODO_4,
        'low'
      );

      // Act & Assert
      expect(complexSpec.isSatisfiedBy(activeHighTodo)).toBe(true); // Active AND High Priority
      expect(complexSpec.isSatisfiedBy(activeOverdueTodo)).toBe(true); // Active AND Overdue
      expect(complexSpec.isSatisfiedBy(completedHighTodo)).toBe(false); // Not active
      expect(complexSpec.isSatisfiedBy(activeLowRecentTodo)).toBe(false); // Active but neither high priority nor overdue
    });
  });
});
