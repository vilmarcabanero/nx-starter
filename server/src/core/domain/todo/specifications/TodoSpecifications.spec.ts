import { describe, it, expect } from 'vitest';
import {
  CompletedTodoSpecification,
  ActiveTodoSpecification,
  OverdueTodoSpecification,
  HighPriorityTodoSpecification,
  BaseSpecification,
} from './TodoSpecifications';
import { Todo } from '@/core/domain/todo/entities/Todo';

// Test UUIDs (32-character hex strings)
const TEST_UUIDS = {
  TODO_1: 'a1b2c3d4e5f6789012345678901234ab',
  TODO_2: 'b2c3d4e5f6789012345678901234abc1',
  TODO_3: 'c3d4e5f6789012345678901234abcd12',
  TODO_4: 'd4e5f6789012345678901234abcde123',
} as const;

// Test implementation of BaseSpecification
class TestSpecification extends BaseSpecification<Todo> {
  constructor(private shouldSatisfy: boolean) {
    super();
  }

  isSatisfiedBy(candidate: Todo): boolean {
    return this.shouldSatisfy;
  }
}

describe('TodoSpecifications', () => {
  describe('BaseSpecification', () => {
    it('should implement and operation', () => {
      const alwaysTrue = new TestSpecification(true);
      const alwaysFalse = new TestSpecification(false);
      const todo = new Todo('Test', false, new Date(), TEST_UUIDS.TODO_1, 'medium');

      const andSpec = alwaysTrue.and(alwaysFalse);
      expect(andSpec.isSatisfiedBy(todo)).toBe(false);

      const andSpecTrue = alwaysTrue.and(alwaysTrue);
      expect(andSpecTrue.isSatisfiedBy(todo)).toBe(true);
    });

    it('should implement or operation', () => {
      const alwaysTrue = new TestSpecification(true);
      const alwaysFalse = new TestSpecification(false);
      const todo = new Todo('Test', false, new Date(), TEST_UUIDS.TODO_1, 'medium');

      const orSpec = alwaysTrue.or(alwaysFalse);
      expect(orSpec.isSatisfiedBy(todo)).toBe(true);

      const orSpecFalse = alwaysFalse.or(alwaysFalse);
      expect(orSpecFalse.isSatisfiedBy(todo)).toBe(false);
    });

    it('should implement not operation', () => {
      const alwaysTrue = new TestSpecification(true);
      const alwaysFalse = new TestSpecification(false);
      const todo = new Todo('Test', false, new Date(), TEST_UUIDS.TODO_1, 'medium');

      const notTrue = alwaysTrue.not();
      expect(notTrue.isSatisfiedBy(todo)).toBe(false);

      const notFalse = alwaysFalse.not();
      expect(notFalse.isSatisfiedBy(todo)).toBe(true);
    });
  });

  describe('CompletedTodoSpecification', () => {
    it('should be satisfied by completed todos', () => {
      const completedTodo = new Todo('Test Todo', true, new Date(), TEST_UUIDS.TODO_1, 'medium');
      const spec = new CompletedTodoSpecification();

      expect(spec.isSatisfiedBy(completedTodo)).toBe(true);
    });

    it('should not be satisfied by active todos', () => {
      const activeTodo = new Todo('Test Todo', false, new Date(), TEST_UUIDS.TODO_1, 'medium');
      const spec = new CompletedTodoSpecification();

      expect(spec.isSatisfiedBy(activeTodo)).toBe(false);
    });
  });

  describe('ActiveTodoSpecification', () => {
    it('should be satisfied by active todos', () => {
      const activeTodo = new Todo('Test Todo', false, new Date(), TEST_UUIDS.TODO_1, 'medium');
      const spec = new ActiveTodoSpecification();

      expect(spec.isSatisfiedBy(activeTodo)).toBe(true);
    });

    it('should not be satisfied by completed todos', () => {
      const completedTodo = new Todo('Test Todo', true, new Date(), TEST_UUIDS.TODO_1, 'medium');
      const spec = new ActiveTodoSpecification();

      expect(spec.isSatisfiedBy(completedTodo)).toBe(false);
    });
  });

  describe('OverdueTodoSpecification', () => {
    it('should be satisfied by todos older than 7 days', () => {
      const oldTodo = new Todo(
        'Test Todo',
        false,
        new Date('2020-01-01'),
        TEST_UUIDS.TODO_1,
        'medium'
      );
      const spec = new OverdueTodoSpecification(new Date('2020-01-10'));

      expect(spec.isSatisfiedBy(oldTodo)).toBe(true);
    });

    it('should not be satisfied by recent todos', () => {
      const recentTodo = new Todo(
        'Test Todo',
        false,
        new Date('2020-01-05'),
        TEST_UUIDS.TODO_1,
        'medium'
      );
      const spec = new OverdueTodoSpecification(new Date('2020-01-10'));

      expect(spec.isSatisfiedBy(recentTodo)).toBe(false);
    });

    it('should not be satisfied by completed todos even if old', () => {
      const oldCompletedTodo = new Todo(
        'Test Todo',
        true,
        new Date('2020-01-01'),
        TEST_UUIDS.TODO_1,
        'medium'
      );
      const spec = new OverdueTodoSpecification(new Date('2020-01-10'));

      expect(spec.isSatisfiedBy(oldCompletedTodo)).toBe(false);
    });

    it('should use current date when no date provided', () => {
      const recentTodo = new Todo('Test Todo', false, new Date(), TEST_UUIDS.TODO_1, 'medium');
      const spec = new OverdueTodoSpecification();

      expect(spec.isSatisfiedBy(recentTodo)).toBe(false);
    });
  });

  describe('HighPriorityTodoSpecification', () => {
    it('should be satisfied by high priority todos', () => {
      const highPriorityTodo = new Todo('Test Todo', false, new Date(), TEST_UUIDS.TODO_1, 'high');
      const spec = new HighPriorityTodoSpecification();

      expect(spec.isSatisfiedBy(highPriorityTodo)).toBe(true);
    });

    it('should not be satisfied by medium priority todos', () => {
      const mediumPriorityTodo = new Todo(
        'Test Todo',
        false,
        new Date(),
        TEST_UUIDS.TODO_1,
        'medium'
      );
      const spec = new HighPriorityTodoSpecification();

      expect(spec.isSatisfiedBy(mediumPriorityTodo)).toBe(false);
    });

    it('should not be satisfied by low priority todos', () => {
      const lowPriorityTodo = new Todo('Test Todo', false, new Date(), TEST_UUIDS.TODO_1, 'low');
      const spec = new HighPriorityTodoSpecification();

      expect(spec.isSatisfiedBy(lowPriorityTodo)).toBe(false);
    });
  });
});
