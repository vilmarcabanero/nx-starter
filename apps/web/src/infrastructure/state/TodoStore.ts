import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { container, TOKENS } from '../di/container';
import { Todo } from '@nx-starter/domain';
import type { TodoStore } from './TodoStoreInterface';
import type {
  ITodoCommandService,
  ITodoQueryService,
  CreateTodoData,
  UpdateTodoData,
} from '@nx-starter/application-shared';

export const useTodoStore = create<TodoStore>()(
  subscribeWithSelector(
    devtools(
      immer((set, get) => {
        // Lazy resolve CQRS services - proper separation of concerns
        const getCommandService = () =>
          container.resolve<ITodoCommandService>(TOKENS.TodoCommandService);
        const getQueryService = () =>
          container.resolve<ITodoQueryService>(TOKENS.TodoQueryService);

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
                return todos.filter((todo) => !todo.completed);
              case 'completed':
                return todos.filter((todo) => todo.completed);
              default:
                return todos;
            }
          },

          getStats() {
            const { todos } = get();
            return {
              total: todos.length,
              active: todos.filter((todo) => !todo.completed).length,
              completed: todos.filter((todo) => todo.completed).length,
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
              const todos = await getQueryService().getAllTodos();
              set((state) => {
                state.todos = todos;
                state.status = 'succeeded';
              });
            } catch (error) {
              set((state) => {
                state.error =
                  error instanceof Error
                    ? error.message
                    : 'Failed to load todos';
                state.status = 'failed';
              });
            }
          },

          async createTodo(data: CreateTodoData) {
            set((state) => {
              state.error = null;
            });

            try {
              const todo = await getCommandService().createTodo(data);
              set((state) => {
                state.todos.unshift(todo);
                state.status = 'succeeded';
              });
            } catch (error) {
              set((state) => {
                state.error =
                  error instanceof Error
                    ? error.message
                    : 'Failed to create todo';
                state.status = 'failed';
              });
              throw error;
            }
          },

          async updateTodo(id: string, updates: UpdateTodoData) {
            // Optimistic update - create deep copy of todos
            const originalTodos = get().todos.map(
              (todo) =>
                new Todo(
                  todo.titleValue,
                  todo.completed,
                  todo.createdAt,
                  todo.stringId,
                  todo.priority.level
                )
            );

            set((state) => {
              const index = state.todos.findIndex(
                (todo) => todo.stringId === id
              );
              if (index !== -1) {
                // Create a new Todo entity with the updates instead of mutating
                const currentTodo = state.todos[index];
                state.todos[index] = new Todo(
                  updates.title !== undefined
                    ? updates.title
                    : currentTodo.titleValue,
                  updates.completed !== undefined
                    ? updates.completed
                    : currentTodo.completed,
                  currentTodo.createdAt,
                  currentTodo.stringId,
                  updates.priority !== undefined
                    ? updates.priority
                    : currentTodo.priority.level,
                  updates.dueDate !== undefined
                    ? updates.dueDate
                    : currentTodo.dueDate
                );
              }
              state.error = null;
            });

            try {
              const updatedTodo = await getCommandService().updateTodo(
                id,
                updates
              );
              set((state) => {
                const index = state.todos.findIndex(
                  (todo) => todo.stringId === id
                );
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
                state.error =
                  error instanceof Error
                    ? error.message
                    : 'Failed to update todo';
              });
              throw error;
            }
          },

          async deleteTodo(id: string) {
            // Optimistic update - create deep copy of todos
            const originalTodos = get().todos.map(
              (todo) =>
                new Todo(
                  todo.titleValue,
                  todo.completed,
                  todo.createdAt,
                  todo.stringId,
                  todo.priority.level
                )
            );

            set((state) => {
              state.todos = state.todos.filter((todo) => todo.stringId !== id);
              state.error = null;
            });

            try {
              await getCommandService().deleteTodo(id);
              set((state) => {
                state.status = 'succeeded';
              });
            } catch (error) {
              // Revert optimistic update
              set((state) => {
                state.todos = originalTodos;
                state.status = 'failed';
                state.error =
                  error instanceof Error
                    ? error.message
                    : 'Failed to delete todo';
              });
              throw error;
            }
          },

          async toggleTodo(id: string) {
            // Optimistic update - create deep copy of todos
            const originalTodos = get().todos.map(
              (todo) =>
                new Todo(
                  todo.titleValue,
                  todo.completed,
                  todo.createdAt,
                  todo.stringId,
                  todo.priority.level
                )
            );

            set((state) => {
              const index = state.todos.findIndex(
                (todo) => todo.stringId === id
              );
              if (index !== -1) {
                // Create a new Todo entity with toggled completed status instead of mutating
                const currentTodo = state.todos[index];
                state.todos[index] = new Todo(
                  currentTodo.titleValue,
                  !currentTodo.completed,
                  currentTodo.createdAt,
                  currentTodo.stringId,
                  currentTodo.priority.level,
                  currentTodo.dueDate
                );
              }
              state.error = null;
            });

            try {
              const updatedTodo = await getCommandService().toggleTodo(id);
              set((state) => {
                const index = state.todos.findIndex(
                  (todo) => todo.stringId === id
                );
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
                state.error =
                  error instanceof Error
                    ? error.message
                    : 'Failed to toggle todo';
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
