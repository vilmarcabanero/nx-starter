import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DataSource } from 'typeorm';
import { config } from '../../../../config/config';

vi.mock('../../../../config/config', () => ({
  config: {
    nodeEnv: 'test',
    database: {
      type: 'sqlite',
      url: './test.db',
    },
  },
}));

vi.mock('typeorm', () => ({
  DataSource: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn().mockResolvedValue(undefined),
    isInitialized: false,
  })),
  Entity: vi.fn(() => vi.fn()),
  PrimaryGeneratedColumn: vi.fn(() => vi.fn()),
  Column: vi.fn(() => vi.fn()),
  CreateDateColumn: vi.fn(() => vi.fn()),
}));

describe('TypeOrmConnection', () => {
  let originalEnv: NodeJS.ProcessEnv;
  const MockedDataSource = vi.mocked(DataSource);

  beforeEach(async () => {
    originalEnv = { ...process.env };
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('createTypeOrmDataSource', () => {
    it('should create PostgreSQL DataSource when type is postgresql', async () => {
      const mockConfig = {
        nodeEnv: 'development',
        database: {
          type: 'postgresql',
          url: 'postgresql://user:pass@localhost:5432/testdb',
          host: 'localhost',
          port: 5432,
          username: 'user',
          password: 'pass',
          database: 'testdb',
        },
      };

      vi.mocked(config).nodeEnv = mockConfig.nodeEnv;
      vi.mocked(config).database = mockConfig.database as any;

      const { createTypeOrmDataSource } = await import('./TypeOrmConnection');
      createTypeOrmDataSource();

      expect(MockedDataSource).toHaveBeenCalledWith({
        type: 'postgres',
        url: 'postgresql://user:pass@localhost:5432/testdb',
        host: 'localhost',
        port: 5432,
        username: 'user',
        password: 'pass',
        database: 'testdb',
        entities: expect.any(Array),
        synchronize: true,
        logging: true,
      });
    });

    it('should create MySQL DataSource when type is mysql', async () => {
      const mockConfig = {
        nodeEnv: 'production',
        database: {
          type: 'mysql',
          url: 'mysql://user:pass@localhost:3306/testdb',
          host: 'localhost',
          port: 3306,
          username: 'user',
          password: 'pass',
          database: 'testdb',
        },
      };

      vi.mocked(config).nodeEnv = mockConfig.nodeEnv;
      vi.mocked(config).database = mockConfig.database as any;

      const { createTypeOrmDataSource } = await import('./TypeOrmConnection');
      createTypeOrmDataSource();

      expect(MockedDataSource).toHaveBeenCalledWith({
        type: 'mysql',
        url: 'mysql://user:pass@localhost:3306/testdb',
        host: 'localhost',
        port: 3306,
        username: 'user',
        password: 'pass',
        database: 'testdb',
        entities: expect.any(Array),
        synchronize: false,
        logging: false,
      });
    });

    it('should create MySQL DataSource with default values when they are not provided', async () => {
      const mockConfig = {
        nodeEnv: 'production',
        database: {
          type: 'mysql',
          url: 'mysql://user:pass@localhost:3306/testdb',
          username: 'user',
          password: 'pass',
          // host, port, and database not provided to test defaults
        },
      };

      vi.mocked(config).nodeEnv = mockConfig.nodeEnv;
      vi.mocked(config).database = mockConfig.database as any;

      const { createTypeOrmDataSource } = await import('./TypeOrmConnection');
      createTypeOrmDataSource();

      expect(MockedDataSource).toHaveBeenCalledWith({
        type: 'mysql',
        url: 'mysql://user:pass@localhost:3306/testdb',
        host: 'localhost', // default
        port: 3306, // default
        username: 'user',
        password: 'pass',
        database: 'task_app', // default
        entities: expect.any(Array),
        synchronize: false,
        logging: false,
      });
    });

    it('should create SQLite DataSource when type is sqlite', async () => {
      const mockConfig = {
        nodeEnv: 'test',
        database: {
          type: 'sqlite',
          url: './test.db',
        },
      };

      vi.mocked(config).nodeEnv = mockConfig.nodeEnv;
      vi.mocked(config).database = mockConfig.database as any;

      const { createTypeOrmDataSource } = await import('./TypeOrmConnection');
      createTypeOrmDataSource();

      expect(MockedDataSource).toHaveBeenCalledWith({
        type: 'sqlite',
        database: './test.db',
        entities: expect.any(Array),
        synchronize: false,
        logging: false,
      });
    });

    it('should default to SQLite when type is not specified', async () => {
      const mockConfig = {
        nodeEnv: 'test',
        database: {
          type: undefined,
        },
      };

      vi.mocked(config).nodeEnv = mockConfig.nodeEnv;
      vi.mocked(config).database = mockConfig.database as any;

      const { createTypeOrmDataSource } = await import('./TypeOrmConnection');
      createTypeOrmDataSource();

      expect(MockedDataSource).toHaveBeenCalledWith({
        type: 'sqlite',
        database: './data/todos.db',
        entities: expect.any(Array),
        synchronize: false,
        logging: false,
      });
    });

    it('should use default values when database config is missing', async () => {
      const mockConfig = {
        nodeEnv: 'development',
        database: {
          type: 'postgresql',
        },
      };

      vi.mocked(config).nodeEnv = mockConfig.nodeEnv;
      vi.mocked(config).database = mockConfig.database as any;

      const { createTypeOrmDataSource } = await import('./TypeOrmConnection');
      createTypeOrmDataSource();

      expect(MockedDataSource).toHaveBeenCalledWith({
        type: 'postgres',
        url: undefined,
        host: 'localhost',
        port: 5432,
        username: undefined,
        password: undefined,
        database: 'task_app',
        entities: expect.any(Array),
        synchronize: true,
        logging: true,
      });
    });
  });

  describe('getTypeOrmDataSource', () => {
    it('should create and initialize DataSource on first call', async () => {
      const mockDataSource = {
        initialize: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn().mockResolvedValue(undefined),
        isInitialized: false,
      };

      MockedDataSource.mockReturnValue(mockDataSource as any);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const { getTypeOrmDataSource } = await import('./TypeOrmConnection');
      const result = await getTypeOrmDataSource();

      expect(MockedDataSource).toHaveBeenCalledOnce();
      expect(mockDataSource.initialize).toHaveBeenCalledOnce();
      expect(consoleSpy).toHaveBeenCalledWith('📦 TypeORM DataSource initialized');
      expect(result).toBe(mockDataSource);

      consoleSpy.mockRestore();
    });

    it('should return existing DataSource if already initialized', async () => {
      const mockDataSource = {
        initialize: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn().mockResolvedValue(undefined),
        isInitialized: true,
      };

      MockedDataSource.mockReturnValue(mockDataSource as any);

      const { getTypeOrmDataSource } = await import('./TypeOrmConnection');
      const result1 = await getTypeOrmDataSource();
      const result2 = await getTypeOrmDataSource();

      expect(MockedDataSource).toHaveBeenCalledOnce();
      expect(mockDataSource.initialize).not.toHaveBeenCalled();
      expect(result1).toBe(result2);
    });

    it('should not initialize if DataSource is already initialized', async () => {
      const mockDataSource = {
        initialize: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn().mockResolvedValue(undefined),
        isInitialized: true,
      };

      MockedDataSource.mockReturnValue(mockDataSource as any);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const { getTypeOrmDataSource } = await import('./TypeOrmConnection');
      await getTypeOrmDataSource();

      expect(mockDataSource.initialize).not.toHaveBeenCalled();
      expect(consoleSpy).not.toHaveBeenCalledWith('📦 TypeORM DataSource initialized');

      consoleSpy.mockRestore();
    });
  });

  describe('closeTypeOrmConnection', () => {
    it('should close initialized DataSource', async () => {
      const mockDataSource = {
        initialize: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn().mockResolvedValue(undefined),
        isInitialized: true,
      };

      MockedDataSource.mockReturnValue(mockDataSource as any);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const { getTypeOrmDataSource, closeTypeOrmConnection } = await import('./TypeOrmConnection');
      await getTypeOrmDataSource();
      await closeTypeOrmConnection();

      expect(mockDataSource.destroy).toHaveBeenCalledOnce();
      expect(consoleSpy).toHaveBeenCalledWith('📦 TypeORM DataSource closed');

      consoleSpy.mockRestore();
    });

    it('should not close if DataSource is not initialized', async () => {
      const mockDataSource = {
        initialize: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn().mockResolvedValue(undefined),
        isInitialized: false,
      };

      MockedDataSource.mockReturnValue(mockDataSource as any);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const { getTypeOrmDataSource, closeTypeOrmConnection } = await import('./TypeOrmConnection');
      await getTypeOrmDataSource();
      mockDataSource.isInitialized = false;
      await closeTypeOrmConnection();

      expect(mockDataSource.destroy).not.toHaveBeenCalled();
      expect(consoleSpy).not.toHaveBeenCalledWith('📦 TypeORM DataSource closed');

      consoleSpy.mockRestore();
    });

    it('should not close if DataSource is null', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const { closeTypeOrmConnection } = await import('./TypeOrmConnection');
      await closeTypeOrmConnection();

      expect(consoleSpy).not.toHaveBeenCalledWith('📦 TypeORM DataSource closed');
      consoleSpy.mockRestore();
    });
  });
});