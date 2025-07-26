import { describe, it, expect } from 'vitest';
import { createApiRoutes } from './index';

describe('API Routes', () => {
  it('should create and return an Express router', () => {
    const router = createApiRoutes();
    
    // Verify that router is defined and has expected properties
    expect(router).toBeDefined();
    expect(typeof router).toBe('function');
    
    // Check that router has Express router methods
    expect(typeof router.get).toBe('function');
    expect(typeof router.post).toBe('function');
    expect(typeof router.put).toBe('function');
    expect(typeof router.delete).toBe('function');
    expect(typeof router.use).toBe('function');
  });

  it('should create a new router instance each time', () => {
    const router1 = createApiRoutes();
    const router2 = createApiRoutes();
    
    // Should create different instances
    expect(router1).not.toBe(router2);
  });
});