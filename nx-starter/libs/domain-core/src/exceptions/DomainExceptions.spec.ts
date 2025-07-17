import { describe, it, expect } from 'vitest';
import {
  DomainException,
  TodoNotFoundException,
  TodoAlreadyCompletedException,
  InvalidTodoTitleException,
  InvalidTodoPriorityException,
} from './DomainExceptions';

describe('DomainExceptions', () => {
  describe('DomainException (base class)', () => {
    // Create a concrete implementation for testing
    class TestDomainException extends DomainException {
      constructor(message: string, code: string) {
        super(message, code);
      }
    }

    it('should create exception with message and code', () => {
      const exception = new TestDomainException(
        'Test error message',
        'TEST_ERROR'
      );

      expect(exception.message).toBe('Test error message');
      expect(exception.code).toBe('TEST_ERROR');
      expect(exception.name).toBe('TestDomainException');
    });

    it('should inherit from Error', () => {
      const exception = new TestDomainException('Test message', 'TEST_CODE');

      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(DomainException);
    });

    it('should set name to constructor name', () => {
      const exception = new TestDomainException('Test message', 'TEST_CODE');

      expect(exception.name).toBe('TestDomainException');
    });

    it('should preserve stack trace', () => {
      const exception = new TestDomainException('Test message', 'TEST_CODE');

      expect(exception.stack).toBeDefined();
      expect(typeof exception.stack).toBe('string');
    });
  });

  describe('TodoNotFoundException', () => {
    it('should create exception with numeric id', () => {
      const exception = new TodoNotFoundException(123);

      expect(exception.message).toBe('Todo with ID 123 not found');
      expect(exception.code).toBe('TODO_NOT_FOUND');
      expect(exception.name).toBe('TodoNotFoundException');
    });

    it('should create exception with string id', () => {
      const exception = new TodoNotFoundException('abc-123');

      expect(exception.message).toBe('Todo with ID abc-123 not found');
      expect(exception.code).toBe('TODO_NOT_FOUND');
      expect(exception.name).toBe('TodoNotFoundException');
    });

    it('should inherit from DomainException', () => {
      const exception = new TodoNotFoundException(456);

      expect(exception).toBeInstanceOf(DomainException);
      expect(exception).toBeInstanceOf(Error);
    });

    it('should handle edge case ids', () => {
      const zeroException = new TodoNotFoundException(0);
      const negativeException = new TodoNotFoundException(-1);
      const emptyStringException = new TodoNotFoundException('');

      expect(zeroException.message).toBe('Todo with ID 0 not found');
      expect(negativeException.message).toBe('Todo with ID -1 not found');
      expect(emptyStringException.message).toBe('Todo with ID  not found');
    });
  });

  describe('TodoAlreadyCompletedException', () => {
    it('should create exception with predefined message', () => {
      const exception = new TodoAlreadyCompletedException();

      expect(exception.message).toBe('Todo is already completed');
      expect(exception.code).toBe('TODO_ALREADY_COMPLETED');
      expect(exception.name).toBe('TodoAlreadyCompletedException');
    });

    it('should inherit from DomainException', () => {
      const exception = new TodoAlreadyCompletedException();

      expect(exception).toBeInstanceOf(DomainException);
      expect(exception).toBeInstanceOf(Error);
    });

    it('should not require any parameters', () => {
      expect(() => new TodoAlreadyCompletedException()).not.toThrow();
    });

    it('should create consistent exceptions', () => {
      const exception1 = new TodoAlreadyCompletedException();
      const exception2 = new TodoAlreadyCompletedException();

      expect(exception1.message).toBe(exception2.message);
      expect(exception1.code).toBe(exception2.code);
      expect(exception1.name).toBe(exception2.name);
    });
  });

  describe('InvalidTodoTitleException', () => {
    it('should create exception with custom reason', () => {
      const exception = new InvalidTodoTitleException('Title cannot be empty');

      expect(exception.message).toBe(
        'Invalid todo title: Title cannot be empty'
      );
      expect(exception.code).toBe('INVALID_TODO_TITLE');
      expect(exception.name).toBe('InvalidTodoTitleException');
    });

    it('should inherit from DomainException', () => {
      const exception = new InvalidTodoTitleException('some reason');

      expect(exception).toBeInstanceOf(DomainException);
      expect(exception).toBeInstanceOf(Error);
    });

    it('should handle different validation reasons', () => {
      const emptyException = new InvalidTodoTitleException('cannot be empty');
      const lengthException = new InvalidTodoTitleException('too long');
      const charactersException = new InvalidTodoTitleException(
        'contains invalid characters'
      );

      expect(emptyException.message).toBe(
        'Invalid todo title: cannot be empty'
      );
      expect(lengthException.message).toBe('Invalid todo title: too long');
      expect(charactersException.message).toBe(
        'Invalid todo title: contains invalid characters'
      );
    });

    it('should handle edge case reasons', () => {
      const emptyReasonException = new InvalidTodoTitleException('');
      const whitespaceException = new InvalidTodoTitleException('   ');

      expect(emptyReasonException.message).toBe('Invalid todo title: ');
      expect(whitespaceException.message).toBe('Invalid todo title:    ');
    });
  });

  describe('InvalidTodoPriorityException', () => {
    it('should create exception with invalid priority', () => {
      const exception = new InvalidTodoPriorityException('invalid');

      expect(exception.message).toBe('Invalid todo priority: invalid');
      expect(exception.code).toBe('INVALID_TODO_PRIORITY');
      expect(exception.name).toBe('InvalidTodoPriorityException');
    });

    it('should inherit from DomainException', () => {
      const exception = new InvalidTodoPriorityException('wrong');

      expect(exception).toBeInstanceOf(DomainException);
      expect(exception).toBeInstanceOf(Error);
    });

    it('should handle different invalid priorities', () => {
      const unknownException = new InvalidTodoPriorityException('unknown');
      const typoException = new InvalidTodoPriorityException('hihg'); // typo for 'high'
      const numberException = new InvalidTodoPriorityException('1');

      expect(unknownException.message).toBe('Invalid todo priority: unknown');
      expect(typoException.message).toBe('Invalid todo priority: hihg');
      expect(numberException.message).toBe('Invalid todo priority: 1');
    });

    it('should handle edge case priorities', () => {
      const emptyException = new InvalidTodoPriorityException('');
      const whitespaceException = new InvalidTodoPriorityException('   ');
      const nullishException = new InvalidTodoPriorityException('null');

      expect(emptyException.message).toBe('Invalid todo priority: ');
      expect(whitespaceException.message).toBe('Invalid todo priority:    ');
      expect(nullishException.message).toBe('Invalid todo priority: null');
    });
  });

  describe('exception consistency', () => {
    it('should maintain consistent error structure across all exceptions', () => {
      const notFound = new TodoNotFoundException(123);
      const alreadyCompleted = new TodoAlreadyCompletedException();
      const invalidTitle = new InvalidTodoTitleException('empty');
      const invalidPriority = new InvalidTodoPriorityException('wrong');

      // All should have message, code, and name
      expect(notFound.message).toBeDefined();
      expect(notFound.code).toBeDefined();
      expect(notFound.name).toBeDefined();

      expect(alreadyCompleted.message).toBeDefined();
      expect(alreadyCompleted.code).toBeDefined();
      expect(alreadyCompleted.name).toBeDefined();

      expect(invalidTitle.message).toBeDefined();
      expect(invalidTitle.code).toBeDefined();
      expect(invalidTitle.name).toBeDefined();

      expect(invalidPriority.message).toBeDefined();
      expect(invalidPriority.code).toBeDefined();
      expect(invalidPriority.name).toBeDefined();
    });

    it('should have unique error codes', () => {
      const notFound = new TodoNotFoundException(1);
      const alreadyCompleted = new TodoAlreadyCompletedException();
      const invalidTitle = new InvalidTodoTitleException('test');
      const invalidPriority = new InvalidTodoPriorityException('test');

      const codes = [
        notFound.code,
        alreadyCompleted.code,
        invalidTitle.code,
        invalidPriority.code,
      ];

      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });

    it('should be throwable and catchable', () => {
      expect(() => {
        throw new TodoNotFoundException(123);
      }).toThrow(TodoNotFoundException);

      expect(() => {
        throw new TodoAlreadyCompletedException();
      }).toThrow(TodoAlreadyCompletedException);

      expect(() => {
        throw new InvalidTodoTitleException('test');
      }).toThrow(InvalidTodoTitleException);

      expect(() => {
        throw new InvalidTodoPriorityException('test');
      }).toThrow(InvalidTodoPriorityException);
    });

    it('should be catchable as DomainException', () => {
      const exceptions = [
        new TodoNotFoundException(123),
        new TodoAlreadyCompletedException(),
        new InvalidTodoTitleException('test'),
        new InvalidTodoPriorityException('test'),
      ];

      exceptions.forEach((exception) => {
        expect(exception).toBeInstanceOf(DomainException);
        expect(() => {
          throw exception;
        }).toThrow();
      });
    });
  });
});
