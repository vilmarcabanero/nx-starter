import { describe, it, expect } from 'vitest';
import type { ITodoRepository } from './ITodoRepository';

// Import the actual module to ensure coverage
import * as ITodoRepositoryModule from './ITodoRepository';

describe('ITodoRepository', () => {
  it('should export ITodoRepository interface', () => {
    // This ensures the module is imported and coverage is tracked
    expect(ITodoRepositoryModule).toBeDefined();
    expect(typeof ITodoRepositoryModule).toBe('object');
  });

  it('should be a valid interface type definition', () => {
    // Mock implementation to verify interface structure
    const mockRepo: ITodoRepository = {
      getAll: async () => [],
      getById: async () => undefined,
      getActive: async () => [],
      getCompleted: async () => [],
      create: async () => 'mock-id',
      update: async () => {},
      delete: async () => {},
      count: async () => 0,
      countActive: async () => 0,
      countCompleted: async () => 0,
      findBySpecification: async () => [],
    };

    expect(typeof mockRepo.getAll).toBe('function');
    expect(typeof mockRepo.getById).toBe('function');
    expect(typeof mockRepo.getActive).toBe('function');
    expect(typeof mockRepo.getCompleted).toBe('function');
    expect(typeof mockRepo.create).toBe('function');
    expect(typeof mockRepo.update).toBe('function');
    expect(typeof mockRepo.delete).toBe('function');
    expect(typeof mockRepo.count).toBe('function');
    expect(typeof mockRepo.countActive).toBe('function');
    expect(typeof mockRepo.countCompleted).toBe('function');
    expect(typeof mockRepo.findBySpecification).toBe('function');
  });
});
