import { useMemo, useCallback, useState } from 'react';
import { useTodoStore } from '../../../../infrastructure/state/TodoStore';
import type { TodoStatsViewModel } from './interfaces/TodoViewModels';

/**
 * View Model for Todo Statistics component
 * Handles stats-specific presentation logic and filter management
 */
export const useTodoStatsViewModel = (): TodoStatsViewModel => {
  const store = useTodoStore();
  const [currentFilter, setCurrentFilter] = useState<
    'all' | 'active' | 'completed'
  >('all');

  const stats = useMemo(() => {
    const basicStats = store.getStats();
    const overdue = store.todos.filter((todo) => {
      if (todo.completed) return false;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return todo.createdAt < sevenDaysAgo;
    }).length;

    const highPriority = store.todos.filter(
      (todo) => !todo.completed && todo.priority?.level === 'high'
    ).length;

    return {
      ...basicStats,
      overdue,
      highPriority,
    };
  }, [store]);

  const refreshStats = useCallback(async () => {
    await store.loadTodos();
  }, [store]);

  const handleFilterChange = useCallback(
    (value: string) => {
      if (value === 'all' || value === 'active' || value === 'completed') {
        setCurrentFilter(value);
        // Notify the store about filter change so other components can react
        store.setFilter(value);
      }
    },
    [store]
  );

  const validateFilterValue = useCallback(
    (value: string): value is 'all' | 'active' | 'completed' => {
      return value === 'all' || value === 'active' || value === 'completed';
    },
    []
  );

  return {
    stats,
    isLoading: store.getIsLoading(),
    currentFilter,
    refreshStats,
    handleFilterChange,
    validateFilterValue,
  };
};
