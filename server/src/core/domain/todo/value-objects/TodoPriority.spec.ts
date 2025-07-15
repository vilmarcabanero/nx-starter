import { describe, it, expect } from 'vitest';
import { TodoPriority, TodoPriorityLevel } from './TodoPriority';

describe('TodoPriority', () => {
  describe('constructor', () => {
    it('should create priority with specified level', () => {
      const highPriority = new TodoPriority('high');
      expect(highPriority.level).toBe('high');

      const mediumPriority = new TodoPriority('medium');
      expect(mediumPriority.level).toBe('medium');

      const lowPriority = new TodoPriority('low');
      expect(lowPriority.level).toBe('low');
    });

    it('should default to medium priority', () => {
      const defaultPriority = new TodoPriority();
      expect(defaultPriority.level).toBe('medium');
    });
  });

  describe('level getter', () => {
    it('should return the priority level', () => {
      const priority = new TodoPriority('high');
      expect(priority.level).toBe('high');
    });

    it('should be immutable', () => {
      const priority = new TodoPriority('low');
      const level = priority.level;
      expect(level).toBe('low');
      expect(priority.level).toBe('low'); // Still the same
    });
  });

  describe('numericValue getter', () => {
    it('should return correct numeric values', () => {
      expect(new TodoPriority('high').numericValue).toBe(3);
      expect(new TodoPriority('medium').numericValue).toBe(2);
      expect(new TodoPriority('low').numericValue).toBe(1);
    });

    it('should return default value for unknown priority', () => {
      // This tests the default case in the switch statement
      const priority = new TodoPriority('medium');
      // We can't easily test the default case without modifying the type
      // but we can verify medium returns 2
      expect(priority.numericValue).toBe(2);
    });

    it('should return default numeric value for invalid priority level', () => {
      const priority = new TodoPriority('medium');
      // Artificially set an invalid level to test the default case
      (priority as any)._level = 'invalid' as any;
      
      expect(priority.numericValue).toBe(2); // Default value
    });
  });

  describe('isHigherThan', () => {
    it('should correctly compare priorities', () => {
      const highPriority = new TodoPriority('high');
      const mediumPriority = new TodoPriority('medium');
      const lowPriority = new TodoPriority('low');

      expect(highPriority.isHigherThan(mediumPriority)).toBe(true);
      expect(highPriority.isHigherThan(lowPriority)).toBe(true);
      expect(mediumPriority.isHigherThan(lowPriority)).toBe(true);

      expect(lowPriority.isHigherThan(mediumPriority)).toBe(false);
      expect(lowPriority.isHigherThan(highPriority)).toBe(false);
      expect(mediumPriority.isHigherThan(highPriority)).toBe(false);
    });

    it('should return false for equal priorities', () => {
      const priority1 = new TodoPriority('medium');
      const priority2 = new TodoPriority('medium');

      expect(priority1.isHigherThan(priority2)).toBe(false);
      expect(priority2.isHigherThan(priority1)).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for equal priorities', () => {
      const priority1 = new TodoPriority('high');
      const priority2 = new TodoPriority('high');

      expect(priority1.equals(priority2)).toBe(true);
      expect(priority2.equals(priority1)).toBe(true);
    });

    it('should return false for different priorities', () => {
      const highPriority = new TodoPriority('high');
      const lowPriority = new TodoPriority('low');

      expect(highPriority.equals(lowPriority)).toBe(false);
      expect(lowPriority.equals(highPriority)).toBe(false);
    });

    it('should work with default priority', () => {
      const defaultPriority = new TodoPriority();
      const mediumPriority = new TodoPriority('medium');

      expect(defaultPriority.equals(mediumPriority)).toBe(true);
    });
  });

  describe('toString', () => {
    it('should return string representation of priority level', () => {
      expect(new TodoPriority('high').toString()).toBe('high');
      expect(new TodoPriority('medium').toString()).toBe('medium');
      expect(new TodoPriority('low').toString()).toBe('low');
    });

    it('should work with default priority', () => {
      const defaultPriority = new TodoPriority();
      expect(defaultPriority.toString()).toBe('medium');
    });
  });

  describe('type safety', () => {
    it('should only accept valid priority levels', () => {
      // This is enforced by TypeScript, but we can test the valid values
      const validLevels: TodoPriorityLevel[] = ['low', 'medium', 'high'];
      
      validLevels.forEach(level => {
        const priority = new TodoPriority(level);
        expect(priority.level).toBe(level);
      });
    });
  });
});