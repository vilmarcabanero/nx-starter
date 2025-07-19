import { describe, it, expect } from 'vitest';
import {
  DomainException,
  TodoNotFoundException,
  TodoAlreadyCompletedException,
  InvalidTodoTitleException,
  InvalidTodoPriorityException,
} from './DomainExceptions';

describe('DomainExceptions', () => {
  describe('DomainException', () => {
    class TestDomainException extends DomainException {
      constructor(message: string) {
        super(message, 'TEST_CODE');
      }
    }

    it('should create exception with correct message, name and code', () => {
      const error = new TestDomainException('Test message');

      expect(error.name).toBe('TestDomainException');
      expect(error.message).toBe('Test message');
      expect(error.code).toBe('TEST_CODE');
      expect(error instanceof Error).toBe(true);
      expect(error instanceof DomainException).toBe(true);
    });
  });

  describe('TodoNotFoundException', () => {
    it('should create error with correct message and code', () => {
      const error = new TodoNotFoundException('123');

      expect(error.name).toBe('TodoNotFoundException');
      expect(error.message).toBe('Todo with ID 123 not found');
      expect(error.code).toBe('TODO_NOT_FOUND');
      expect(error instanceof DomainException).toBe(true);
    });

    it('should be instanceof TodoNotFoundException', () => {
      const error = new TodoNotFoundException('test-id');

      expect(error instanceof TodoNotFoundException).toBe(true);
      expect(error instanceof DomainException).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('TodoAlreadyCompletedException', () => {
    it('should create error with correct message and code', () => {
      const error = new TodoAlreadyCompletedException();

      expect(error.name).toBe('TodoAlreadyCompletedException');
      expect(error.message).toBe('Todo is already completed');
      expect(error.code).toBe('TODO_ALREADY_COMPLETED');
      expect(error instanceof DomainException).toBe(true);
    });

    it('should be instanceof TodoAlreadyCompletedException', () => {
      const error = new TodoAlreadyCompletedException();

      expect(error instanceof TodoAlreadyCompletedException).toBe(true);
      expect(error instanceof DomainException).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('InvalidTodoTitleException', () => {
    it('should create error with correct message and code', () => {
      const error = new InvalidTodoTitleException('too short');

      expect(error.name).toBe('InvalidTodoTitleException');
      expect(error.message).toBe('Invalid todo title: too short');
      expect(error.code).toBe('INVALID_TODO_TITLE');
      expect(error instanceof DomainException).toBe(true);
    });

    it('should be instanceof InvalidTodoTitleException', () => {
      const error = new InvalidTodoTitleException('test reason');

      expect(error instanceof InvalidTodoTitleException).toBe(true);
      expect(error instanceof DomainException).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('InvalidTodoPriorityException', () => {
    it('should create error with correct message and code', () => {
      const error = new InvalidTodoPriorityException('invalid');

      expect(error.name).toBe('InvalidTodoPriorityException');
      expect(error.message).toBe('Invalid todo priority: invalid');
      expect(error.code).toBe('INVALID_TODO_PRIORITY');
      expect(error instanceof DomainException).toBe(true);
    });

    it('should be instanceof InvalidTodoPriorityException', () => {
      const error = new InvalidTodoPriorityException('test priority');

      expect(error instanceof InvalidTodoPriorityException).toBe(true);
      expect(error instanceof DomainException).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('Error inheritance', () => {
    it('should all be instances of Error and DomainException', () => {
      const notFoundError = new TodoNotFoundException('123');
      const completedError = new TodoAlreadyCompletedException();
      const titleError = new InvalidTodoTitleException('test');
      const priorityError = new InvalidTodoPriorityException('test');

      expect(notFoundError instanceof Error).toBe(true);
      expect(notFoundError instanceof DomainException).toBe(true);

      expect(completedError instanceof Error).toBe(true);
      expect(completedError instanceof DomainException).toBe(true);

      expect(titleError instanceof Error).toBe(true);
      expect(titleError instanceof DomainException).toBe(true);

      expect(priorityError instanceof Error).toBe(true);
      expect(priorityError instanceof DomainException).toBe(true);
    });

    it('should have correct stack traces', () => {
      const error = new TodoNotFoundException('test-id');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('TodoNotFoundException');
    });
  });
});
