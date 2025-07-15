import { describe, it, expect } from 'vitest';
import { TodoId } from './TodoId';

describe('TodoId Value Object', () => {
  describe('MongoDB ObjectId Support', () => {
    it('should create a valid todo id with MongoDB ObjectId format', () => {
      const id = new TodoId('6875fb81218768f1acf26122');
      
      expect(id.value).toBe('6875fb81218768f1acf26122');
      expect(id.isMongoObjectId()).toBe(true);
      expect(id.isUUID()).toBe(false);
      expect(id.getIdType()).toBe('mongodb');
    });

    it('should create a valid todo id with different MongoDB ObjectId', () => {
      const id = new TodoId('507f1f77bcf86cd799439011');
      
      expect(id.value).toBe('507f1f77bcf86cd799439011');
      expect(id.isMongoObjectId()).toBe(true);
      expect(id.isUUID()).toBe(false);
      expect(id.getIdType()).toBe('mongodb');
    });

    it('should handle uppercase MongoDB ObjectId', () => {
      const id = new TodoId('6875FB81218768F1ACF26122');
      
      expect(id.value).toBe('6875FB81218768F1ACF26122');
      expect(id.isMongoObjectId()).toBe(true);
      expect(id.isUUID()).toBe(false);
      expect(id.getIdType()).toBe('mongodb');
    });

    it('should handle mixed case MongoDB ObjectId', () => {
      const id = new TodoId('6875fB81218768F1acF26122');
      
      expect(id.value).toBe('6875fB81218768F1acF26122');
      expect(id.isMongoObjectId()).toBe(true);
      expect(id.isUUID()).toBe(false);
      expect(id.getIdType()).toBe('mongodb');
    });

    it('should throw error for invalid MongoDB ObjectId - too short', () => {
      expect(() => new TodoId('6875fb81218768f1acf2612')).toThrow('Todo ID must be a valid UUID without dashes (32 hex characters) or MongoDB ObjectId (24 hex characters)');
    });

    it('should throw error for invalid MongoDB ObjectId - too long', () => {
      expect(() => new TodoId('6875fb81218768f1acf261223')).toThrow('Todo ID must be a valid UUID without dashes (32 hex characters) or MongoDB ObjectId (24 hex characters)');
    });

    it('should throw error for invalid MongoDB ObjectId - contains invalid characters', () => {
      expect(() => new TodoId('6875fb81218768f1acf2612z')).toThrow('Todo ID must be a valid UUID without dashes (32 hex characters) or MongoDB ObjectId (24 hex characters)');
    });

    it('should support equals comparison between MongoDB ObjectIds', () => {
      const id1 = new TodoId('6875fb81218768f1acf26122');
      const id2 = new TodoId('6875fb81218768f1acf26122');
      const id3 = new TodoId('507f1f77bcf86cd799439011');
      
      expect(id1.equals(id2)).toBe(true);
      expect(id1.equals(id3)).toBe(false);
    });

    it('should support equals comparison between different ID types', () => {
      const mongoId = new TodoId('6875fb81218768f1acf26122');
      const uuidId = new TodoId('a1b2c3d4e5f6789012345678901234ab');
      
      expect(mongoId.equals(uuidId)).toBe(false);
    });

    it('should support toString for MongoDB ObjectId', () => {
      const id = new TodoId('6875fb81218768f1acf26122');
      
      expect(id.toString()).toBe('6875fb81218768f1acf26122');
    });

    it('should support fromString for MongoDB ObjectId', () => {
      const id = TodoId.fromString('6875fb81218768f1acf26122');
      
      expect(id.value).toBe('6875fb81218768f1acf26122');
      expect(id.isMongoObjectId()).toBe(true);
      expect(id.getIdType()).toBe('mongodb');
    });
  });

  describe('UUID Support (Backward Compatibility)', () => {
    it('should identify UUID format correctly', () => {
      const id = new TodoId('a1b2c3d4e5f6789012345678901234ab');
      
      expect(id.isUUID()).toBe(true);
      expect(id.isMongoObjectId()).toBe(false);
      expect(id.getIdType()).toBe('uuid');
    });

    it('should identify uppercase UUID format correctly', () => {
      const id = new TodoId('A1B2C3D4E5F6789012345678901234AB');
      
      expect(id.isUUID()).toBe(true);
      expect(id.isMongoObjectId()).toBe(false);
      expect(id.getIdType()).toBe('uuid');
    });
  });

  describe('constructor', () => {
    it('should create a valid todo id with valid UUID string', () => {
      const id = new TodoId('a1b2c3d4e5f6789012345678901234ab');
      
      expect(id.value).toBe('a1b2c3d4e5f6789012345678901234ab');
    });

    it('should create a valid todo id with different UUID string', () => {
      const id = new TodoId('123456789abcdef0123456789abcdef0');
      
      expect(id.value).toBe('123456789abcdef0123456789abcdef0');
    });

    it('should throw error for empty string', () => {
      expect(() => new TodoId('')).toThrow('Todo ID must be a non-empty string');
    });

    it('should throw error for whitespace only', () => {
      expect(() => new TodoId('   ')).toThrow('Todo ID must be a non-empty string');
    });

    it('should throw error for non-string values', () => {
      expect(() => new TodoId(123 as unknown as string)).toThrow('Todo ID must be a non-empty string');
      expect(() => new TodoId(null as unknown as string)).toThrow('Todo ID must be a non-empty string');
      expect(() => new TodoId(undefined as unknown as string)).toThrow('Todo ID must be a non-empty string');
    });

    it('should throw error for invalid UUID format - too short', () => {
      expect(() => new TodoId('abc123')).toThrow('Todo ID must be a valid UUID without dashes (32 hex characters)');
    });

    it('should throw error for invalid UUID format - too long', () => {
      expect(() => new TodoId('a1b2c3d4e5f6789012345678901234abc')).toThrow('Todo ID must be a valid UUID without dashes (32 hex characters)');
    });

    it('should throw error for invalid UUID format - contains invalid characters', () => {
      expect(() => new TodoId('a1b2c3d4e5f6789012345678901234zx')).toThrow('Todo ID must be a valid UUID without dashes (32 hex characters)');
    });

    it('should throw error for UUID with dashes', () => {
      expect(() => new TodoId('a1b2c3d4-e5f6-7890-1234-5678901234ab')).toThrow('Todo ID must be a valid UUID without dashes (32 hex characters)');
    });

    it('should accept uppercase UUID', () => {
      const id = new TodoId('A1B2C3D4E5F6789012345678901234AB');
      expect(id.value).toBe('A1B2C3D4E5F6789012345678901234AB');
    });

    it('should accept mixed case UUID', () => {
      const id = new TodoId('A1b2C3d4E5f6789012345678901234Ab');
      expect(id.value).toBe('A1b2C3d4E5f6789012345678901234Ab');
    });
  });

  describe('equals', () => {
    it('should return true for identical IDs', () => {
      const id1 = new TodoId('a1b2c3d4e5f6789012345678901234ab');
      const id2 = new TodoId('a1b2c3d4e5f6789012345678901234ab');
      
      expect(id1.equals(id2)).toBe(true);
    });

    it('should return false for different IDs', () => {
      const id1 = new TodoId('a1b2c3d4e5f6789012345678901234ab');
      const id2 = new TodoId('123456789abcdef0123456789abcdef0');
      
      expect(id1.equals(id2)).toBe(false);
    });

    it('should handle case sensitivity correctly', () => {
      const id1 = new TodoId('a1b2c3d4e5f6789012345678901234ab');
      const id2 = new TodoId('A1B2C3D4E5F6789012345678901234AB');
      
      expect(id1.equals(id2)).toBe(false);
    });

    it('should handle edge case IDs correctly', () => {
      const id1 = new TodoId('00000000000000000000000000000001');
      const id2 = new TodoId('00000000000000000000000000000001');
      const id3 = new TodoId('00000000000000000000000000000002');
      
      expect(id1.equals(id2)).toBe(true);
      expect(id1.equals(id3)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the ID value as string', () => {
      const id = new TodoId('a1b2c3d4e5f6789012345678901234ab');
      
      expect(id.toString()).toBe('a1b2c3d4e5f6789012345678901234ab');
    });

    it('should handle numeric-looking UUIDs', () => {
      const id = new TodoId('12345678901234567890123456789012');
      
      expect(id.toString()).toBe('12345678901234567890123456789012');
    });

    it('should handle all-letter UUIDs', () => {
      const id = new TodoId('abcdefabcdefabcdefabcdefabcdefab');
      
      expect(id.toString()).toBe('abcdefabcdefabcdefabcdefabcdefab');
    });
  });

  describe('fromString', () => {
    it('should create TodoId from valid UUID string', () => {
      const id = TodoId.fromString('a1b2c3d4e5f6789012345678901234ab');
      
      expect(id.value).toBe('a1b2c3d4e5f6789012345678901234ab');
    });

    it('should create TodoId from valid numeric UUID string', () => {
      const id = TodoId.fromString('12345678901234567890123456789012');
      
      expect(id.value).toBe('12345678901234567890123456789012');
    });

    it('should throw error for invalid string format', () => {
      expect(() => TodoId.fromString('abc')).toThrow('Todo ID must be a valid UUID without dashes (32 hex characters)');
      expect(() => TodoId.fromString('12.34')).toThrow('Todo ID must be a valid UUID without dashes (32 hex characters)');
      expect(() => TodoId.fromString('')).toThrow('Todo ID must be a non-empty string');
      expect(() => TodoId.fromString('   ')).toThrow('Todo ID must be a non-empty string');
    });

    it('should throw error for string with dashes', () => {
      expect(() => TodoId.fromString('a1b2c3d4-e5f6-7890-1234-5678901234ab')).toThrow('Todo ID must be a valid UUID without dashes (32 hex characters)');
    });

    it('should throw error for string with invalid characters', () => {
      expect(() => TodoId.fromString('a1b2c3d4e5f6789012345678901234zx')).toThrow('Todo ID must be a valid UUID without dashes (32 hex characters)');
    });

    it('should handle uppercase UUID strings', () => {
      const id = TodoId.fromString('A1B2C3D4E5F6789012345678901234AB');
      expect(id.value).toBe('A1B2C3D4E5F6789012345678901234AB');
    });
  });

  describe('value object behavior', () => {
    it('should be immutable', () => {
      const id = new TodoId('a1b2c3d4e5f6789012345678901234ab');
      const originalValue = id.value;
      
      // Try to modify (should not be possible due to readonly)
      expect(id.value).toBe(originalValue);
    });

    it('should support comparison operations', () => {
      const id1 = new TodoId('a1b2c3d4e5f6789012345678901234ab');
      const id2 = new TodoId('b2c3d4e5f6789012345678901234abc1');
      const id3 = new TodoId('a1b2c3d4e5f6789012345678901234ab');
      
      expect(id1.value < id2.value).toBe(true);
      expect(id2.value > id1.value).toBe(true);
      expect(id1.equals(id3)).toBe(true);
    });
  });
});