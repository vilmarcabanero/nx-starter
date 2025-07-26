import { describe, it, expect } from 'vitest';

describe('Presentation Index Exports', () => {
  it('should export all presentation modules correctly', async () => {
    // Import the index file to trigger all export statements
    const presentationIndex = await import('./index');
    
    // Verify that the exports are available
    expect(presentationIndex).toBeDefined();
    
    // Check that the main exports exist
    expect(presentationIndex.TodoController).toBeDefined();
    expect(presentationIndex.createApiRoutes).toBeDefined();
    expect(presentationIndex.errorHandler).toBeDefined();
    expect(presentationIndex.notFoundHandler).toBeDefined();
    expect(presentationIndex.requestLogger).toBeDefined();
  });
});