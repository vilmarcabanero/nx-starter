import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTodoViewModel } from '../presentation/view-models/useTodoViewModel';
import { Todo } from '../core/domain/entities/Todo';

// Mock the Zustand store
const mockStore = {
  todos: [] as Todo[],
  filter: 'all' as const,
  status: 'idle' as const,
  error: null,
  
  // Function-based getters
  getFilteredTodos: vi.fn(() => []),
  getStats: vi.fn(() => ({ total: 0, active: 0, completed: 0 })),
  getIsLoading: vi.fn(() => false),
  getIsIdle: vi.fn(() => true),
  getHasError: vi.fn(() => false),
  
  // Actions
  loadTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
  toggleTodo: vi.fn(),
  setFilter: vi.fn(),
  clearError: vi.fn(),
};

vi.mock('../core/application/stores/TodoStore', () => ({
  useTodoStore: () => mockStore
}));

describe('useTodoViewModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock store state
    mockStore.todos = [];
    mockStore.filter = 'all';
    mockStore.status = 'idle';
    mockStore.error = null;
    
    // Reset function-based getters
    mockStore.getFilteredTodos.mockReturnValue([]);
    mockStore.getStats.mockReturnValue({ total: 0, active: 0, completed: 0 });
    mockStore.getIsLoading.mockReturnValue(false);
    mockStore.getIsIdle.mockReturnValue(true);
    mockStore.getHasError.mockReturnValue(false);
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useTodoViewModel());

    expect(result.current.todos).toEqual([]);
    expect(result.current.filter).toBe('all');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.stats).toEqual({ total: 0, active: 0, completed: 0, overdue: 0 });
  });

  it('should call createTodo with correct data', async () => {
    const { result } = renderHook(() => useTodoViewModel());

    await act(async () => {
      await result.current.createTodo('New Todo');
    });

    expect(mockStore.createTodo).toHaveBeenCalledWith({ title: 'New Todo' });
  });

  it('should call updateTodo with correct parameters', async () => {
    const { result } = renderHook(() => useTodoViewModel());
    const changes = { title: 'Updated Title' };

    await act(async () => {
      await result.current.updateTodo(1, changes);
    });

    expect(mockStore.updateTodo).toHaveBeenCalledWith(1, changes);
  });

  it('should call deleteTodo with correct id', async () => {
    const { result } = renderHook(() => useTodoViewModel());

    await act(async () => {
      await result.current.deleteTodo(1);
    });

    expect(mockStore.deleteTodo).toHaveBeenCalledWith(1);
  });

  it('should call toggleTodo with correct id', async () => {
    const { result } = renderHook(() => useTodoViewModel());

    await act(async () => {
      await result.current.toggleTodo(1);
    });

    expect(mockStore.toggleTodo).toHaveBeenCalledWith(1);
  });

  it('should call changeFilter with correct filter', () => {
    const { result } = renderHook(() => useTodoViewModel());

    act(() => {
      result.current.changeFilter('active');
    });

    expect(mockStore.setFilter).toHaveBeenCalledWith('active');
  });

  it('should call clearError', () => {
    const { result } = renderHook(() => useTodoViewModel());

    act(() => {
      result.current.dismissError();
    });

    expect(mockStore.clearError).toHaveBeenCalled();
  });

  it('should call loadTodos on refresh', () => {
    const { result } = renderHook(() => useTodoViewModel());

    act(() => {
      result.current.refreshTodos();
    });

    expect(mockStore.loadTodos).toHaveBeenCalled();
  });

  it('should handle empty title error', async () => {
    const { result } = renderHook(() => useTodoViewModel());

    await expect(result.current.createTodo('')).rejects.toThrow('Todo title cannot be empty');
    await expect(result.current.createTodo('   ')).rejects.toThrow('Todo title cannot be empty');
  });

  describe('overdue calculation', () => {
    it('should calculate overdue todos correctly', () => {
      const now = new Date();
      const eightDaysAgo = new Date();
      eightDaysAgo.setDate(now.getDate() - 8);
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(now.getDate() - 5);
      
      const todos = [
        new Todo('Old incomplete todo', false, eightDaysAgo, 1),
        new Todo('Old completed todo', true, eightDaysAgo, 2),
        new Todo('Recent todo', false, fiveDaysAgo, 3),
      ];

      mockStore.todos = todos;
      mockStore.getStats.mockReturnValue({ total: 3, active: 2, completed: 1 });

      const { result } = renderHook(() => useTodoViewModel());

      // Only the old incomplete todo should be overdue
      expect(result.current.stats.overdue).toBe(1);
      expect(result.current.stats.total).toBe(3);
      expect(result.current.stats.active).toBe(2);
      expect(result.current.stats.completed).toBe(1);
    });

    it('should exclude completed todos from overdue calculation', () => {
      const eightDaysAgo = new Date();
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
      
      const todos = [
        new Todo('Old completed todo', true, eightDaysAgo, 1),
        new Todo('Another old completed todo', true, eightDaysAgo, 2),
      ];

      mockStore.todos = todos;
      mockStore.getStats.mockReturnValue({ total: 2, active: 0, completed: 2 });

      const { result } = renderHook(() => useTodoViewModel());

      // No todos should be overdue since all are completed
      expect(result.current.stats.overdue).toBe(0);
    });

    it('should include todos older than 7 days in overdue calculation', () => {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      const eightDaysAgo = new Date();
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
      
      const todos = [
        new Todo('Very old todo', false, tenDaysAgo, 1),
        new Todo('Old todo', false, eightDaysAgo, 2),
      ];

      mockStore.todos = todos;
      mockStore.getStats.mockReturnValue({ total: 2, active: 2, completed: 0 });

      const { result } = renderHook(() => useTodoViewModel());

      // Both todos should be overdue
      expect(result.current.stats.overdue).toBe(2);
    });
  });

  describe('error handling', () => {
    it('should handle createTodo errors and log them', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Network error');
      mockStore.createTodo.mockRejectedValue(error);

      const { result } = renderHook(() => useTodoViewModel());

      await expect(result.current.createTodo('Test Todo')).rejects.toThrow('Network error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create todo:', error);
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle updateTodo errors and log them', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Update failed');
      mockStore.updateTodo.mockRejectedValue(error);

      const { result } = renderHook(() => useTodoViewModel());

      await expect(result.current.updateTodo(1, { title: 'Updated' })).rejects.toThrow('Update failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to update todo:', error);
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle deleteTodo errors and log them', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Delete failed');
      mockStore.deleteTodo.mockRejectedValue(error);

      const { result } = renderHook(() => useTodoViewModel());

      await expect(result.current.deleteTodo(1)).rejects.toThrow('Delete failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to delete todo:', error);
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle toggleTodo errors and log them', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Toggle failed');
      mockStore.toggleTodo.mockRejectedValue(error);

      const { result } = renderHook(() => useTodoViewModel());

      await expect(result.current.toggleTodo(1)).rejects.toThrow('Toggle failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to toggle todo:', error);
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('initial loading', () => {
    it('should load todos only once on mount', () => {
      const { rerender } = renderHook(() => useTodoViewModel());
      
      expect(mockStore.loadTodos).toHaveBeenCalledTimes(1);
      
      // Rerender the hook
      rerender();
      
      // Should still only be called once
      expect(mockStore.loadTodos).toHaveBeenCalledTimes(1);
    });
  });

  describe('isIdle state', () => {
    it('should be true when not loading and no todos exist', () => {
      mockStore.getIsLoading.mockReturnValue(false);
      mockStore.todos = [];

      const { result } = renderHook(() => useTodoViewModel());

      expect(result.current.isIdle).toBe(true);
    });

    it('should be false when not loading but todos exist', () => {
      mockStore.getIsLoading.mockReturnValue(false);
      mockStore.todos = [new Todo('Test', false, new Date(), 1)];

      const { result } = renderHook(() => useTodoViewModel());

      expect(result.current.isIdle).toBe(false);
    });

    it('should be false when loading regardless of todos', () => {
      mockStore.getIsLoading.mockReturnValue(true);
      mockStore.todos = [];

      const { result } = renderHook(() => useTodoViewModel());

      expect(result.current.isIdle).toBe(false);
    });
  });
});
