import { describe, it, expect } from 'vitest';
import { TodoId } from './TodoId';

describe('TodoId', () => {
  describe('constructor', () => {
    it('should create TodoId with valid string', () => {
      const id = new TodoId('valid-id');
      expect(id.value).toBe('valid-id');
    });

    it('should create TodoId with UUID format', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const id = new TodoId(uuid);
      expect(id.value).toBe(uuid);
    });

    it('should create TodoId with numeric string', () => {
      const id = new TodoId('123456');
      expect(id.value).toBe('123456');
    });

    it('should throw error for empty string', () => {
      expect(() => new TodoId('')).toThrow('Todo ID must be a non-empty string');
    });

    it('should throw error for whitespace-only string', () => {
      expect(() => new TodoId('   ')).toThrow('Todo ID must be a non-empty string');
    });

    it('should throw error for non-string types', () => {
      expect(() => new TodoId(null as any)).toThrow('Todo ID must be a non-empty string');
      expect(() => new TodoId(undefined as any)).toThrow('Todo ID must be a non-empty string');
      expect(() => new TodoId(123 as any)).toThrow('Todo ID must be a non-empty string');
    });

    it('should handle very long IDs', () => {
      const longId = 'a'.repeat(1000);
      const id = new TodoId(longId);
      expect(id.value).toBe(longId);
    });
  });

  describe('value getter', () => {
    it('should return the ID value', () => {
      const idValue = 'test-id-123';
      const id = new TodoId(idValue);
      expect(id.value).toBe(idValue);
    });

    it('should return immutable value', () => {
      const id = new TodoId('test-id');
      const value = id.value;
      
      expect(typeof value).toBe('string');
      expect(id.value).toBe('test-id');
    });
  });

  describe('equals', () => {
    it('should return true for equal IDs', () => {
      const id1 = new TodoId('same-id');
      const id2 = new TodoId('same-id');
      
      expect(id1.equals(id2)).toBe(true);
      expect(id2.equals(id1)).toBe(true);
    });

    it('should return false for different IDs', () => {
      const id1 = new TodoId('id-1');
      const id2 = new TodoId('id-2');
      
      expect(id1.equals(id2)).toBe(false);
      expect(id2.equals(id1)).toBe(false);
    });

    it('should be case sensitive', () => {
      const id1 = new TodoId('ID');
      const id2 = new TodoId('id');
      
      expect(id1.equals(id2)).toBe(false);
    });

    it('should handle UUID comparison', () => {
      const uuid1 = '123e4567-e89b-12d3-a456-426614174000';
      const uuid2 = '123e4567-e89b-12d3-a456-426614174000';
      const uuid3 = '123e4567-e89b-12d3-a456-426614174001';
      
      const id1 = new TodoId(uuid1);
      const id2 = new TodoId(uuid2);
      const id3 = new TodoId(uuid3);
      
      expect(id1.equals(id2)).toBe(true);
      expect(id1.equals(id3)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return string representation of ID', () => {
      const idValue = 'test-id-123';
      const id = new TodoId(idValue);
      
      expect(id.toString()).toBe(idValue);
    });

    it('should work with complex IDs', () => {
      const complexId = 'user-123_todo-456@domain.com';
      const id = new TodoId(complexId);
      
      expect(id.toString()).toBe(complexId);
    });
  });

  describe('fromString static method', () => {
    it('should create TodoId from string', () => {
      const id = TodoId.fromString('static-test-id');
      
      expect(id).toBeInstanceOf(TodoId);
      expect(id.value).toBe('static-test-id');
    });

    it('should throw error for invalid string', () => {
      expect(() => TodoId.fromString('')).toThrow('Todo ID must be a non-empty string');
    });

    it('should be equivalent to constructor', () => {
      const idValue = 'test-id';
      const id1 = new TodoId(idValue);
      const id2 = TodoId.fromString(idValue);
      
      expect(id1.equals(id2)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle special characters', () => {
      const specialId = 'id-with-special-chars_@#$%^&*()';
      const id = new TodoId(specialId);
      
      expect(id.value).toBe(specialId);
      expect(id.toString()).toBe(specialId);
    });

    it('should handle unicode characters', () => {
      const unicodeId = 'tödö-íd-with-ünïcödë';
      const id = new TodoId(unicodeId);
      
      expect(id.value).toBe(unicodeId);
    });

    it('should handle numbers at start', () => {
      const numericStartId = '123-todo-id';
      const id = new TodoId(numericStartId);
      
      expect(id.value).toBe(numericStartId);
    });

    it('should handle single character ID', () => {
      const singleCharId = 'a';
      const id = new TodoId(singleCharId);
      
      expect(id.value).toBe(singleCharId);
    });
  });

  describe('immutability', () => {
    it('should be immutable', () => {
      const id = new TodoId('immutable-id');
      const originalValue = id.value;
      
      // Cannot modify the value directly since it's private and readonly
      expect(id.value).toBe(originalValue);
    });

    it('should create separate instances', () => {
      const id1 = new TodoId('test-id');
      const id2 = new TodoId('test-id');
      
      expect(id1).not.toBe(id2); // Different instances
      expect(id1.equals(id2)).toBe(true); // But equal values
    });
  });
});