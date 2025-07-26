import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTodoStatsViewModel } from './useTodoStatsViewModel';
import { Todo } from '@nx-starter/domain';
import { TEST_UUIDS, generateTestUuid } from '../../../../test/test-helpers';

// Mock the store
const mockStore = {
  getStats: vi.fn(),
  todos: [] as Todo[],
  getIsLoading: vi.fn(),
  loadTodos: vi.fn(),
  setFilter: vi.fn(),
  error: null as string | null,
};

vi.mock('../../../../infrastructure/state/TodoStore', () => ({
  useTodoStore: () => mockStore,
}));

describe('useTodoStatsViewModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.getIsLoading.mockReturnValue(false);
    mockStore.getStats.mockReturnValue({ total: 0, active: 0, completed: 0 });
    mockStore.todos = [];
    mockStore.loadTodos.mockResolvedValue(undefined);
  });

  it('should return basic stats from store', () => {
    // Arrange
    const basicStats = { total: 5, active: 3, completed: 2 };
    mockStore.getStats.mockReturnValue(basicStats);

    // Act
    const { result } = renderHook(() => useTodoStatsViewModel());

    // Assert
    expect(result.current.stats.total).toBe(5);
    expect(result.current.stats.active).toBe(3);
    expect(result.current.stats.completed).toBe(2);
  });

  it('should calculate overdue todos', () => {
    // Arrange
    const now = new Date();
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(now.getDate() - 8);
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(now.getDate() - 6);

    mockStore.todos = [
      new Todo('Overdue Todo', false, eightDaysAgo, TEST_UUIDS.TODO_1), // Should be overdue
      new Todo('Recent Todo', false, sixDaysAgo, TEST_UUIDS.TODO_2), // Should not be overdue
      new Todo('Completed Old Todo', true, eightDaysAgo, TEST_UUIDS.TODO_3), // Completed, not overdue
    ];
    mockStore.getStats.mockReturnValue({ total: 3, active: 2, completed: 1 });

    // Act
    const { result } = renderHook(() => useTodoStatsViewModel());

    // Assert
    expect(result.current.stats.overdue).toBe(1);
  });

  it('should calculate high priority todos', () => {
    // Arrange
    mockStore.todos = [
      new Todo(
        'High Priority Active',
        false,
        new Date(),
        TEST_UUIDS.TODO_1,
        'high'
      ), // Should count
      new Todo(
        'High Priority Completed',
        true,
        new Date(),
        TEST_UUIDS.TODO_2,
        'high'
      ), // Should not count (completed)
      new Todo(
        'Medium Priority Active',
        false,
        new Date(),
        TEST_UUIDS.TODO_3,
        'medium'
      ), // Should not count
      new Todo(
        'Low Priority Active',
        false,
        new Date(),
        TEST_UUIDS.TODO_4,
        'low'
      ), // Should not count
    ];
    mockStore.getStats.mockReturnValue({ total: 4, active: 3, completed: 1 });

    // Act
    const { result } = renderHook(() => useTodoStatsViewModel());

    // Assert
    expect(result.current.stats.highPriority).toBe(1);
  });

  it('should return loading state from store', () => {
    // Arrange
    mockStore.getIsLoading.mockReturnValue(true);

    // Act
    const { result } = renderHook(() => useTodoStatsViewModel());

    // Assert
    expect(result.current.isLoading).toBe(true);
  });

  it('should have initial filter as "all"', () => {
    // Act
    const { result } = renderHook(() => useTodoStatsViewModel());

    // Assert
    expect(result.current.currentFilter).toBe('all');
  });

  it('should refresh stats when refreshStats is called', async () => {
    // Arrange
    const { result } = renderHook(() => useTodoStatsViewModel());

    // Act
    await act(async () => {
      await result.current.refreshStats();
    });

    // Assert
    expect(mockStore.loadTodos).toHaveBeenCalledTimes(1);
  });

  it('should handle filter change for valid filter values', () => {
    // Arrange
    const { result } = renderHook(() => useTodoStatsViewModel());

    // Act - change to active filter
    act(() => {
      result.current.handleFilterChange('active');
    });

    // Assert
    expect(result.current.currentFilter).toBe('active');
    expect(mockStore.setFilter).toHaveBeenCalledWith('active');
  });

  it('should handle filter change for completed filter', () => {
    // Arrange
    const { result } = renderHook(() => useTodoStatsViewModel());

    // Act
    act(() => {
      result.current.handleFilterChange('completed');
    });

    // Assert
    expect(result.current.currentFilter).toBe('completed');
    expect(mockStore.setFilter).toHaveBeenCalledWith('completed');
  });

  it('should handle filter change back to all', () => {
    // Arrange
    const { result } = renderHook(() => useTodoStatsViewModel());

    // Act - change to active first
    act(() => {
      result.current.handleFilterChange('active');
    });

    // Act - change back to all
    act(() => {
      result.current.handleFilterChange('all');
    });

    // Assert
    expect(result.current.currentFilter).toBe('all');
    expect(mockStore.setFilter).toHaveBeenCalledWith('all');
  });

  it('should ignore invalid filter values', () => {
    // Arrange
    const { result } = renderHook(() => useTodoStatsViewModel());
    const initialFilter = result.current.currentFilter;

    // Act
    act(() => {
      result.current.handleFilterChange('invalid');
    });

    // Assert - filter should not change
    expect(result.current.currentFilter).toBe(initialFilter);
    expect(mockStore.setFilter).not.toHaveBeenCalledWith('invalid');
  });

  it('should validate filter values correctly', () => {
    // Arrange
    const { result } = renderHook(() => useTodoStatsViewModel());

    // Act & Assert
    expect(result.current.validateFilterValue('all')).toBe(true);
    expect(result.current.validateFilterValue('active')).toBe(true);
    expect(result.current.validateFilterValue('completed')).toBe(true);
    expect(result.current.validateFilterValue('invalid')).toBe(false);
    expect(result.current.validateFilterValue('')).toBe(false);
    expect(result.current.validateFilterValue('ALL')).toBe(false); // Case sensitive
  });

  it('should calculate complex stats correctly', () => {
    // Arrange
    const now = new Date();
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(now.getDate() - 10);

    mockStore.todos = [
      new Todo(
        'Active High Priority',
        false,
        new Date(),
        TEST_UUIDS.TODO_1,
        'high'
      ),
      new Todo(
        'Active Medium Priority',
        false,
        new Date(),
        TEST_UUIDS.TODO_2,
        'medium'
      ),
      new Todo(
        'Completed High Priority',
        true,
        new Date(),
        TEST_UUIDS.TODO_3,
        'high'
      ),
      new Todo(
        'Overdue Low Priority',
        false,
        tenDaysAgo,
        TEST_UUIDS.TODO_4,
        'low'
      ),
      new Todo(
        'Overdue High Priority',
        false,
        tenDaysAgo,
        TEST_UUIDS.TODO_5,
        'high'
      ),
    ];
    mockStore.getStats.mockReturnValue({ total: 5, active: 4, completed: 1 });

    // Act
    const { result } = renderHook(() => useTodoStatsViewModel());

    // Assert
    expect(result.current.stats.total).toBe(5);
    expect(result.current.stats.active).toBe(4);
    expect(result.current.stats.completed).toBe(1);
    expect(result.current.stats.overdue).toBe(2); // 2 overdue todos (both old and incomplete)
    expect(result.current.stats.highPriority).toBe(2); // 2 high priority active todos
  });

  it('should handle empty todos list', () => {
    // Arrange
    mockStore.todos = [];
    mockStore.getStats.mockReturnValue({ total: 0, active: 0, completed: 0 });

    // Act
    const { result } = renderHook(() => useTodoStatsViewModel());

    // Assert
    expect(result.current.stats.total).toBe(0);
    expect(result.current.stats.active).toBe(0);
    expect(result.current.stats.completed).toBe(0);
    expect(result.current.stats.overdue).toBe(0);
    expect(result.current.stats.highPriority).toBe(0);
  });

  it('should handle refresh stats failure gracefully', async () => {
    // Arrange
    const error = new Error('Refresh failed');
    // The real store doesn't throw errors, it stores them in state
    // So we simulate that by having loadTodos resolve but setting error state
    mockStore.loadTodos.mockResolvedValue(undefined);
    mockStore.error = error.message; // Simulate error being stored in state
    const { result } = renderHook(() => useTodoStatsViewModel());

    // Act - refreshStats doesn't throw, it lets the store handle errors gracefully
    await act(async () => {
      await result.current.refreshStats();
    });

    // Assert - the store method was called, and the view model handled it gracefully
    expect(mockStore.loadTodos).toHaveBeenCalled();
    // The error would be available in the store state for the UI to display
  });

  it('should calculate stats based on current store state', () => {
    // This test validates that the view model correctly calculates derived stats
    // from the store's todos and basic stats

    // Arrange - setup store with high priority todo
    const todosWithHighPriority = [
      new Todo(
        'High Priority Todo',
        false,
        new Date(),
        generateTestUuid(6),
        'high'
      ),
    ];
    mockStore.todos = todosWithHighPriority;
    mockStore.getStats.mockReturnValue({ total: 1, active: 1, completed: 0 });

    const { result } = renderHook(() => useTodoStatsViewModel());

    // Assert - the view model should calculate derived stats correctly
    expect(result.current.stats.total).toBe(1);
    expect(result.current.stats.highPriority).toBe(1); // One high priority todo
    expect(result.current.stats.overdue).toBe(0); // Recent todo, not overdue

    // Verify store methods were called
    expect(mockStore.getStats).toHaveBeenCalled();
  });

  it('should provide stable function references', () => {
    // Arrange
    const { result, rerender } = renderHook(() => useTodoStatsViewModel());
    const initialRefreshStats = result.current.refreshStats;
    const initialHandleFilterChange = result.current.handleFilterChange;
    const initialValidateFilterValue = result.current.validateFilterValue;

    // Act
    rerender();

    // Assert - function references should be stable due to useCallback
    expect(result.current.refreshStats).toBe(initialRefreshStats);
    expect(result.current.handleFilterChange).toBe(initialHandleFilterChange);
    expect(result.current.validateFilterValue).toBe(initialValidateFilterValue);
  });

  it('should handle todos with no priority', () => {
    // Arrange
    mockStore.todos = [
      new Todo('No Priority Todo', false, new Date(), generateTestUuid(7)), // No priority specified
    ];
    mockStore.getStats.mockReturnValue({ total: 1, active: 1, completed: 0 });

    // Act
    const { result } = renderHook(() => useTodoStatsViewModel());

    // Assert
    expect(result.current.stats.highPriority).toBe(0);
  });
});
