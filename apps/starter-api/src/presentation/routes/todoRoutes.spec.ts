import { describe, it, expect } from 'vitest';
import { createTodoRoutes } from './todoRoutes';

describe('Todo Routes', () => {
  it('should create and return an Express router', () => {
    const router = createTodoRoutes();
    
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
    const router1 = createTodoRoutes();
    const router2 = createTodoRoutes();
    
    // Should create different instances
    expect(router1).not.toBe(router2);
  });
});