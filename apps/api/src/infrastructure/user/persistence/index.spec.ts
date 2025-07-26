import { describe, it, expect } from 'vitest';

describe('User Persistence Index', () => {
  it('should export all user repository implementations', async () => {
    const module = await import('./index');
    
    const repositoryExports = [
      'InMemoryUserRepository',
      'SqliteUserRepository',
      'TypeOrmUserRepository', 
      'MongooseUserRepository'
    ];

    repositoryExports.forEach(exportName => {
      expect(module).toHaveProperty(exportName);
      expect(typeof module[exportName]).toBe('function');
    });
  });

  it('should export entity and schema classes', async () => {
    const module = await import('./index');
    
    const entitySchemaExports = [
      'UserEntity',
      'UserModel' // From UserSchema
    ];

    entitySchemaExports.forEach(exportName => {
      expect(module).toHaveProperty(exportName);
    });
  });

  it('should be able to instantiate repository classes', async () => {
    const module = await import('./index');
    
    // Test that we can create instances (basic smoke test)
    expect(() => new module.InMemoryUserRepository()).not.toThrow();
    expect(() => new module.SqliteUserRepository()).not.toThrow();
    expect(() => new module.TypeOrmUserRepository()).not.toThrow();
    expect(() => new module.MongooseUserRepository()).not.toThrow();
  });

  it('should have repository classes implement expected interface', async () => {
    const module = await import('./index');
    
    const repository = new module.InMemoryUserRepository();
    
    // Check that it has the expected methods (interface compliance)
    expect(typeof repository.getById).toBe('function');
    expect(typeof repository.getByEmail).toBe('function');
    expect(typeof repository.getByUsername).toBe('function');
    expect(typeof repository.create).toBe('function');
    expect(typeof repository.update).toBe('function');
    expect(typeof repository.delete).toBe('function');
    expect(typeof repository.getAll).toBe('function');
    expect(typeof repository.existsByEmail).toBe('function');
    expect(typeof repository.existsByUsername).toBe('function');
  });
});