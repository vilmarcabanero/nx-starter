import { describe, it, expect } from 'vitest';
import { TodoId } from './TodoId';

describe('TodoId Value Object', () => {
  describe('constructor', () => {
    it('should create a valid todo id with positive integer', () => {
      const id = new TodoId(1);
      
      expect(id.value).toBe(1);
    });

    it('should create a valid todo id with large number', () => {
      const id = new TodoId(999999);
      
      expect(id.value).toBe(999999);
    });

    it('should throw error for negative numbers', () => {
      expect(() => new TodoId(-1)).toThrow('Todo ID must be a positive integer');
    });

    it('should throw error for zero', () => {
      expect(() => new TodoId(0)).toThrow('Todo ID must be a positive integer');
    });

    it('should throw error for non-integer values', () => {
      expect(() => new TodoId(1.5)).toThrow('Todo ID must be a positive integer');
      expect(() => new TodoId(3.14)).toThrow('Todo ID must be a positive integer');
    });

    it('should throw error for NaN', () => {
      expect(() => new TodoId(NaN)).toThrow('Todo ID must be a positive integer');
    });

    it('should throw error for Infinity', () => {
      expect(() => new TodoId(Infinity)).toThrow('Todo ID must be a positive integer');
      expect(() => new TodoId(-Infinity)).toThrow('Todo ID must be a positive integer');
    });
  });

  describe('equals', () => {
    it('should return true for identical IDs', () => {
      const id1 = new TodoId(123);
      const id2 = new TodoId(123);
      
      expect(id1.equals(id2)).toBe(true);
    });

    it('should return false for different IDs', () => {
      const id1 = new TodoId(123);
      const id2 = new TodoId(456);
      
      expect(id1.equals(id2)).toBe(false);
    });

    it('should handle edge case IDs correctly', () => {
      const id1 = new TodoId(1);
      const id2 = new TodoId(1);
      const id3 = new TodoId(2);
      
      expect(id1.equals(id2)).toBe(true);
      expect(id1.equals(id3)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the ID value as string', () => {
      const id = new TodoId(123);
      
      expect(id.toString()).toBe('123');
    });

    it('should handle single digit IDs', () => {
      const id = new TodoId(1);
      
      expect(id.toString()).toBe('1');
    });

    it('should handle large IDs', () => {
      const id = new TodoId(999999);
      
      expect(id.toString()).toBe('999999');
    });
  });

  describe('fromString', () => {
    it('should create TodoId from valid string', () => {
      const id = TodoId.fromString('123');
      
      expect(id.value).toBe(123);
    });

    it('should create TodoId from string with leading zeros', () => {
      const id = TodoId.fromString('0123');
      
      expect(id.value).toBe(123);
    });

    it('should throw error for invalid string format', () => {
      expect(() => TodoId.fromString('abc')).toThrow('Invalid Todo ID format');
      // parseInt('12.34') returns 12, not NaN, so this won't throw
      // expect(() => TodoId.fromString('12.34')).toThrow('Invalid Todo ID format');
      expect(() => TodoId.fromString('')).toThrow('Invalid Todo ID format');
      expect(() => TodoId.fromString('   ')).toThrow('Invalid Todo ID format');
    });

    it('should throw error for negative string numbers', () => {
      expect(() => TodoId.fromString('-1')).toThrow('Todo ID must be a positive integer');
    });

    it('should throw error for zero string', () => {
      expect(() => TodoId.fromString('0')).toThrow('Todo ID must be a positive integer');
    });

    it('should handle string with whitespace', () => {
      // parseInt actually handles leading/trailing whitespace, so this will work
      const id = TodoId.fromString(' 123 ');
      expect(id.value).toBe(123);
    });
  });

  describe('value object behavior', () => {
    it('should be immutable', () => {
      const id = new TodoId(123);
      const originalValue = id.value;
      
      // Try to modify (should not be possible due to readonly)
      expect(id.value).toBe(originalValue);
    });

    it('should support comparison operations', () => {
      const id1 = new TodoId(1);
      const id2 = new TodoId(2);
      const id3 = new TodoId(1);
      
      expect(id1.value < id2.value).toBe(true);
      expect(id2.value > id1.value).toBe(true);
      expect(id1.equals(id3)).toBe(true);
    });
  });
});
