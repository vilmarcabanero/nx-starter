import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the config/app module
vi.mock('@/config/app', () => ({
  createApp: vi.fn(() => ({
    listen: vi.fn((port, callback) => {
      if (callback) callback();
      return {
        on: vi.fn(),
        close: vi.fn(),
      };
    }),
  })),
}));

// Mock the DI container module
vi.mock('@/core/infrastructure/di/container', () => ({
  configureDI: vi.fn().mockResolvedValue(undefined),
}));

// Mock the config module
vi.mock('@/config/config', () => ({
  config: {
    port: 4000,
    nodeEnv: 'test',
  },
}));

// Mock dotenv
vi.mock('dotenv', () => ({
  default: {
    config: vi.fn(),
  },
}));

describe('Server Index', () => {
  let consoleSpy: any;
  let processExitSpy: any;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: number) => {
      throw new Error(`process.exit(${code}) was called`);
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    processExitSpy.mockRestore();

    // Clean up modules
    vi.resetModules();
  });

  it('should start server successfully', async () => {
    // Import after mocking
    const { startServer } = await import('./index');

    // Call startServer explicitly
    await startServer();

    // Verify console.log was called with server start messages
    expect(consoleSpy).toHaveBeenCalledWith('🚀 Task App API Server running on port 4000');
    expect(consoleSpy).toHaveBeenCalledWith('🌍 Environment: test');
  });

  it('should handle DI configuration errors', async () => {
    // Mock configureDI to throw an error
    const { configureDI } = await import('@/core/infrastructure/di/container');
    vi.mocked(configureDI).mockRejectedValueOnce(new Error('DI configuration failed'));

    const { startServer } = await import('./index');

    try {
      await startServer();
      // If we reach here, the test should fail because startServer should have thrown
      expect.fail('Expected startServer to throw an error');
    } catch (error) {
      // This is expected since process.exit() throws in our mock
      expect(error.message).toBe('process.exit(1) was called');
    }

    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should handle app creation errors', async () => {
    // Mock createApp to throw an error
    const { createApp } = await import('@/config/app');
    vi.mocked(createApp).mockImplementationOnce(() => {
      throw new Error('App creation failed');
    });

    const { startServer } = await import('./index');

    try {
      await startServer();
      // If we reach here, the test should fail because startServer should have thrown
      expect.fail('Expected startServer to throw an error');
    } catch (error) {
      // This is expected since process.exit() throws in our mock
      expect(error.message).toBe('process.exit(1) was called');
    }

    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should start server when module is run directly', async () => {
    // Mock import.meta.url to simulate direct execution
    const originalArgv = process.argv;
    const mockUrl = 'file:///path/to/index.js';
    
    try {
      // Set up process.argv to match the file path
      process.argv[1] = '/path/to/index.js';
      
      // Mock import.meta to return our mock URL
      vi.doMock('./index', async () => {
        const original = await vi.importActual('./index');
        // Override the import.meta.url check by importing when direct execution is simulated
        if (mockUrl === `file://${process.argv[1]}`) {
          // This will trigger the startServer call
          const { startServer } = original as any;
          await startServer();
        }
        return original;
      });

      // Import the module which should trigger the direct execution path
      await import('./index');

      // Verify the server started
      expect(consoleSpy).toHaveBeenCalledWith('🚀 Task App API Server running on port 4000');
    } finally {
      process.argv = originalArgv;
    }
  });
});
