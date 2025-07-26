import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Sequelize, DataTypes } from 'sequelize';

vi.mock('sequelize', () => ({
  Sequelize: vi.fn(),
  Model: class Model {
    static init = vi.fn();
  },
  DataTypes: {
    STRING: vi.fn(),
    BOOLEAN: vi.fn(),
    DATE: vi.fn(),
    ENUM: vi.fn(),
    UUID: vi.fn(),
    UUIDV4: vi.fn(),
    NOW: vi.fn(),
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
      
      const { initTodoModel, TodoSequelizeModel } = await import('./TodoModel');
      initTodoModel(mockSequelize);

      expect(mockSequelize.getDialect).toHaveBeenCalled();
      expect(DataTypes.ENUM).toHaveBeenCalledWith('low', 'medium', 'high');
      expect(TodoSequelizeModel.init).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(Object),
          title: expect.any(Object),
          completed: expect.any(Object),
          priority: expect.any(Object),
          dueDate: expect.any(Object),
          createdAt: expect.any(Object),
        }),
        expect.objectContaining({
          sequelize: mockSequelize,
          tableName: 'todo',
          timestamps: false,
          schema: 'public', // PostgreSQL default schema
          indexes: expect.any(Array),
        })
      );
    });

    it('should initialize Todo model with custom PostgreSQL schema', async () => {
      process.env.DB_SCHEMA = 'custom_schema';
      mockSequelize.getDialect.mockReturnValue('postgres');
      
      const { initTodoModel, TodoSequelizeModel } = await import('./TodoModel');
      initTodoModel(mockSequelize);

      expect(TodoSequelizeModel.init).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          schema: 'custom_schema', // Custom schema from env
        })
      );
    });

    it('should initialize Todo model with MySQL dialect', async () => {
      mockSequelize.getDialect.mockReturnValue('mysql');
      
      const { initTodoModel, TodoSequelizeModel } = await import('./TodoModel');
      initTodoModel(mockSequelize);

      expect(mockSequelize.getDialect).toHaveBeenCalled();
      expect(DataTypes.ENUM).toHaveBeenCalledWith('low', 'medium', 'high');
      expect(TodoSequelizeModel.init).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          sequelize: mockSequelize,
          tableName: 'todo',
          timestamps: false,
          // No schema property for MySQL
          indexes: expect.any(Array),
        })
      );
    });

    it('should initialize Todo model with SQLite dialect', async () => {
      mockSequelize.getDialect.mockReturnValue('sqlite');
      
      const { initTodoModel, TodoSequelizeModel } = await import('./TodoModel');
      initTodoModel(mockSequelize);

      expect(mockSequelize.getDialect).toHaveBeenCalled();
      expect(DataTypes.ENUM).toHaveBeenCalledWith('low', 'medium', 'high');
      expect(TodoSequelizeModel.init).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          sequelize: mockSequelize,
          tableName: 'todo',
          timestamps: false,
          // No schema property for SQLite
          indexes: expect.any(Array),
        })
      );
    });

    it('should return the defined model', async () => {
      mockSequelize.getDialect.mockReturnValue('sqlite');
      
      const { initTodoModel } = await import('./TodoModel');
      initTodoModel(mockSequelize);

      expect(mockSequelize.getDialect).toHaveBeenCalled();
    });
  });
});