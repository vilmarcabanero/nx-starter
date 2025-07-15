import { describe, it, expect } from 'vitest';
import { TodoTitle } from './TodoTitle';
import { InvalidTodoTitleException } from '@/core/domain/todo/exceptions/DomainExceptions';

describe('TodoTitle', () => {
  describe('constructor', () => {
    it('should create valid title', () => {
      const title = new TodoTitle('Valid Todo Title');
      expect(title.value).toBe('Valid Todo Title');
    });

    it('should trim whitespace', () => {
      const title = new TodoTitle('  Trimmed Title  ');
      expect(title.value).toBe('Trimmed Title');
    });

    it('should throw error for empty title', () => {
      expect(() => new TodoTitle('')).toThrow(InvalidTodoTitleException);
      expect(() => new TodoTitle('')).toThrow('Invalid todo title: cannot be empty');
    });

    it('should throw error for whitespace-only title', () => {
      expect(() => new TodoTitle('   ')).toThrow(InvalidTodoTitleException);
      expect(() => new TodoTitle('   ')).toThrow('Invalid todo title: cannot be empty');
    });

    it('should throw error for title too short', () => {
      expect(() => new TodoTitle('A')).toThrow(InvalidTodoTitleException);
      expect(() => new TodoTitle('A')).toThrow(
        'Invalid todo title: must be at least 2 characters long'
      );
    });

    it('should throw error for title too long', () => {
      const longTitle = 'A'.repeat(256);
      expect(() => new TodoTitle(longTitle)).toThrow(InvalidTodoTitleException);
      expect(() => new TodoTitle(longTitle)).toThrow(
        'Invalid todo title: cannot exceed 255 characters'
      );
    });

    it('should accept minimum valid length', () => {
      const title = new TodoTitle('Ab');
      expect(title.value).toBe('Ab');
    });

    it('should accept maximum valid length', () => {
      const maxTitle = 'A'.repeat(255);
      const title = new TodoTitle(maxTitle);
      expect(title.value).toBe(maxTitle);
    });
  });

  describe('value getter', () => {
    it('should return the title value', () => {
      const titleValue = 'Test Todo Title';
      const title = new TodoTitle(titleValue);
      expect(title.value).toBe(titleValue);
    });

    it('should return immutable value', () => {
      const title = new TodoTitle('Test Title');
      const value = title.value;

      // The value should be a string and cannot be modified
      expect(typeof value).toBe('string');
      expect(title.value).toBe('Test Title');
    });
  });

  describe('equality', () => {
    it('should be equal for same title values', () => {
      const title1 = new TodoTitle('Same Title');
      const title2 = new TodoTitle('Same Title');

      expect(title1.value).toBe(title2.value);
      expect(title1.equals(title2)).toBe(true);
    });

    it('should handle case sensitivity', () => {
      const title1 = new TodoTitle('Title');
      const title2 = new TodoTitle('title');

      expect(title1.value).not.toBe(title2.value);
      expect(title1.equals(title2)).toBe(false);
    });

    it('should handle trimming in equality', () => {
      const title1 = new TodoTitle('  Title  ');
      const title2 = new TodoTitle('Title');

      expect(title1.value).toBe(title2.value);
      expect(title1.equals(title2)).toBe(true);
    });

    it('should handle different titles as not equal', () => {
      const title1 = new TodoTitle('Different Title');
      const title2 = new TodoTitle('Another Title');

      expect(title1.equals(title2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the title value as string', () => {
      const titleValue = 'Test Todo Title';
      const title = new TodoTitle(titleValue);
      expect(title.toString()).toBe(titleValue);
    });

    it('should return trimmed value', () => {
      const title = new TodoTitle('  Trimmed Title  ');
      expect(title.toString()).toBe('Trimmed Title');
    });
  });

  describe('edge cases', () => {
    it('should handle special characters', () => {
      const specialTitle = 'Todo with émojis 🚀 and symbols @#$%';
      const title = new TodoTitle(specialTitle);
      expect(title.value).toBe(specialTitle);
    });

    it('should handle unicode characters', () => {
      const unicodeTitle = 'Ünicöde Tëst Títle';
      const title = new TodoTitle(unicodeTitle);
      expect(title.value).toBe(unicodeTitle);
    });

    it('should handle numbers and mixed content', () => {
      const mixedTitle = 'Todo #123: Buy 5 apples for $10.99';
      const title = new TodoTitle(mixedTitle);
      expect(title.value).toBe(mixedTitle);
    });
  });
});
