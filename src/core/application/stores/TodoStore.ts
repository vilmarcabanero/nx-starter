import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { container, TOKENS } from '../../infrastructure/di/container';
import { Todo } from '../../domain/entities/Todo';
import type { TodoStore } from './interfaces/TodoStore';
import type { ITodoService, CreateTodoData, UpdateTodoData } from '../interfaces/ITodoService';

export const useTodoStore = create<TodoStore>()(
  subscribeWithSelector(
    devtools(
      immer((set, get) => {
        // Lazy resolve the service when needed to avoid DI timing issues
        const getTodoService = () => container.resolve<ITodoService>(TOKENS.TodoService);

        return {
          // Initial state
          todos: [],
          filter: 'all',
          status: 'idle',
          error: null,

          // Computed values as functions
          getFilteredTodos() {
            const { todos, filter } = get();
            switch (filter) {
              case 'active':
                return todos.filter(todo => !todo.completed);
              case 'completed':
                return todos.filter(todo => todo.completed);
              default:
                return todos;
            }
          },

          getStats() {
            const { todos } = get();
            return {
              total: todos.length,
              active: todos.filter(todo => !todo.completed).length,
              completed: todos.filter(todo => todo.completed).length,
            };
          },

          getIsLoading() {
            return get().status === 'loading';
          },

          getIsIdle() {
            return get().status === 'idle';
          },

          getHasError() {
            return get().status === 'failed';
          },

          // Actions
          async loadTodos() {
            set((state) => {
              state.status = 'loading';
              state.error = null;
            });

            try {
              const todos = await getTodoService().getAllTodos();
              set((state) => {
                state.todos = todos;
                state.status = 'succeeded';
              });
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to load todos';
                state.status = 'failed';
              });
            }
          },

          async createTodo(data: CreateTodoData) {
            set((state) => {
              state.status = 'loading';
              state.error = null;
            });

            try {
              const todo = await getTodoService().createTodo(data);
              set((state) => {
                state.todos.unshift(todo);
                state.status = 'succeeded';
              });
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to create todo';
                state.status = 'failed';
              });
              throw error;
            }
          },

          async updateTodo(id: number, updates: UpdateTodoData) {
            // Optimistic update - create deep copy of todos
            const originalTodos = get().todos.map(todo => new Todo(todo.title, todo.completed, todo.createdAt, todo.id));
            
            set((state) => {
              const index = state.todos.findIndex(todo => todo.id === id);
              if (index !== -1) {
                Object.assign(state.todos[index], updates);
              }
              state.status = 'loading';
            });

            try {
              const updatedTodo = await getTodoService().updateTodo(id, updates);
              set((state) => {
                const index = state.todos.findIndex(todo => todo.id === id);
                if (index !== -1) {
                  state.todos[index] = updatedTodo;
                }
                state.status = 'succeeded';
              });
            } catch (error) {
              // Revert optimistic update
              set((state) => {
                state.todos = originalTodos;
                state.status = 'failed';
                state.error = error instanceof Error ? error.message : 'Failed to update todo';
              });
              throw error;
            }
          },

          async deleteTodo(id: number) {
            // Optimistic update - create deep copy of todos
            const originalTodos = get().todos.map(todo => new Todo(todo.title, todo.completed, todo.createdAt, todo.id));
            
            set((state) => {
              state.todos = state.todos.filter(todo => todo.id !== id);
              state.status = 'loading';
            });

            try {
              await getTodoService().deleteTodo(id);
              set((state) => {
                state.status = 'succeeded';
              });
            } catch (error) {
              // Revert optimistic update
              set((state) => {
                state.todos = originalTodos;
                state.status = 'failed';
                state.error = error instanceof Error ? error.message : 'Failed to delete todo';
              });
              throw error;
            }
          },

          async toggleTodo(id: number) {
            // Optimistic update - create deep copy of todos
            const originalTodos = get().todos.map(todo => new Todo(todo.title, todo.completed, todo.createdAt, todo.id));
            
            set((state) => {
              const index = state.todos.findIndex(todo => todo.id === id);
              if (index !== -1) {
                state.todos[index].completed = !state.todos[index].completed;
              }
              state.status = 'loading';
            });

            try {
              const updatedTodo = await getTodoService().toggleTodo(id);
              set((state) => {
                const index = state.todos.findIndex(todo => todo.id === id);
                if (index !== -1) {
                  state.todos[index] = updatedTodo;
                }
                state.status = 'succeeded';
              });
            } catch (error) {
              // Revert optimistic update
              set((state) => {
                state.todos = originalTodos;
                state.status = 'failed';
                state.error = error instanceof Error ? error.message : 'Failed to toggle todo';
              });
              throw error;
            }
          },

          setFilter(filter: 'all' | 'active' | 'completed') {
            set((state) => {
              state.filter = filter;
            });
          },

          clearError() {
            set((state) => {
              state.error = null;
              if (state.status === 'failed') {
                state.status = 'idle';
              }
            });
          },
        };
      }),
      {
        name: 'todo-store',
      }
    )
  )
);
