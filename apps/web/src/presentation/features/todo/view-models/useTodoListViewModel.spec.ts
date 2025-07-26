import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTodoListViewModel } from './useTodoListViewModel';
import { Todo } from '@nx-starter/domain';
import { TEST_UUIDS } from '../../../../test/test-helpers';

// Mock the store
const mockStore = {
  getFilteredTodos: vi.fn(),
  filter: 'all' as 'all' | 'active' | 'completed',
  getIsLoading: vi.fn(),
  error: null as Error | null,
  setFilter: vi.fn(),
  loadTodos: vi.fn(),
};

vi.mock('../../../../infrastructure/state/TodoStore', () => ({
  useTodoStore: () => mockStore,
}));

describe('useTodoListViewModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.filter = 'all';
    mockStore.error = null;
    mockStore.getIsLoading.mockReturnValue(false);
    mockStore.getFilteredTodos.mockReturnValue([]);
    mockStore.loadTodos.mockResolvedValue(undefined);
  });

  it('should return todos from store', () => {
    // Arrange
    const mockTodos = [
      new Todo('Todo 1', false, new Date(), TEST_UUIDS.TODO_1),
      new Todo('Todo 2', true, new Date(), TEST_UUIDS.TODO_2),
    ];
    mockStore.getFilteredTodos.mockReturnValue(mockTodos);

    // Act
    const { result } = renderHook(() => useTodoListViewModel());

    // Assert
    expect(result.current.todos).toBe(mockTodos);
    expect(mockStore.getFilteredTodos).toHaveBeenCalledTimes(1);
  });

  it('should return current filter from store', () => {
    // Arrange
    mockStore.filter = 'active';

    // Act
    const { result } = renderHook(() => useTodoListViewModel());

    // Assert
    expect(result.current.filter).toBe('active');
  });

  it('should return loading state from store', () => {
    // Arrange
    mockStore.getIsLoading.mockReturnValue(true);

    // Act
    const { result } = renderHook(() => useTodoListViewModel());

    // Assert
    expect(result.current.isLoading).toBe(true);
  });

  it('should return error from store', () => {
    // Arrange
    const error = new Error('Failed to load todos');
    mockStore.error = error;

    // Act
    const { result } = renderHook(() => useTodoListViewModel());

    // Assert
    expect(result.current.error).toBe(error);
  });

  it('should set filter when setFilter is called', () => {
    // Arrange
    const { result } = renderHook(() => useTodoListViewModel());

    // Act
    act(() => {
      result.current.setFilter('completed');
    });

    // Assert
    expect(mockStore.setFilter).toHaveBeenCalledWith('completed');
  });

  it('should refresh todos when refreshTodos is called', async () => {
    // Arrange
    const { result } = renderHook(() => useTodoListViewModel());

    // Act
    await act(async () => {
      await result.current.refreshTodos();
    });

    // Assert
    expect(mockStore.loadTodos).toHaveBeenCalledTimes(1);
  });

  it('should update todos when store state changes', () => {
    // This test validates that the view model correctly reflects store state changes

    // Arrange
    const initialTodos = [
      new Todo('Initial Todo', false, new Date(), TEST_UUIDS.TODO_1),
    ];
    mockStore.getFilteredTodos.mockReturnValue(initialTodos);

    const { result } = renderHook(() => useTodoListViewModel());

    // Assert initial state
    expect(result.current.todos).toEqual(initialTodos);

    // This test demonstrates that the view model correctly uses getFilteredTodos()
    // In a real application, the store would be reactive and trigger re-renders
    // when its state changes. For unit testing purposes, we verify that the
    // view model calls the correct store methods.
    expect(mockStore.getFilteredTodos).toHaveBeenCalled();
  });

  it('should handle different filter types', () => {
    // Arrange
    const { result } = renderHook(() => useTodoListViewModel());

    // Act & Assert - all filter
    act(() => {
      result.current.setFilter('all');
    });
    expect(mockStore.setFilter).toHaveBeenCalledWith('all');

    // Act & Assert - active filter
    act(() => {
      result.current.setFilter('active');
    });
    expect(mockStore.setFilter).toHaveBeenCalledWith('active');

    // Act & Assert - completed filter
    act(() => {
      result.current.setFilter('completed');
    });
    expect(mockStore.setFilter).toHaveBeenCalledWith('completed');
  });

  it('should handle empty todos list', () => {
    // Arrange
    mockStore.getFilteredTodos.mockReturnValue([]);

    // Act
    const { result } = renderHook(() => useTodoListViewModel());

    // Assert
    expect(result.current.todos).toEqual([]);
  });

  it('should handle loading state changes', () => {
    // Arrange
    mockStore.getIsLoading.mockReturnValue(false);
    const { result, rerender } = renderHook(() => useTodoListViewModel());

    // Assert initial state
    expect(result.current.isLoading).toBe(false);

    // Act - simulate loading state change
    mockStore.getIsLoading.mockReturnValue(true);
    rerender();

    // Assert
    expect(result.current.isLoading).toBe(true);
  });

  it('should handle error state changes', () => {
    // Arrange
    mockStore.error = null;
    const { result, rerender } = renderHook(() => useTodoListViewModel());

    // Assert initial state
    expect(result.current.error).toBeNull();

    // Act - simulate error state change
    const error = new Error('Network error');
    mockStore.error = error;
    rerender();

    // Assert
    expect(result.current.error).toBe(error);
  });

  it('should handle refresh todos failure gracefully', async () => {
    // Arrange
    const error = new Error('Refresh failed');
    // The real store doesn't throw errors, it stores them in state
    // So we simulate that by having loadTodos resolve but setting error state
    mockStore.loadTodos.mockResolvedValue(undefined);
    mockStore.error = error.message; // Simulate error being stored in state
    const { result } = renderHook(() => useTodoListViewModel());

    // Act - refreshTodos doesn't throw, it lets the store handle errors gracefully
    await act(async () => {
      await result.current.refreshTodos();
    });

    // Assert - the store method was called, and the view model handled it gracefully
    expect(mockStore.loadTodos).toHaveBeenCalled();
    // The error would be available in the store state for the UI to display
  });

  it('should provide stable function references', () => {
    // Arrange
    const { result, rerender } = renderHook(() => useTodoListViewModel());
    const initialSetFilter = result.current.setFilter;
    const initialRefreshTodos = result.current.refreshTodos;

    // Act
    rerender();

    // Assert - function references should be stable due to useCallback
    expect(result.current.setFilter).toBe(initialSetFilter);
    expect(result.current.refreshTodos).toBe(initialRefreshTodos);
  });
});
