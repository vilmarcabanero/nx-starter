import { describe, it, expect } from 'vitest';

describe('Infrastructure Index Exports', () => {
  it('should export all infrastructure modules correctly', async () => {
    // Import the index file to trigger the export statements
    const infraIndex = await import('./index');
    
    // Verify that the exports are available
    expect(infraIndex).toBeDefined();
    
    // Check that the main exports exist
    expect(infraIndex.configureDI).toBeDefined();
    expect(typeof infraIndex.configureDI).toBe('function');
  });
});