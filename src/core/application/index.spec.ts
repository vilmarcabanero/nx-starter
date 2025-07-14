import { describe, it, expect } from 'vitest';

describe('Application Layer Index Exports', () => {
  it('should export shared interfaces', async () => {
    const exports = await import('./shared/interfaces/ITodoService');
    expect(exports).toBeDefined();
  });

  it('should export todo application layer', async () => {
    const exports = await import('./todo');
    expect(exports).toBeDefined();
  });

  it('should re-export from main application index', async () => {
    const exports = await import('./index');
    expect(exports).toBeDefined();
  });
});
