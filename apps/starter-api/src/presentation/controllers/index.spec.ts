import { describe, it, expect } from 'vitest';

describe('Controllers Index Exports', () => {
  it('should export TodoController correctly', async () => {
    // Import the index file to trigger the export statement
    const controllersIndex = await import('./index');
    
    // Verify that the export is available
    expect(controllersIndex).toBeDefined();
    
    // Check that TodoController is exported
    expect(controllersIndex.TodoController).toBeDefined();
    expect(typeof controllersIndex.TodoController).toBe('function');
  });
});