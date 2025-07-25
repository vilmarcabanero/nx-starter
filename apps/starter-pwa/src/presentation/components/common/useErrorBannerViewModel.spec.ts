import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useErrorBannerViewModel } from './useErrorBannerViewModel';
import { useTodoStore } from '../../../infrastructure/state/TodoStore';

// Mock the store
vi.mock('../../../infrastructure/state/TodoStore');

describe('useErrorBannerViewModel', () => {
  let mockStore: {
    error: string | null;
    clearError: ReturnType<typeof vi.fn>;
    loadTodos: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockStore = {
      error: null,
      clearError: vi.fn(),
      loadTodos: vi.fn(),
    };

    vi.mocked(useTodoStore).mockReturnValue(
      mockStore as unknown as ReturnType<typeof useTodoStore>
    );
  });

  describe('initial state', () => {
    it('should return hasError false when store has no error', () => {
      mockStore.error = null;

      const { result } = renderHook(() => useErrorBannerViewModel());

      expect(result.current.hasError).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should return hasError true when store has error', () => {
      mockStore.error = 'Network error occurred';

      const { result } = renderHook(() => useErrorBannerViewModel());

      expect(result.current.hasError).toBe(true);
      expect(result.current.error).toBe('Network error occurred');
    });

    it('should provide dismiss and retry functions', () => {
      const { result } = renderHook(() => useErrorBannerViewModel());

      expect(typeof result.current.dismiss).toBe('function');
      expect(typeof result.current.retry).toBe('function');
    });
  });

  describe('dismiss functionality', () => {
    it('should call store.clearError when dismiss is called', () => {
      const { result } = renderHook(() => useErrorBannerViewModel());

      act(() => {
        result.current.dismiss();
      });

      expect(mockStore.clearError).toHaveBeenCalledTimes(1);
    });

    it('should maintain dismiss function reference between renders', () => {
      const { result, rerender } = renderHook(() => useErrorBannerViewModel());

      const firstDismiss = result.current.dismiss;

      rerender();

      const secondDismiss = result.current.dismiss;
      expect(firstDismiss).toBe(secondDismiss);
    });

    it('should handle multiple dismiss calls', () => {
      const { result } = renderHook(() => useErrorBannerViewModel());

      act(() => {
        result.current.dismiss();
        result.current.dismiss();
        result.current.dismiss();
      });

      expect(mockStore.clearError).toHaveBeenCalledTimes(3);
    });
  });

  describe('retry functionality', () => {
    it('should call store.loadTodos when retry is called', () => {
      const { result } = renderHook(() => useErrorBannerViewModel());

      act(() => {
        result.current.retry();
      });

      expect(mockStore.loadTodos).toHaveBeenCalledTimes(1);
    });

    it('should maintain retry function reference between renders', () => {
      const { result, rerender } = renderHook(() => useErrorBannerViewModel());

      const firstRetry = result.current.retry;

      rerender();

      const secondRetry = result.current.retry;
      expect(firstRetry).toBe(secondRetry);
    });

    it('should handle multiple retry calls', () => {
      const { result } = renderHook(() => useErrorBannerViewModel());

      act(() => {
        result.current.retry();
        result.current.retry();
      });

      expect(mockStore.loadTodos).toHaveBeenCalledTimes(2);
    });
  });

  describe('error state changes', () => {
    it('should reflect error state changes from store', () => {
      const { result, rerender } = renderHook(() => useErrorBannerViewModel());

      // Initial state: no error
      expect(result.current.hasError).toBe(false);

      // Update store to have error
      mockStore.error = 'Connection failed';
      rerender();

      expect(result.current.hasError).toBe(true);
      expect(result.current.error).toBe('Connection failed');
    });

    it('should handle transition from error to no error', () => {
      // Start with error
      mockStore.error = 'Initial error';
      const { result, rerender } = renderHook(() => useErrorBannerViewModel());

      expect(result.current.hasError).toBe(true);
      expect(result.current.error).toBe('Initial error');

      // Clear error
      mockStore.error = null;
      rerender();

      expect(result.current.hasError).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle error message changes', () => {
      // Start with one error
      mockStore.error = 'First error';
      const { result, rerender } = renderHook(() => useErrorBannerViewModel());

      expect(result.current.error).toBe('First error');

      // Change error message
      mockStore.error = 'Second error';
      rerender();

      expect(result.current.error).toBe('Second error');
    });
  });

  describe('hasError logic', () => {
    it('should return false for empty string error', () => {
      mockStore.error = '';

      const { result } = renderHook(() => useErrorBannerViewModel());

      expect(result.current.hasError).toBe(false);
    });

    it('should return false for null error', () => {
      mockStore.error = null;

      const { result } = renderHook(() => useErrorBannerViewModel());

      expect(result.current.hasError).toBe(false);
    });

    it('should return false for undefined error', () => {
      mockStore.error = undefined as unknown as null;

      const { result } = renderHook(() => useErrorBannerViewModel());

      expect(result.current.hasError).toBe(false);
    });

    it('should return true for non-empty string error', () => {
      mockStore.error = 'Real error';

      const { result } = renderHook(() => useErrorBannerViewModel());

      expect(result.current.hasError).toBe(true);
    });

    it('should return true for whitespace-only error', () => {
      mockStore.error = '   ';

      const { result } = renderHook(() => useErrorBannerViewModel());

      expect(result.current.hasError).toBe(true);
    });
  });

  describe('function stability', () => {
    it('should maintain function references when error state changes', () => {
      const { result, rerender } = renderHook(() => useErrorBannerViewModel());

      const initialDismiss = result.current.dismiss;
      const initialRetry = result.current.retry;

      // Change error state
      mockStore.error = 'New error';
      rerender();

      expect(result.current.dismiss).toBe(initialDismiss);
      expect(result.current.retry).toBe(initialRetry);
    });

    it('should not create new functions on every render', () => {
      const { result, rerender } = renderHook(() => useErrorBannerViewModel());

      const functions1 = {
        dismiss: result.current.dismiss,
        retry: result.current.retry,
      };

      // Multiple re-renders
      rerender();
      rerender();
      rerender();

      const functions2 = {
        dismiss: result.current.dismiss,
        retry: result.current.retry,
      };

      expect(functions1.dismiss).toBe(functions2.dismiss);
      expect(functions1.retry).toBe(functions2.retry);
    });
  });

  describe('store interaction', () => {
    it('should work with different store instances', () => {
      const alternateStore = {
        error: 'Alternate error',
        clearError: vi.fn(),
        loadTodos: vi.fn(),
      };

      vi.mocked(useTodoStore).mockReturnValue(
        alternateStore as unknown as ReturnType<typeof useTodoStore>
      );

      const { result } = renderHook(() => useErrorBannerViewModel());

      expect(result.current.hasError).toBe(true);
      expect(result.current.error).toBe('Alternate error');

      act(() => {
        result.current.dismiss();
      });

      expect(alternateStore.clearError).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.retry();
      });

      expect(alternateStore.loadTodos).toHaveBeenCalledTimes(1);
    });

    it('should handle store method failures gracefully', () => {
      // Mock methods that throw errors
      mockStore.clearError = vi.fn().mockImplementation(() => {
        throw new Error('Clear error failed');
      });
      mockStore.loadTodos = vi.fn().mockImplementation(() => {
        throw new Error('Load todos failed');
      });

      const { result } = renderHook(() => useErrorBannerViewModel());

      // These should not crash the hook
      expect(() => {
        act(() => {
          result.current.dismiss();
        });
      }).toThrow('Clear error failed');

      expect(() => {
        act(() => {
          result.current.retry();
        });
      }).toThrow('Load todos failed');
    });
  });
});
