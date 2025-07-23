import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Sequelize } from 'sequelize';
import { config } from '../../../../config/config';

vi.mock('sequelize', () => ({
  Sequelize: vi.fn().mockImplementation(() => ({
    authenticate: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    sync: vi.fn().mockResolvedValue(undefined),
    query: vi.fn().mockResolvedValue(undefined),
    getDialect: vi.fn().mockReturnValue('sqlite'),
  })),
}));

vi.mock('../../../../config/config', () => ({
  config: {
    nodeEnv: 'test',
    database: {
      type: 'sqlite',
      url: undefined,
      host: 'localhost',
      port: undefined,
      username: undefined,
      password: undefined,
      database: 'task_app',
    },
  },
}));

vi.mock('./TodoModel', () => ({
  initTodoModel: vi.fn(),
}));

describe('SequelizeConnection', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  const MockedSequelize = vi.mocked(Sequelize);

  beforeEach(async () => {
    originalEnv = { ...process.env };
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('createSequelizeInstance', () => {
    it('should create Sequelize instance with URL for SQLite', async () => {
      const testUrl = 'sqlite:./test.db';
      vi.mocked(config).database.url = testUrl;
      vi.mocked(config).database.type = 'sqlite';

      const { createSequelizeInstance } = await import('./SequelizeConnection');
      createSequelizeInstance();

      expect(MockedSequelize).toHaveBeenCalledWith(testUrl, {
        logging: false,
        dialectOptions: {},
      });
    });

    it('should create Sequelize instance with URL for PostgreSQL in development', async () => {
      const testUrl = 'postgresql://user:pass@localhost:5432/testdb';
      vi.mocked(config).database.url = testUrl;
      vi.mocked(config).database.type = 'postgresql';
      vi.mocked(config).nodeEnv = 'development';

      const { createSequelizeInstance } = await import('./SequelizeConnection');
      createSequelizeInstance();

      expect(MockedSequelize).toHaveBeenCalledWith(testUrl, {
        logging: console.log,
        dialectOptions: {
          ssl: false,
          prependSearchPath: false,
        },
      });
    });

    it('should create Sequelize instance with URL for PostgreSQL in production', async () => {
      const testUrl = 'postgresql://user:pass@localhost:5432/testdb';
      vi.mocked(config).database.url = testUrl;
      vi.mocked(config).database.type = 'postgresql';
      vi.mocked(config).nodeEnv = 'production';

      const { createSequelizeInstance } = await import('./SequelizeConnection');
      createSequelizeInstance();

      expect(MockedSequelize).toHaveBeenCalledWith(testUrl, {
        logging: false,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
          prependSearchPath: false,
        },
      });
    });

    it('should create Sequelize instance with URL for MySQL in production', async () => {
      const testUrl = 'mysql://user:pass@localhost:3306/testdb';
      vi.mocked(config).database.url = testUrl;
      vi.mocked(config).database.type = 'mysql';
      vi.mocked(config).nodeEnv = 'production';

      const { createSequelizeInstance } = await import('./SequelizeConnection');
      createSequelizeInstance();

      expect(MockedSequelize).toHaveBeenCalledWith(testUrl, {
        logging: false,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
      });
    });

    it('should create SQLite instance with individual parameters', async () => {
      vi.mocked(config).database.url = undefined;
      vi.mocked(config).database.type = 'sqlite';
      vi.mocked(config).nodeEnv = 'development';

      const { createSequelizeInstance } = await import('./SequelizeConnection');
      createSequelizeInstance();

      expect(MockedSequelize).toHaveBeenCalledWith({
        dialect: 'sqlite',
        storage: './data/todos.db',
        logging: console.log,
      });
    });

    it('should create PostgreSQL instance with individual parameters', async () => {
      vi.mocked(config).database.url = undefined;
      vi.mocked(config).database.type = 'postgresql';
      vi.mocked(config).database.host = 'testhost';
      vi.mocked(config).database.port = 5433;
      vi.mocked(config).database.username = 'testuser';
      vi.mocked(config).database.password = 'testpass';
      vi.mocked(config).database.database = 'testdb';
      vi.mocked(config).nodeEnv = 'development';

      const { createSequelizeInstance } = await import('./SequelizeConnection');
      createSequelizeInstance();

      expect(MockedSequelize).toHaveBeenCalledWith({
        dialect: 'postgres',
        host: 'testhost',
        port: 5433,
        username: 'testuser',
        password: 'testpass',
        database: 'testdb',
        logging: console.log,
        dialectOptions: {
          prependSearchPath: false,
        },
      });
    });

    it('should create MySQL instance with individual parameters', async () => {
      vi.mocked(config).database.url = undefined;
      vi.mocked(config).database.type = 'mysql';
      vi.mocked(config).database.host = 'testhost';
      vi.mocked(config).database.port = 3307;
      vi.mocked(config).database.username = 'testuser';
      vi.mocked(config).database.password = 'testpass';
      vi.mocked(config).database.database = 'testdb';
      vi.mocked(config).nodeEnv = 'production';

      const { createSequelizeInstance } = await import('./SequelizeConnection');
      createSequelizeInstance();

      expect(MockedSequelize).toHaveBeenCalledWith({
        dialect: 'mysql',
        host: 'testhost',
        port: 3307,
        username: 'testuser',
        password: 'testpass',
        database: 'testdb',
        logging: false,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
      });
    });

    it('should use default values when parameters are missing', async () => {
      vi.mocked(config).database.url = undefined;
      vi.mocked(config).database.type = 'postgresql';
      vi.mocked(config).database.host = undefined;
      vi.mocked(config).database.port = undefined;
      vi.mocked(config).database.username = 'testuser';
      vi.mocked(config).database.password = 'testpass';
      vi.mocked(config).database.database = undefined;
      vi.mocked(config).nodeEnv = 'development';

      const { createSequelizeInstance } = await import('./SequelizeConnection');
      createSequelizeInstance();

      expect(MockedSequelize).toHaveBeenCalledWith({
        dialect: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'testuser',
        password: 'testpass',
        database: 'task_app',
        logging: console.log,
        dialectOptions: {
          prependSearchPath: false,
        },
      });
    });

    it('should create PostgreSQL instance with individual parameters in production', async () => {
      vi.mocked(config).database.url = undefined;
      vi.mocked(config).database.type = 'postgresql';
      vi.mocked(config).database.host = 'prodhost';
      vi.mocked(config).database.port = 5433;
      vi.mocked(config).database.username = 'produser';
      vi.mocked(config).database.password = 'prodpass';
      vi.mocked(config).database.database = 'proddb';
      vi.mocked(config).nodeEnv = 'production';

      const { createSequelizeInstance } = await import('./SequelizeConnection');
      createSequelizeInstance();

      expect(MockedSequelize).toHaveBeenCalledWith({
        dialect: 'postgres',
        host: 'prodhost',
        port: 5433,
        username: 'produser',
        password: 'prodpass',
        database: 'proddb',
        logging: false,
        dialectOptions: {
          prependSearchPath: false,
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
      });
    });

    it('should default to SQLite for unknown database type', async () => {
      vi.mocked(config).database.url = undefined;
      vi.mocked(config).database.type = 'unknown' as any;
      vi.mocked(config).nodeEnv = 'production';

      const { createSequelizeInstance } = await import('./SequelizeConnection');
      createSequelizeInstance();

      expect(MockedSequelize).toHaveBeenCalledWith({
        dialect: 'sqlite',
        storage: './data/todos.db',
        logging: false,
      });
    });
  });

  describe('getSequelizeInstance', () => {
    it('should create and authenticate Sequelize instance on first call', async () => {
      const mockSequelize = {
        authenticate: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
        sync: vi.fn().mockResolvedValue(undefined),
        query: vi.fn().mockResolvedValue(undefined),
        getDialect: vi.fn().mockReturnValue('sqlite'),
      };

      MockedSequelize.mockReturnValue(mockSequelize as any);

      const { getSequelizeInstance } = await import('./SequelizeConnection');
      const result = await getSequelizeInstance();

      expect(MockedSequelize).toHaveBeenCalledOnce();
      expect(mockSequelize.authenticate).toHaveBeenCalledOnce();
      expect(consoleSpy).toHaveBeenCalledWith('📦 Sequelize connection established successfully');
      expect(result).toBe(mockSequelize);
    });

    it('should return existing instance on subsequent calls', async () => {
      const mockSequelize = {
        authenticate: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
        sync: vi.fn().mockResolvedValue(undefined),
        query: vi.fn().mockResolvedValue(undefined),
        getDialect: vi.fn().mockReturnValue('sqlite'),
      };

      MockedSequelize.mockReturnValue(mockSequelize as any);

      const { getSequelizeInstance } = await import('./SequelizeConnection');
      const result1 = await getSequelizeInstance();
      const result2 = await getSequelizeInstance();

      expect(MockedSequelize).toHaveBeenCalledOnce();
      expect(mockSequelize.authenticate).toHaveBeenCalledOnce();
      expect(result1).toBe(result2);
    });

    it('should handle PostgreSQL setup with UUID extension and ENUM type', async () => {
      const mockSequelize = {
        authenticate: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
        sync: vi.fn().mockResolvedValue(undefined),
        query: vi.fn().mockResolvedValue(undefined),
        getDialect: vi.fn().mockReturnValue('postgres'),
      };

      MockedSequelize.mockReturnValue(mockSequelize as any);

      const { getSequelizeInstance } = await import('./SequelizeConnection');
      await getSequelizeInstance();

      expect(mockSequelize.query).toHaveBeenCalledWith('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
      expect(mockSequelize.query).toHaveBeenCalledWith(expect.stringContaining('CREATE TYPE todo_priority'));
      expect(consoleSpy).toHaveBeenCalledWith('📦 PostgreSQL UUID extension enabled');
      expect(consoleSpy).toHaveBeenCalledWith('📦 PostgreSQL ENUM type created/verified');
    });

    it('should handle PostgreSQL setup errors gracefully', async () => {
      const error = new Error('Extension already exists');
      const mockSequelize = {
        authenticate: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
        sync: vi.fn().mockResolvedValue(undefined),
        query: vi.fn().mockRejectedValue(error),
        getDialect: vi.fn().mockReturnValue('postgres'),
      };

      MockedSequelize.mockReturnValue(mockSequelize as any);

      const { getSequelizeInstance } = await import('./SequelizeConnection');
      await getSequelizeInstance();

      expect(consoleWarnSpy).toHaveBeenCalledWith('⚠️  PostgreSQL setup warning:', 'Extension already exists');
    });

    it('should sync models in development environment', async () => {
      const mockSequelize = {
        authenticate: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
        sync: vi.fn().mockResolvedValue(undefined),
        query: vi.fn().mockResolvedValue(undefined),
        getDialect: vi.fn().mockReturnValue('sqlite'),
      };

      MockedSequelize.mockReturnValue(mockSequelize as any);
      vi.mocked(config).nodeEnv = 'development';

      const { getSequelizeInstance } = await import('./SequelizeConnection');
      await getSequelizeInstance();

      expect(mockSequelize.sync).toHaveBeenCalledWith({ alter: true });
      expect(consoleSpy).toHaveBeenCalledWith('📦 Sequelize models synchronized');
    });

    it('should not sync models in non-development environment', async () => {
      const mockSequelize = {
        authenticate: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
        sync: vi.fn().mockResolvedValue(undefined),
        query: vi.fn().mockResolvedValue(undefined),
        getDialect: vi.fn().mockReturnValue('sqlite'),
      };

      MockedSequelize.mockReturnValue(mockSequelize as any);
      vi.mocked(config).nodeEnv = 'production';

      const { getSequelizeInstance } = await import('./SequelizeConnection');
      await getSequelizeInstance();

      expect(mockSequelize.sync).not.toHaveBeenCalled();
    });

    it('should handle authentication errors', async () => {
      const error = new Error('Authentication failed');
      const mockSequelize = {
        authenticate: vi.fn().mockRejectedValue(error),
        close: vi.fn().mockResolvedValue(undefined),
        sync: vi.fn().mockResolvedValue(undefined),
        query: vi.fn().mockResolvedValue(undefined),
        getDialect: vi.fn().mockReturnValue('sqlite'),
      };

      MockedSequelize.mockReturnValue(mockSequelize as any);

      const { getSequelizeInstance } = await import('./SequelizeConnection');

      await expect(getSequelizeInstance()).rejects.toThrow('Authentication failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Unable to connect to database via Sequelize:', error);
    });
  });

  describe('closeSequelizeConnection', () => {
    it('should close existing Sequelize connection', async () => {
      const mockSequelize = {
        authenticate: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
        sync: vi.fn().mockResolvedValue(undefined),
        query: vi.fn().mockResolvedValue(undefined),
        getDialect: vi.fn().mockReturnValue('sqlite'),
      };

      MockedSequelize.mockReturnValue(mockSequelize as any);

      const { getSequelizeInstance, closeSequelizeConnection } = await import('./SequelizeConnection');
      await getSequelizeInstance();
      await closeSequelizeConnection();

      expect(mockSequelize.close).toHaveBeenCalledOnce();
      expect(consoleSpy).toHaveBeenCalledWith('📦 Sequelize connection closed');
    });

    it('should not close if no connection exists', async () => {
      const { closeSequelizeConnection } = await import('./SequelizeConnection');
      await closeSequelizeConnection();

      expect(consoleSpy).not.toHaveBeenCalledWith('📦 Sequelize connection closed');
    });

    it('should reset singleton instance after closing', async () => {
      const mockSequelize = {
        authenticate: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
        sync: vi.fn().mockResolvedValue(undefined),
        query: vi.fn().mockResolvedValue(undefined),
        getDialect: vi.fn().mockReturnValue('sqlite'),
      };

      MockedSequelize.mockReturnValue(mockSequelize as any);

      const { getSequelizeInstance, closeSequelizeConnection } = await import('./SequelizeConnection');
      
      await getSequelizeInstance();
      await closeSequelizeConnection();
      
      // Should create new instance after closing
      await getSequelizeInstance();

      expect(MockedSequelize).toHaveBeenCalledTimes(2);
      expect(mockSequelize.authenticate).toHaveBeenCalledTimes(2);
    });
  });
});