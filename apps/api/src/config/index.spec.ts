import { describe, it, expect } from 'vitest';

describe('Config Index Exports', () => {
  it('should export config module correctly', async () => {
    // Import the index file to trigger the export statement
    const configIndex = await import('./index');
    
    // Verify that the export is available
    expect(configIndex).toBeDefined();
    
    // Check that the config export exists
    expect(configIndex.config).toBeDefined();
  });
});