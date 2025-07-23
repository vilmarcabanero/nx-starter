import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Sequelize, DataTypes } from 'sequelize';

vi.mock('sequelize', () => ({
  Sequelize: vi.fn(),
  Model: class Model {},
  DataTypes: {
    STRING: vi.fn(),
    BOOLEAN: vi.fn(),
    DATE: vi.fn(),
    ENUM: vi.fn(),
  },
}));

describe('TodoModel', () => {
  let mockSequelize: any;
  let mockDefine: any;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    
    mockDefine = vi.fn().mockReturnValue({
      sync: vi.fn(),
      associate: vi.fn(),
    });

    mockSequelize = {
      define: mockDefine,
      getDialect: vi.fn(),
    };

    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('initTodoModel', () => {
    it('should initialize Todo model with PostgreSQL dialect', async () => {
      mockSequelize.getDialect.mockReturnValue('postgres');
      
      const { initTodoModel } = await import('./TodoModel');
      initTodoModel(mockSequelize);

      expect(mockSequelize.getDialect).toHaveBeenCalled();
      expect(DataTypes.ENUM).toHaveBeenCalledWith('low', 'medium', 'high');
      expect(mockSequelize.define).toHaveBeenCalledWith(
        'Todo',
        expect.objectContaining({
          id: expect.any(Object),
          title: expect.any(Object),
          completed: expect.any(Object),
          priority: expect.any(Object),
          dueDate: expect.any(Object),
          createdAt: expect.any(Object),
        }),
        expect.objectContaining({
          tableName: 'todos',
          timestamps: false,
          schema: 'public', // PostgreSQL default schema
          indexes: expect.any(Array),
        })
      );
    });

    it('should initialize Todo model with custom PostgreSQL schema', async () => {
      process.env.DB_SCHEMA = 'custom_schema';
      mockSequelize.getDialect.mockReturnValue('postgres');
      
      const { initTodoModel } = await import('./TodoModel');
      initTodoModel(mockSequelize);

      expect(mockSequelize.define).toHaveBeenCalledWith(
        'Todo',
        expect.any(Object),
        expect.objectContaining({
          schema: 'custom_schema', // Custom schema from env
        })
      );
    });

    it('should initialize Todo model with MySQL dialect', async () => {
      mockSequelize.getDialect.mockReturnValue('mysql');
      
      const { initTodoModel } = await import('./TodoModel');
      initTodoModel(mockSequelize);

      expect(mockSequelize.getDialect).toHaveBeenCalled();
      expect(DataTypes.ENUM).toHaveBeenCalledWith('low', 'medium', 'high');
      expect(mockSequelize.define).toHaveBeenCalledWith(
        'Todo',
        expect.any(Object),
        expect.objectContaining({
          tableName: 'todos',
          timestamps: false,
          // No schema property for MySQL
          indexes: expect.any(Array),
        })
      );
    });

    it('should initialize Todo model with SQLite dialect', async () => {
      mockSequelize.getDialect.mockReturnValue('sqlite');
      
      const { initTodoModel } = await import('./TodoModel');
      initTodoModel(mockSequelize);

      expect(mockSequelize.getDialect).toHaveBeenCalled();
      expect(DataTypes.ENUM).toHaveBeenCalledWith('low', 'medium', 'high');
      expect(mockSequelize.define).toHaveBeenCalledWith(
        'Todo',
        expect.any(Object),
        expect.objectContaining({
          tableName: 'todos',
          timestamps: false,
          // No schema property for SQLite
          indexes: expect.any(Array),
        })
      );
    });

    it('should return the defined model', async () => {
      const expectedModel = { sync: vi.fn(), associate: vi.fn() };
      mockSequelize.define.mockReturnValue(expectedModel);
      mockSequelize.getDialect.mockReturnValue('sqlite');
      
      const { initTodoModel } = await import('./TodoModel');
      const result = initTodoModel(mockSequelize);

      expect(result).toBe(expectedModel);
    });
  });
});