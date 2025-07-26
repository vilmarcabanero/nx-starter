import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserRepository } from './InMemoryUserRepository';
import { User } from '@nx-starter/domain';

describe('InMemoryUserRepository', () => {
  let repository: InMemoryUserRepository;
  let testUser: User;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    
    // Create a test user with proper static method and valid bcrypt hash
    testUser = User.create(
      'test-123',
      'John',
      'Doe',
      'john.doe@example.com',
      'john.doe',
      '$2b$10$N9qo8uLOickgx2ZMRZoMye.VOQVJXL.O0i7VG0Z.r2fNJZeVoK2O6' // valid bcrypt hash
    );
  });

  describe('create', () => {
    it('should create a user and return user ID', async () => {
      const id = await repository.create(testUser);

      expect(id).toBe(testUser.id);
    });

    it('should store the user in memory', async () => {
      await repository.create(testUser);
      
      const retrievedUser = await repository.getById(testUser.id);
      expect(retrievedUser).toBeDefined();
      expect(retrievedUser?.id).toBe(testUser.id);
      expect(retrievedUser?.firstName).toBe('John');
      expect(retrievedUser?.lastName).toBe('Doe');
    });
  });

  describe('getById', () => {
    it('should return user when it exists', async () => {
      await repository.create(testUser);
      
      const result = await repository.getById(testUser.id);
      
      expect(result).toBeDefined();
      expect(result?.id).toBe(testUser.id);
      expect(result?.firstName).toBe('John');
    });

    it('should return undefined when user does not exist', async () => {
      const result = await repository.getById('non-existent-id');
      
      expect(result).toBeUndefined();
    });
  });

  describe('getByEmail', () => {
    it('should return user when email exists', async () => {
      await repository.create(testUser);
      
      const result = await repository.getByEmail('john.doe@example.com');
      
      expect(result).toBeDefined();
      expect(result?.id).toBe(testUser.id);
      expect(result?.email.value).toBe('john.doe@example.com');
    });

    it('should be case insensitive', async () => {
      await repository.create(testUser);
      
      const result = await repository.getByEmail('JOHN.DOE@EXAMPLE.COM');
      
      expect(result).toBeDefined();
      expect(result?.id).toBe(testUser.id);
    });

    it('should return undefined when email does not exist', async () => {
      const result = await repository.getByEmail('nonexistent@example.com');
      
      expect(result).toBeUndefined();
    });

    it('should handle empty repository', async () => {
      const result = await repository.getByEmail('john.doe@example.com');
      
      expect(result).toBeUndefined();
    });
  });

  describe('getByUsername', () => {
    it('should return user when username exists', async () => {
      await repository.create(testUser);
      
      const result = await repository.getByUsername('john.doe');
      
      expect(result).toBeDefined();
      expect(result?.id).toBe(testUser.id);
      expect(result?.username.value).toBe('john.doe');
    });

    it('should be case insensitive', async () => {
      await repository.create(testUser);
      
      const result = await repository.getByUsername('JOHN.DOE');
      
      expect(result).toBeDefined();
      expect(result?.id).toBe(testUser.id);
    });

    it('should return undefined when username does not exist', async () => {
      const result = await repository.getByUsername('nonexistent');
      
      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should throw error for update operation (not implemented)', async () => {
      await repository.create(testUser);
      
      const changes = { firstName: 'Jane' };
      
      await expect(
        repository.update(testUser.id, changes as any)
      ).rejects.toThrow('Update not implemented');
    });

    it('should throw error when updating non-existent user', async () => {
      const changes = { firstName: 'Jane' };
      
      await expect(
        repository.update('non-existent-id', changes as any)
      ).rejects.toThrow('User with ID non-existent-id not found');
    });
  });

  describe('delete', () => {
    it('should delete existing user', async () => {
      await repository.create(testUser);
      
      await repository.delete(testUser.id);
      
      const deletedUser = await repository.getById(testUser.id);
      expect(deletedUser).toBeUndefined();
    });

    it('should throw error when deleting non-existent user', async () => {
      await expect(
        repository.delete('non-existent-id')
      ).rejects.toThrow('User with ID non-existent-id not found');
    });
  });

  describe('getAll', () => {
    it('should return all users', async () => {
      const user2 = User.create(
        'test-456',
        'Jane',
        'Smith',
        'jane.smith@example.com',
        'jane.smith',
        '$2b$10$N9qo8uLOickgx2ZMRZoMye.VOQVJXL.O0i7VG0Z.r2fNJZeVoK2O6'
      );

      await repository.create(testUser);
      await repository.create(user2);
      
      const allUsers = await repository.getAll();
      
      expect(allUsers).toHaveLength(2);
      expect(allUsers[0].firstName).toBe('John');
      expect(allUsers[1].firstName).toBe('Jane');
    });

    it('should return empty array when no users exist', async () => {
      const allUsers = await repository.getAll();
      
      expect(allUsers).toHaveLength(0);
      expect(Array.isArray(allUsers)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in names', async () => {
      const specialUser = User.create(
        'special-123',
        "John-Paul O'Connor",
        'Smith-Wilson',
        'john.paul@example.com',
        'john.paul',
        '$2b$10$N9qo8uLOickgx2ZMRZoMye.VOQVJXL.O0i7VG0Z.r2fNJZeVoK2O6'
      );

      await repository.create(specialUser);
      
      const retrieved = await repository.getById(specialUser.id);
      expect(retrieved?.firstName).toBe("John-Paul O'Connor");
      expect(retrieved?.lastName).toBe('Smith-Wilson');
    });

    it('should handle unicode characters', async () => {
      const unicodeUser = User.create(
        'unicode-123',
        'José',
        'Müller',
        'jose.muller@example.com',
        'jose.muller',
        '$2b$10$N9qo8uLOickgx2ZMRZoMye.VOQVJXL.O0i7VG0Z.r2fNJZeVoK2O6'
      );

      await repository.create(unicodeUser);
      
      const retrieved = await repository.getById(unicodeUser.id);
      expect(retrieved?.firstName).toBe('José');
      expect(retrieved?.lastName).toBe('Müller');
    });

    it('should handle users with same names but different emails', async () => {
      const user1 = User.create(
        'user-1',
        'John',
        'Doe',
        'john1@example.com',
        'john1',
        '$2b$10$N9qo8uLOickgx2ZMRZoMye.VOQVJXL.O0i7VG0Z.r2fNJZeVoK2O6'
      );

      const user2 = User.create(
        'user-2',
        'John',
        'Doe',
        'john2@example.com',
        'john2',
        '$2b$10$N9qo8uLOickgx2ZMRZoMye.VOQVJXL.O0i7VG0Z.r2fNJZeVoK2O6'
      );

      await repository.create(user1);
      await repository.create(user2);

      const byEmail1 = await repository.getByEmail('john1@example.com');
      const byEmail2 = await repository.getByEmail('john2@example.com');

      expect(byEmail1?.id).toBe(user1.id);
      expect(byEmail2?.id).toBe(user2.id);
      expect(byEmail1?.firstName).toBe('John');
      expect(byEmail2?.firstName).toBe('John');
    });
  });
});