import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTodoViewModel } from './useTodoViewModel';

// Mock the Zustand store
const mockStore = {
  loadTodos: vi.fn(),
};

vi.mock('../../../../infrastructure/state/TodoStore', () => ({
  useTodoStore: () => mockStore,
}));

describe('useTodoViewModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty object', () => {
    const { result } = renderHook(() => useTodoViewModel());

    expect(result.current).toEqual({});
  });

  it('should load todos on mount', () => {
    renderHook(() => useTodoViewModel());

    expect(mockStore.loadTodos).toHaveBeenCalledTimes(1);
  });

  it('should only load todos once on multiple renders', () => {
    const { rerender } = renderHook(() => useTodoViewModel());

    expect(mockStore.loadTodos).toHaveBeenCalledTimes(1);

    // Rerender the hook multiple times
    rerender();
    rerender();
    rerender();

    // Should still only be called once due to ref guard
    expect(mockStore.loadTodos).toHaveBeenCalledTimes(1);
  });
});
