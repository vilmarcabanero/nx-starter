import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useTodoViewModel } from '../presentation/view-models/useTodoViewModel';

// Mock the dispatch functions to prevent actual thunk calls
const mockDispatch = vi.fn();

vi.mock('../presentation/hooks/redux', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: { todos: { todos: unknown[], status: string, error: unknown, filter: string } }) => unknown) => {
    const mockState = {
      todos: {
        todos: [],
        status: 'idle' as const,
        error: null,
        filter: 'all' as const
      }
    };
    return selector(mockState);
  }
}));

// Mock the slice actions and selectors
vi.mock('../core/application/todos/slice', () => ({
  default: (state = { todos: [], status: 'idle', error: null, filter: 'all' }) => state,
  setFilter: vi.fn((filter) => ({ type: 'todos/setFilter', payload: filter })),
  clearError: vi.fn(() => ({ type: 'todos/clearError' })),
  selectTodos: vi.fn((state) => state.todos),
  selectFilteredTodos: vi.fn((state) => state.todos.todos)
}));

// Mock the thunks - they should just return a simple action for our test
vi.mock('../core/application/todos/thunks', () => ({
  fetchTodosThunk: vi.fn(() => ({ type: 'todos/fetchTodos' })),
  createTodoThunk: vi.fn(() => ({ type: 'todos/createTodo' })),
  updateTodoThunk: vi.fn(() => ({ type: 'todos/updateTodo' })),
  deleteTodoThunk: vi.fn(() => ({ type: 'todos/deleteTodo' })),
  toggleTodoThunk: vi.fn(() => ({ type: 'todos/toggleTodo' }))
}));

describe('useTodoViewModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDispatch.mockReset();
    // Default to successful dispatch - return a promise-like object with unwrap
    mockDispatch.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({})
    });
  });

  const createWrapper = () => {
    // Create a simple reducer for testing
    const testReducer = (state = { todos: { todos: [], status: 'idle', error: null, filter: 'all' } }) => state;
    
    const store = configureStore({
      reducer: {
        todos: testReducer
      }
    });
    
    return ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
  };

  it('should return initial state correctly', () => {
    const { result } = renderHook(() => useTodoViewModel(), {
      wrapper: createWrapper()
    });

    expect(result.current.todos).toEqual([]);
    expect(result.current.allTodos).toEqual([]);
    expect(result.current.filter).toBe('all');
    expect(result.current.stats).toEqual({
      total: 0,
      active: 0,
      completed: 0
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isIdle).toBe(true);
    expect(result.current.hasError).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should provide all required functions', () => {
    const { result } = renderHook(() => useTodoViewModel(), {
      wrapper: createWrapper()
    });

    expect(typeof result.current.createTodo).toBe('function');
    expect(typeof result.current.updateTodo).toBe('function');
    expect(typeof result.current.deleteTodo).toBe('function');
    expect(typeof result.current.toggleTodo).toBe('function');
    expect(typeof result.current.changeFilter).toBe('function');
    expect(typeof result.current.dismissError).toBe('function');
    expect(typeof result.current.refreshTodos).toBe('function');
  });

  it('should return correct computed properties', () => {
    const { result } = renderHook(() => useTodoViewModel(), {
      wrapper: createWrapper()
    });

    expect(result.current).toHaveProperty('todos');
    expect(result.current).toHaveProperty('allTodos');
    expect(result.current).toHaveProperty('filter');
    expect(result.current).toHaveProperty('stats');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('isIdle');
    expect(result.current).toHaveProperty('hasError');
    expect(result.current).toHaveProperty('error');
  });

  it('should handle function calls without errors', async () => {
    const { result } = renderHook(() => useTodoViewModel(), {
      wrapper: createWrapper()
    });

    // These should not throw errors even if they don't do much in test
    expect(() => result.current.changeFilter('active')).not.toThrow();
    expect(() => result.current.dismissError()).not.toThrow();
    expect(() => result.current.refreshTodos()).not.toThrow();
  });

  describe('Error handling branches', () => {
    it('should handle createTodo error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const testError = new Error('Create failed');
      
      // Mock dispatch to return correct structure with failing unwrap
      mockDispatch.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue(testError)
      });

      const { result } = renderHook(() => useTodoViewModel(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        try {
          await result.current.createTodo('Test todo');
          // Should not reach here
          expect(true).toBe(false);
        } catch (error) {
          expect(error).toBe(testError);
        }
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create todo:', testError);
      consoleErrorSpy.mockRestore();
    });

    it('should handle updateTodo error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const testError = new Error('Update failed');
      
      mockDispatch.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue(testError)
      });

      const { result } = renderHook(() => useTodoViewModel(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        try {
          await result.current.updateTodo(1, { title: 'Updated' });
          expect(true).toBe(false);
        } catch (error) {
          expect(error).toBe(testError);
        }
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to update todo:', testError);
      consoleErrorSpy.mockRestore();
    });

    it('should handle deleteTodo error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const testError = new Error('Delete failed');
      
      mockDispatch.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue(testError)
      });

      const { result } = renderHook(() => useTodoViewModel(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        try {
          await result.current.deleteTodo(1);
          expect(true).toBe(false);
        } catch (error) {
          expect(error).toBe(testError);
        }
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to delete todo:', testError);
      consoleErrorSpy.mockRestore();
    });

    it('should handle toggleTodo error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const testError = new Error('Toggle failed');
      
      mockDispatch.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue(testError)
      });

      const { result } = renderHook(() => useTodoViewModel(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        try {
          await result.current.toggleTodo(1);
          expect(true).toBe(false);
        } catch (error) {
          expect(error).toBe(testError);
        }
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to toggle todo:', testError);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Success paths', () => {
    it('should handle successful async operations', async () => {
      const { result } = renderHook(() => useTodoViewModel(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await expect(result.current.createTodo('Test')).resolves.not.toThrow();
        await expect(result.current.updateTodo(1, { title: 'Updated' })).resolves.not.toThrow();
        await expect(result.current.deleteTodo(1)).resolves.not.toThrow();
        await expect(result.current.toggleTodo(1)).resolves.not.toThrow();
      });

      expect(mockDispatch).toHaveBeenCalled();
    });
  });
});