import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import todosReducer, { 
  setFilter, 
  clearError, 
  selectTodos, 
  selectFilteredTodos,
  type TodosState 
} from '../core/application/todos/slice';
import { 
  fetchTodosThunk, 
  createTodoThunk, 
  updateTodoThunk, 
  deleteTodoThunk,
  toggleTodoThunk 
} from '../core/application/todos/thunks';
import { Todo } from '../core/domain/entities/Todo';

// Create a mock store for testing
const createMockStore = (initialState?: Partial<TodosState>) => {
  const defaultState: TodosState = {
    todos: [],
    status: 'idle',
    error: null,
    filter: 'all',
  };
  
  return configureStore({
    reducer: {
      todos: todosReducer,
    },
    preloadedState: {
      todos: { ...defaultState, ...initialState },
    },
  });
};

describe('TodosSlice', () => {
  describe('reducers', () => {
    it('should handle setFilter', () => {
      const initialState: TodosState = {
        todos: [],
        status: 'idle',
        error: null,
        filter: 'all',
      };

      const state = todosReducer(initialState, setFilter('active'));
      expect(state.filter).toBe('active');
    });

    it('should handle clearError', () => {
      const initialState: TodosState = {
        todos: [],
        status: 'failed',
        error: 'Some error',
        filter: 'all',
      };

      const state = todosReducer(initialState, clearError());
      expect(state.error).toBeNull();
    });
  });

  describe('fetchTodosThunk extraReducers', () => {
    it('should handle pending state', () => {
      const initialState: TodosState = {
        todos: [],
        status: 'idle',
        error: null,
        filter: 'all',
      };

      const action = { type: fetchTodosThunk.pending.type };
      const state = todosReducer(initialState, action);

      expect(state.status).toBe('loading');
    });

    it('should handle fulfilled state', () => {
      const initialState: TodosState = {
        todos: [],
        status: 'loading',
        error: null,
        filter: 'all',
      };

      const mockTodos = [
        new Todo('Todo 1', false, new Date(), 1),
        new Todo('Todo 2', true, new Date(), 2),
      ];

      const action = { 
        type: fetchTodosThunk.fulfilled.type, 
        payload: mockTodos 
      };
      const state = todosReducer(initialState, action);

      expect(state.status).toBe('succeeded');
      expect(state.todos).toEqual(mockTodos);
    });

    it('should handle rejected state', () => {
      const initialState: TodosState = {
        todos: [],
        status: 'loading',
        error: null,
        filter: 'all',
      };

      const action = { 
        type: fetchTodosThunk.rejected.type, 
        error: { message: 'Failed to fetch' } 
      };
      const state = todosReducer(initialState, action);

      expect(state.status).toBe('failed');
      expect(state.error).toBe('Failed to fetch');
    });

    it('should handle rejected state with default error message', () => {
      const initialState: TodosState = {
        todos: [],
        status: 'loading',
        error: null,
        filter: 'all',
      };

      const action = { 
        type: fetchTodosThunk.rejected.type, 
        error: {} 
      };
      const state = todosReducer(initialState, action);

      expect(state.status).toBe('failed');
      expect(state.error).toBe('Failed to fetch todos');
    });
  });

  describe('createTodoThunk extraReducers', () => {
    it('should handle pending state', () => {
      const initialState: TodosState = {
        todos: [],
        status: 'idle',
        error: null,
        filter: 'all',
      };

      const action = { type: createTodoThunk.pending.type };
      const state = todosReducer(initialState, action);

      expect(state.status).toBe('loading');
    });

    it('should handle fulfilled state', () => {
      const existingTodos = [
        new Todo('Existing Todo', false, new Date(), 1),
      ];
      const initialState: TodosState = {
        todos: existingTodos,
        status: 'loading',
        error: null,
        filter: 'all',
      };

      const newTodo = new Todo('New Todo', false, new Date(), 2);
      const action = { 
        type: createTodoThunk.fulfilled.type, 
        payload: newTodo 
      };
      const state = todosReducer(initialState, action);

      expect(state.status).toBe('succeeded');
      expect(state.todos).toHaveLength(2);
      expect(state.todos[0]).toEqual(newTodo); // New todo should be at the beginning
    });

    it('should handle rejected state', () => {
      const initialState: TodosState = {
        todos: [],
        status: 'loading',
        error: null,
        filter: 'all',
      };

      const action = { 
        type: createTodoThunk.rejected.type, 
        error: { message: 'Failed to create' } 
      };
      const state = todosReducer(initialState, action);

      expect(state.status).toBe('failed');
      expect(state.error).toBe('Failed to create');
    });

    it('should handle rejected state with default error message', () => {
      const initialState: TodosState = {
        todos: [],
        status: 'loading',
        error: null,
        filter: 'all',
      };

      const action = { 
        type: createTodoThunk.rejected.type, 
        error: {} 
      };
      const state = todosReducer(initialState, action);

      expect(state.status).toBe('failed');
      expect(state.error).toBe('Failed to create todo');
    });
  });

  describe('updateTodoThunk extraReducers', () => {
    it('should handle fulfilled state', () => {
      const existingTodos = [
        new Todo('Todo 1', false, new Date(), 1),
        new Todo('Todo 2', false, new Date(), 2),
      ];
      const initialState: TodosState = {
        todos: existingTodos,
        status: 'idle',
        error: null,
        filter: 'all',
      };

      const updatedTodo = new Todo('Updated Todo 1', true, new Date(), 1);
      const action = { 
        type: updateTodoThunk.fulfilled.type, 
        payload: updatedTodo 
      };
      const state = todosReducer(initialState, action);

      expect(state.todos[0]).toEqual(updatedTodo);
      expect(state.todos[1]).toEqual(existingTodos[1]); // Other todos should remain unchanged
    });

    it('should not update if todo not found', () => {
      const existingTodos = [
        new Todo('Todo 1', false, new Date(), 1),
      ];
      const initialState: TodosState = {
        todos: existingTodos,
        status: 'idle',
        error: null,
        filter: 'all',
      };

      const updatedTodo = new Todo('Updated Todo', true, new Date(), 999); // Non-existent ID
      const action = { 
        type: updateTodoThunk.fulfilled.type, 
        payload: updatedTodo 
      };
      const state = todosReducer(initialState, action);

      expect(state.todos).toEqual(existingTodos); // Should remain unchanged
    });
  });

  describe('deleteTodoThunk extraReducers', () => {
    it('should handle fulfilled state', () => {
      const existingTodos = [
        new Todo('Todo 1', false, new Date(), 1),
        new Todo('Todo 2', false, new Date(), 2),
      ];
      const initialState: TodosState = {
        todos: existingTodos,
        status: 'idle',
        error: null,
        filter: 'all',
      };

      const action = { 
        type: deleteTodoThunk.fulfilled.type, 
        payload: 1 // ID of todo to delete
      };
      const state = todosReducer(initialState, action);

      expect(state.todos).toHaveLength(1);
      expect(state.todos[0].id).toBe(2);
    });
  });

  describe('toggleTodoThunk extraReducers', () => {
    it('should handle fulfilled state', () => {
      const existingTodos = [
        new Todo('Todo 1', false, new Date(), 1),
        new Todo('Todo 2', false, new Date(), 2),
      ];
      const initialState: TodosState = {
        todos: existingTodos,
        status: 'idle',
        error: null,
        filter: 'all',
      };

      const toggledTodo = new Todo('Todo 1', true, new Date(), 1);
      const action = { 
        type: toggleTodoThunk.fulfilled.type, 
        payload: toggledTodo 
      };
      const state = todosReducer(initialState, action);

      expect(state.todos[0]).toEqual(toggledTodo);
      expect(state.todos[1]).toEqual(existingTodos[1]); // Other todos should remain unchanged
    });

    it('should not toggle if todo not found', () => {
      const existingTodos = [
        new Todo('Todo 1', false, new Date(), 1),
      ];
      const initialState: TodosState = {
        todos: existingTodos,
        status: 'idle',
        error: null,
        filter: 'all',
      };

      const toggledTodo = new Todo('Todo', true, new Date(), 999); // Non-existent ID
      const action = { 
        type: toggleTodoThunk.fulfilled.type, 
        payload: toggledTodo 
      };
      const state = todosReducer(initialState, action);

      expect(state.todos).toEqual(existingTodos); // Should remain unchanged
    });
  });

  describe('selectors', () => {
    it('should select todos state', () => {
      const store = createMockStore({
        todos: [new Todo('Test Todo', false, new Date(), 1)],
        status: 'succeeded',
        error: null,
        filter: 'all',
      });

      const todosState = selectTodos(store.getState());
      expect(todosState.todos).toHaveLength(1);
      expect(todosState.status).toBe('succeeded');
    });

    it('should select filtered todos - all', () => {
      const todos = [
        new Todo('Active Todo', false, new Date(), 1),
        new Todo('Completed Todo', true, new Date(), 2),
      ];
      const store = createMockStore({
        todos,
        filter: 'all',
      });

      const filteredTodos = selectFilteredTodos(store.getState());
      expect(filteredTodos).toHaveLength(2);
    });

    it('should select filtered todos - active', () => {
      const todos = [
        new Todo('Active Todo', false, new Date(), 1),
        new Todo('Completed Todo', true, new Date(), 2),
      ];
      const store = createMockStore({
        todos,
        filter: 'active',
      });

      const filteredTodos = selectFilteredTodos(store.getState());
      expect(filteredTodos).toHaveLength(1);
      expect(filteredTodos[0].completed).toBe(false);
    });

    it('should select filtered todos - completed', () => {
      const todos = [
        new Todo('Active Todo', false, new Date(), 1),
        new Todo('Completed Todo', true, new Date(), 2),
      ];
      const store = createMockStore({
        todos,
        filter: 'completed',
      });

      const filteredTodos = selectFilteredTodos(store.getState());
      expect(filteredTodos).toHaveLength(1);
      expect(filteredTodos[0].completed).toBe(true);
    });
  });
});
