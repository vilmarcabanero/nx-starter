import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { config } from '../../../../config/config';

vi.mock('mongoose', () => ({
  default: {
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    connection: {
      on: vi.fn(),
    },
  },
}));

vi.mock('../../../../config/config', () => ({
  config: {
    database: {
      url: undefined,
      host: 'localhost',
      port: 27017,
      database: 'task_app',
    },
  },
}));

describe('MongooseConnection', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    originalEnv = { ...process.env };
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('connectMongoDB', () => {
    it('should connect to MongoDB using URL from config', async () => {
      const testUrl = 'mongodb://test:password@localhost:27017/testdb';
      vi.mocked(config).database.url = testUrl;

      const { connectMongoDB } = await import('./MongooseConnection');
      await connectMongoDB();

      expect(mongoose.connect).toHaveBeenCalledWith(testUrl, {});
      expect(consoleSpy).toHaveBeenCalledWith('📦 MongoDB connected successfully');
    });

    it('should connect to MongoDB using individual config properties when URL is not provided', async () => {
      vi.mocked(config).database.url = undefined;
      vi.mocked(config).database.host = 'testhost';
      vi.mocked(config).database.port = 27018;
      vi.mocked(config).database.database = 'testdb';

      const { connectMongoDB } = await import('./MongooseConnection');
      await connectMongoDB();

      expect(mongoose.connect).toHaveBeenCalledWith('mongodb://testhost:27018/testdb', {});
      expect(consoleSpy).toHaveBeenCalledWith('📦 MongoDB connected successfully');
    });

    it('should use default values when config properties are missing', async () => {
      vi.mocked(config).database.url = undefined;
      vi.mocked(config).database.host = undefined;
      vi.mocked(config).database.port = undefined;
      vi.mocked(config).database.database = undefined;

      const { connectMongoDB } = await import('./MongooseConnection');
      await connectMongoDB();

      expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/task_app', {});
      expect(consoleSpy).toHaveBeenCalledWith('📦 MongoDB connected successfully');
    });

    it('should set up connection event listeners', async () => {
      const { connectMongoDB } = await import('./MongooseConnection');
      await connectMongoDB();

      expect(mongoose.connection.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mongoose.connection.on).toHaveBeenCalledWith('disconnected', expect.any(Function));
    });

    it('should handle connection errors', async () => {
      const error = new Error('Connection failed');
      vi.mocked(mongoose.connect).mockRejectedValue(error);

      const { connectMongoDB } = await import('./MongooseConnection');

      await expect(connectMongoDB()).rejects.toThrow('Connection failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to connect to MongoDB:', error);
    });

    it('should handle error event', async () => {
      let errorHandler: ((error: Error) => void) | undefined;
      
      // Clear previous mocks and reset to success
      vi.mocked(mongoose.connect).mockResolvedValue(undefined);
      vi.mocked(mongoose.connection.on).mockImplementation((event: string, handler: any) => {
        if (event === 'error') {
          errorHandler = handler;
        }
        return undefined;
      });

      const { connectMongoDB } = await import('./MongooseConnection');
      await connectMongoDB();

      const testError = new Error('Connection error');
      errorHandler?.(testError);

      expect(consoleErrorSpy).toHaveBeenCalledWith('MongoDB connection error:', testError);
    });

    it('should handle disconnected event', async () => {
      let disconnectedHandler: (() => void) | undefined;
      
      // Clear previous mocks and reset to success
      vi.mocked(mongoose.connect).mockResolvedValue(undefined);
      vi.mocked(mongoose.connection.on).mockImplementation((event: string, handler: any) => {
        if (event === 'disconnected') {
          disconnectedHandler = handler;
        }
        return undefined;
      });

      const { connectMongoDB } = await import('./MongooseConnection');
      await connectMongoDB();

      disconnectedHandler?.();

      expect(consoleSpy).toHaveBeenCalledWith('📦 MongoDB disconnected');
    });
  });

  describe('disconnectMongoDB', () => {
    it('should disconnect from MongoDB successfully', async () => {
      const { disconnectMongoDB } = await import('./MongooseConnection');
      await disconnectMongoDB();

      expect(mongoose.disconnect).toHaveBeenCalledOnce();
      expect(consoleSpy).toHaveBeenCalledWith('📦 MongoDB connection closed');
    });

    it('should handle disconnection errors', async () => {
      const error = new Error('Disconnection failed');
      vi.mocked(mongoose.disconnect).mockRejectedValue(error);

      const { disconnectMongoDB } = await import('./MongooseConnection');

      await expect(disconnectMongoDB()).rejects.toThrow('Disconnection failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error closing MongoDB connection:', error);
    });
  });

  describe('SIGINT handler', () => {
    it('should register SIGINT handler', async () => {
      const processOnSpy = vi.spyOn(process, 'on').mockImplementation(() => process);
      const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

      await import('./MongooseConnection');

      expect(processOnSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));

      processOnSpy.mockRestore();
      processExitSpy.mockRestore();
    });

    it('should call disconnectMongoDB and exit on SIGINT', async () => {
      let sigintHandler: (() => Promise<void>) | undefined;
      const processOnSpy = vi.spyOn(process, 'on').mockImplementation((event: string, handler: any) => {
        if (event === 'SIGINT') {
          sigintHandler = handler;
        }
        return process;
      });
      const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

      // Reset mongoose disconnect mock to resolve successfully for this test
      vi.mocked(mongoose.disconnect).mockResolvedValue(undefined);

      await import('./MongooseConnection');

      expect(sigintHandler).toBeDefined();

      await sigintHandler?.();

      expect(mongoose.disconnect).toHaveBeenCalledOnce();
      expect(processExitSpy).toHaveBeenCalledWith(0);

      processOnSpy.mockRestore();
      processExitSpy.mockRestore();
    });
  });
});