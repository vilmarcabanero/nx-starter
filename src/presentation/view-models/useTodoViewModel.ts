import { useEffect, useMemo, useCallback, useRef } from 'react';
import { useTodoStore } from '../../core/application/stores/TodoStore';
import type { Todo } from '../../core/domain/entities/Todo';

export const useTodoViewModel = () => {
  const store = useTodoStore();
  const hasLoadedInitially = useRef(false);

  // Get computed stats from store plus additional overdue calculation
  const stats = useMemo(() => {
    const basicStats = store.getStats();
    const overdue = store.todos.filter(todo => {
      if (todo.completed) return false;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return todo.createdAt < sevenDaysAgo;
    }).length;
    
    return {
      ...basicStats,
      overdue,
    };
  }, [store]);

  // Action handlers with error handling
  const createTodo = useCallback(async (title: string) => {
    if (!title.trim()) {
      throw new Error('Todo title cannot be empty');
    }

    try {
      await store.createTodo({ title: title.trim() });
    } catch (error) {
      console.error('Failed to create todo:', error);
      throw error;
    }
  }, [store]);

  const updateTodo = useCallback(async (id: number, changes: Partial<Todo>) => {
    try {
      await store.updateTodo(id, changes);
    } catch (error) {
      console.error('Failed to update todo:', error);
      throw error;
    }
  }, [store]);

  const deleteTodo = useCallback(async (id: number) => {
    try {
      await store.deleteTodo(id);
    } catch (error) {
      console.error('Failed to delete todo:', error);
      throw error;
    }
  }, [store]);

  const toggleTodo = useCallback(async (id: number) => {
    try {
      await store.toggleTodo(id);
    } catch (error) {
      console.error('Failed to toggle todo:', error);
      throw error;
    }
  }, [store]);

  const changeFilter = useCallback((newFilter: 'all' | 'active' | 'completed') => {
    store.setFilter(newFilter);
  }, [store]);

  const dismissError = useCallback(() => {
    store.clearError();
  }, [store]);

  const refreshTodos = useCallback(() => {
    store.loadTodos();
  }, [store]);

  // Load todos on mount
  useEffect(() => {
    if (!hasLoadedInitially.current) {
      hasLoadedInitially.current = true;
      store.loadTodos();
    }
  }, [store]);

  // Calculate filtered todos based on current filter
  const filteredTodos = useMemo(() => {
    return store.getFilteredTodos();
  }, [store]);

  return {
    // Data
    todos: filteredTodos,
    allTodos: store.todos,
    filter: store.filter,
    stats,

    // State
    isLoading: store.getIsLoading(),
    isIdle: !store.getIsLoading() && store.todos.length === 0,
    hasError: !!store.error,
    error: store.error,

    // Actions
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    changeFilter,
    dismissError,
    refreshTodos,
  };
};
