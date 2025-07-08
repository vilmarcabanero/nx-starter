import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { 
  fetchTodosThunk, 
  createTodoThunk, 
  updateTodoThunk, 
  deleteTodoThunk,
  toggleTodoThunk
} from '../../core/application/todos/thunks';
import { 
  selectTodos, 
  selectFilteredTodos, 
  setFilter, 
  clearError 
} from '../../core/application/todos/slice';
import { Todo } from '../../core/domain/entities/Todo';

export const useTodoViewModel = () => {
  const dispatch = useAppDispatch();
  const { todos, status, error, filter } = useAppSelector(selectTodos);
  const filteredTodos = useAppSelector(selectFilteredTodos);

  // Load todos on mount
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTodosThunk());
    }
  }, [dispatch, status]);

  const createTodo = async (title: string) => {
    try {
      await dispatch(createTodoThunk(title)).unwrap();
    } catch (error) {
      console.error('Failed to create todo:', error);
      throw error;
    }
  };

  const updateTodo = async (id: number, changes: Partial<Todo>) => {
    try {
      await dispatch(updateTodoThunk({ id, changes })).unwrap();
    } catch (error) {
      console.error('Failed to update todo:', error);
      throw error;
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      await dispatch(deleteTodoThunk(id)).unwrap();
    } catch (error) {
      console.error('Failed to delete todo:', error);
      throw error;
    }
  };

  const toggleTodo = async (id: number) => {
    try {
      await dispatch(toggleTodoThunk(id)).unwrap();
    } catch (error) {
      console.error('Failed to toggle todo:', error);
      throw error;
    }
  };

  const changeFilter = (newFilter: 'all' | 'active' | 'completed') => {
    dispatch(setFilter(newFilter));
  };

  const dismissError = () => {
    dispatch(clearError());
  };

  const refreshTodos = () => {
    dispatch(fetchTodosThunk());
  };

  // Computed values
  const stats = {
    total: todos.length,
    active: todos.filter(todo => !todo.completed).length,
    completed: todos.filter(todo => todo.completed).length,
  };

  return {
    // Data
    todos: filteredTodos,
    allTodos: todos,
    filter,
    stats,
    
    // State
    isLoading: status === 'loading',
    isIdle: status === 'idle',
    hasError: !!error,
    error,
    
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
