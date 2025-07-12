import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTodoViewModel } from './useTodoViewModel';

// Mock the Zustand store
const mockStore = {
  filter: 'all' as 'all' | 'active' | 'completed',
  error: null as string | null,
  
  // Function-based getters
  getIsLoading: vi.fn(() => false),
  
  // Actions
  loadTodos: vi.fn(),
  setFilter: vi.fn(),
  clearError: vi.fn(),
};

vi.mock('../../../../core/infrastructure/todo/state/TodoStore', () => ({
  useTodoStore: () => mockStore
}));

describe('useTodoViewModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock store state
    mockStore.filter = 'all';
    mockStore.error = null;
    
    // Reset function-based getters
    mockStore.getIsLoading.mockReturnValue(false);
  });

  describe('initial state', () => {
    it('should return initial state', () => {
      const { result } = renderHook(() => useTodoViewModel());

      expect(result.current.filter).toBe('all');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.hasError).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should detect error state correctly', () => {
      mockStore.error = 'Test error';
      
      const { result } = renderHook(() => useTodoViewModel());

      expect(result.current.hasError).toBe(true);
      expect(result.current.error).toBe('Test error');
    });

    it('should detect loading state correctly', () => {
      mockStore.getIsLoading.mockReturnValue(true);
      
      const { result } = renderHook(() => useTodoViewModel());

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('filter management', () => {
    it('should call setFilter when changing filter to active', () => {
      const { result } = renderHook(() => useTodoViewModel());

      act(() => {
        result.current.changeFilter('active');
      });

      expect(mockStore.setFilter).toHaveBeenCalledWith('active');
    });

    it('should call setFilter when changing filter to completed', () => {
      const { result } = renderHook(() => useTodoViewModel());

      act(() => {
        result.current.changeFilter('completed');
      });

      expect(mockStore.setFilter).toHaveBeenCalledWith('completed');
    });

    it('should call setFilter when changing filter back to all', () => {
      const { result } = renderHook(() => useTodoViewModel());

      act(() => {
        result.current.changeFilter('all');
      });

      expect(mockStore.setFilter).toHaveBeenCalledWith('all');
    });
  });

  describe('error handling', () => {
    it('should call clearError when dismissing error', () => {
      const { result } = renderHook(() => useTodoViewModel());

      act(() => {
        result.current.dismissError();
      });

      expect(mockStore.clearError).toHaveBeenCalled();
    });
  });

  describe('data management', () => {
    it('should call loadTodos when refreshing', () => {
      const { result } = renderHook(() => useTodoViewModel());

      act(() => {
        result.current.refreshTodos();
      });

      expect(mockStore.loadTodos).toHaveBeenCalled();
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

    it('should load todos immediately on first mount', () => {
      renderHook(() => useTodoViewModel());
      
      expect(mockStore.loadTodos).toHaveBeenCalledWith();
    });
  });

  describe('state reactivity', () => {
    it('should reflect store filter changes', () => {
      const { result, rerender } = renderHook(() => useTodoViewModel());

      expect(result.current.filter).toBe('all');

      // Simulate store filter change
      mockStore.filter = 'active';
      rerender();

      expect(result.current.filter).toBe('active');
    });

    it('should reflect store error changes', () => {
      const { result, rerender } = renderHook(() => useTodoViewModel());

      expect(result.current.hasError).toBe(false);
      expect(result.current.error).toBe(null);

      // Simulate store error change
      mockStore.error = 'Network error';
      rerender();

      expect(result.current.hasError).toBe(true);
      expect(result.current.error).toBe('Network error');
    });

    it('should reflect store loading state changes', () => {
      const { result, rerender } = renderHook(() => useTodoViewModel());

      expect(result.current.isLoading).toBe(false);

      // Simulate store loading state change
      mockStore.getIsLoading.mockReturnValue(true);
      rerender();

      expect(result.current.isLoading).toBe(true);
    });
  });
});