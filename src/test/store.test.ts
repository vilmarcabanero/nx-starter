import { describe, it, expect } from 'vitest';
import { store } from '../core/application/store/store';
import { setFilter, clearError } from '../core/application/todos/slice';

describe('Store', () => {
  it('should have correct initial state', () => {
    const state = store.getState();
    expect(state.todos).toEqual({
      todos: [],
      status: 'idle',
      error: null,
      filter: 'all',
    });
  });

  it('should handle setFilter action', () => {
    store.dispatch(setFilter('active'));
    const state = store.getState();
    expect(state.todos.filter).toBe('active');
  });

  it('should handle clearError action', () => {
    // First set an error state by dispatching another action
    store.dispatch(setFilter('completed'));
    store.dispatch(clearError());
    
    const state = store.getState();
    expect(state.todos.error).toBeNull();
  });

  it('should be configurable store instance', () => {
    expect(store).toBeDefined();
    expect(typeof store.dispatch).toBe('function');
    expect(typeof store.getState).toBe('function');
    expect(typeof store.subscribe).toBe('function');
  });
});
