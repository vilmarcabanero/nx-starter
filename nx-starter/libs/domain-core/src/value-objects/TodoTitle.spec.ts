import { describe, it, expect } from 'vitest';
import { TodoTitle } from './TodoTitle';
import { InvalidTodoTitleException } from '../exceptions/DomainExceptions';

describe('TodoTitle Value Object', () => {
  describe('constructor', () => {
    it('should create a valid todo title', () => {
      const title = new TodoTitle('Valid todo title');

      expect(title.value).toBe('Valid todo title');
    });

    it('should trim whitespace from title', () => {
      const title = new TodoTitle('  Todo with spaces  ');

      expect(title.value).toBe('Todo with spaces');
    });

    it('should throw exception for empty title', () => {
      expect(() => new TodoTitle('')).toThrow(InvalidTodoTitleException);
      expect(() => new TodoTitle('')).toThrow('cannot be empty');
    });

    it('should throw exception for whitespace only title', () => {
      expect(() => new TodoTitle('   ')).toThrow(InvalidTodoTitleException);
      expect(() => new TodoTitle('   ')).toThrow('cannot be empty');
    });

    it('should throw exception for title too short', () => {
      expect(() => new TodoTitle('a')).toThrow(InvalidTodoTitleException);
      expect(() => new TodoTitle('a')).toThrow(
        'must be at least 2 characters long'
      );
    });

    it('should throw exception for title too long', () => {
      const longTitle = 'a'.repeat(256);
      expect(() => new TodoTitle(longTitle)).toThrow(InvalidTodoTitleException);
      expect(() => new TodoTitle(longTitle)).toThrow(
        'cannot exceed 255 characters'
      );
    });

    it('should accept minimum valid length', () => {
      const title = new TodoTitle('ab');

      expect(title.value).toBe('ab');
    });

    it('should accept maximum valid length', () => {
      const maxTitle = 'a'.repeat(255);
      const title = new TodoTitle(maxTitle);

      expect(title.value).toBe(maxTitle);
    });
  });

  describe('equals', () => {
    it('should return true for identical titles', () => {
      const title1 = new TodoTitle('Same title');
      const title2 = new TodoTitle('Same title');

      expect(title1.equals(title2)).toBe(true);
    });

    it('should return false for different titles', () => {
      const title1 = new TodoTitle('Title one');
      const title2 = new TodoTitle('Title two');

      expect(title1.equals(title2)).toBe(false);
    });

    it('should handle trimmed titles correctly', () => {
      const title1 = new TodoTitle('  Same title  ');
      const title2 = new TodoTitle('Same title');

      expect(title1.equals(title2)).toBe(true);
    });
  });

  describe('toString', () => {
    it('should return the title value', () => {
      const title = new TodoTitle('Test title');

      expect(title.toString()).toBe('Test title');
    });

    it('should return trimmed value', () => {
      const title = new TodoTitle('  Trimmed title  ');

      expect(title.toString()).toBe('Trimmed title');
    });
  });
});
