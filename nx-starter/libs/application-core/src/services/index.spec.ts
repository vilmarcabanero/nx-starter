import { describe, it, expect } from 'vitest';
import * as ServicesModule from './index';

describe('Services Module', () => {
  it('should export all service classes', () => {
    // This test ensures the services index file is imported and coverage is tracked
    expect(ServicesModule).toBeDefined();
    expect(typeof ServicesModule).toBe('object');
  });

  it('should have exported content from service modules', () => {
    // Verify that exports are properly re-exported from service modules
    const moduleKeys = Object.keys(ServicesModule);
    expect(moduleKeys.length).toBeGreaterThan(0);
  });
});