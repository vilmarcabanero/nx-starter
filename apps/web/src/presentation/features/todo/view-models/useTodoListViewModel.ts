import { useCallback, useMemo } from 'react';
import { useTodoStore } from '../../../../infrastructure/state/TodoStore';
import type { TodoListViewModel } from './interfaces/TodoViewModels';

/**
 * View Model for Todo List component
 * Handles list-specific presentation logic
 */
export const useTodoListViewModel = (): TodoListViewModel => {
  const store = useTodoStore();

  const todos = useMemo(() => {
    return store.getFilteredTodos();
  }, [store]);

  const setFilter = useCallback(
    (filter: 'all' | 'active' | 'completed') => {
      store.setFilter(filter);
    },
    [store]
  );

  const refreshTodos = useCallback(async () => {
    await store.loadTodos();
  }, [store]);

  return {
    todos,
    filter: store.filter,
    isLoading: store.getIsLoading(),
    error: store.error,
    setFilter,
    refreshTodos,
  };
};
