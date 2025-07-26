import { describe, it, expect } from 'vitest';
import { TodoPriority, type TodoPriorityLevel } from './TodoPriority';

describe('TodoPriority Value Object', () => {
  describe('constructor', () => {
    it('should create priority with default medium level', () => {
      const priority = new TodoPriority();

      expect(priority.level).toBe('medium');
      expect(priority.numericValue).toBe(2);
    });

    it('should create priority with specified level', () => {
      const highPriority = new TodoPriority('high');
      const mediumPriority = new TodoPriority('medium');
      const lowPriority = new TodoPriority('low');

      expect(highPriority.level).toBe('high');
      expect(mediumPriority.level).toBe('medium');
      expect(lowPriority.level).toBe('low');
    });
  });

  describe('numericValue', () => {
    it('should return correct numeric values for each priority level', () => {
      const high = new TodoPriority('high');
      const medium = new TodoPriority('medium');
      const low = new TodoPriority('low');

      expect(high.numericValue).toBe(3);
      expect(medium.numericValue).toBe(2);
      expect(low.numericValue).toBe(1);
    });

    it('should return default numeric value for invalid level', () => {
      // This tests the default case in the switch statement
      const priority = new TodoPriority('invalid' as TodoPriorityLevel);

      expect(priority.numericValue).toBe(2);
    });
  });

  describe('isHigherThan', () => {
    it('should correctly compare high vs medium priority', () => {
      const high = new TodoPriority('high');
      const medium = new TodoPriority('medium');

      expect(high.isHigherThan(medium)).toBe(true);
      expect(medium.isHigherThan(high)).toBe(false);
    });

    it('should correctly compare medium vs low priority', () => {
      const medium = new TodoPriority('medium');
      const low = new TodoPriority('low');

      expect(medium.isHigherThan(low)).toBe(true);
      expect(low.isHigherThan(medium)).toBe(false);
    });

    it('should correctly compare high vs low priority', () => {
      const high = new TodoPriority('high');
      const low = new TodoPriority('low');

      expect(high.isHigherThan(low)).toBe(true);
      expect(low.isHigherThan(high)).toBe(false);
    });

    it('should return false for equal priorities', () => {
      const priority1 = new TodoPriority('medium');
      const priority2 = new TodoPriority('medium');

      expect(priority1.isHigherThan(priority2)).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for same priority levels', () => {
      const priority1 = new TodoPriority('high');
      const priority2 = new TodoPriority('high');

      expect(priority1.equals(priority2)).toBe(true);
    });

    it('should return false for different priority levels', () => {
      const high = new TodoPriority('high');
      const low = new TodoPriority('low');

      expect(high.equals(low)).toBe(false);
    });

    it('should handle default priorities correctly', () => {
      const priority1 = new TodoPriority();
      const priority2 = new TodoPriority('medium');

      expect(priority1.equals(priority2)).toBe(true);
    });
  });

  describe('toString', () => {
    it('should return the priority level as string', () => {
      const high = new TodoPriority('high');
      const medium = new TodoPriority('medium');
      const low = new TodoPriority('low');

      expect(high.toString()).toBe('high');
      expect(medium.toString()).toBe('medium');
      expect(low.toString()).toBe('low');
    });
  });

  describe('priority comparison scenarios', () => {
    it('should sort priorities correctly', () => {
      const priorities = [
        new TodoPriority('low'),
        new TodoPriority('high'),
        new TodoPriority('medium'),
        new TodoPriority('low'),
        new TodoPriority('high'),
      ];

      const sorted = priorities.sort((a, b) => b.numericValue - a.numericValue);

      expect(sorted[0].level).toBe('high');
      expect(sorted[1].level).toBe('high');
      expect(sorted[2].level).toBe('medium');
      expect(sorted[3].level).toBe('low');
      expect(sorted[4].level).toBe('low');
    });
  });
});
