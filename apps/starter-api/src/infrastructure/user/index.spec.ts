import { describe, it, expect } from 'vitest';

describe('User Infrastructure Index', () => {
  it('should export user persistence modules', async () => {
    const module = await import('./index');
    
    // Should export persistence layer exports
    expect(module).toHaveProperty('InMemoryUserRepository');
    expect(module).toHaveProperty('MongooseUserRepository');
    expect(module).toHaveProperty('SqliteUserRepository');
    expect(module).toHaveProperty('TypeOrmUserRepository');
  });

  it('should export repository classes as constructors', async () => {
    const module = await import('./index');
    
    const repositoryClasses = [
      'InMemoryUserRepository',
      'MongooseUserRepository', 
      'SqliteUserRepository',
      'TypeOrmUserRepository'
    ];

    repositoryClasses.forEach(className => {
      expect(module).toHaveProperty(className);
      expect(typeof module[className]).toBe('function');
    });
  });
});