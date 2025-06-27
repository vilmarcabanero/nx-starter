import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Todo } from '../../domain/entities/Todo';
import { 
  fetchTodosThunk, 
  createTodoThunk, 
  updateTodoThunk, 
  deleteTodoThunk,
  toggleTodoThunk
} from './thunks';

export interface TodosState {
  todos: Todo[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filter: 'all' | 'active' | 'completed';
}

type RootState = {
  todos: TodosState;
};

const initialState: TodosState = {
  todos: [],
  status: 'idle',
  error: null,
  filter: 'all',
};

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<'all' | 'active' | 'completed'>) => {
      state.filter = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch todos
      .addCase(fetchTodosThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTodosThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.todos = action.payload;
      })
      .addCase(fetchTodosThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch todos';
      })
      // Create todo
      .addCase(createTodoThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createTodoThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.todos.unshift(action.payload);
      })
      .addCase(createTodoThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to create todo';
      })
      // Update todo
      .addCase(updateTodoThunk.fulfilled, (state, action) => {
        const index = state.todos.findIndex(todo => todo.id === action.payload.id);
        if (index !== -1) {
          state.todos[index] = action.payload;
        }
      })
      // Delete todo
      .addCase(deleteTodoThunk.fulfilled, (state, action) => {
        state.todos = state.todos.filter(todo => todo.id !== action.payload);
      })
      // Toggle todo
      .addCase(toggleTodoThunk.fulfilled, (state, action) => {
        const index = state.todos.findIndex(todo => todo.id === action.payload.id);
        if (index !== -1) {
          state.todos[index] = action.payload;
        }
      });
  },
});

export const { setFilter, clearError } = todosSlice.actions;
export default todosSlice.reducer;

// Selectors
export const selectTodos = (state: RootState) => state.todos;
export const selectFilteredTodos = (state: RootState) => {
  const { todos, filter } = state.todos;
  switch (filter) {
    case 'active':
      return todos.filter((todo: Todo) => !todo.completed);
    case 'completed':
      return todos.filter((todo: Todo) => todo.completed);
    default:
      return todos;
  }
};
