import { describe, it, expect } from 'vitest';

describe('Database Connections Index', () => {
  it('should export TypeOrmConnection', async () => {
    const module = await import('./index');
    expect(module).toHaveProperty('getTypeOrmDataSource');
  });

  it('should export MongooseConnection', async () => {
    const module = await import('./index');
    expect(module).toHaveProperty('getMongooseConnection');
  });

  it('should export SqliteConnection', async () => {
    const module = await import('./index');
    expect(module).toHaveProperty('getSqliteDatabase');
  });

  it('should export all connection functions', async () => {
    const module = await import('./index');
    
    const expectedExports = [
      'getTypeOrmDataSource',
      'getMongooseConnection', 
      'getSqliteDatabase'
    ];

    expectedExports.forEach(exportName => {
      expect(module).toHaveProperty(exportName);
      expect(typeof module[exportName]).toBe('function');
    });
  });
});