import type { Todo } from '@/core/domain/todo/entities/Todo';
import type { CreateTodoData, UpdateTodoData } from '@/core/application/shared/interfaces/ITodoService';

export type TodoStoreStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface TodoStore {
  // State
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
  status: TodoStoreStatus;
  error: string | null;

  // Computed getters as functions
  getFilteredTodos(): Todo[];
  getStats(): {
    total: number;
    active: number;
    completed: number;
  };
  getIsLoading(): boolean;
  getIsIdle(): boolean;
  getHasError(): boolean;

  // Actions
  loadTodos(): Promise<void>;
  createTodo(data: CreateTodoData): Promise<void>;
  updateTodo(id: number, updates: UpdateTodoData): Promise<void>;
  deleteTodo(id: number): Promise<void>;
  toggleTodo(id: number): Promise<void>;
  setFilter(filter: 'all' | 'active' | 'completed'): void;
  clearError(): void;
}
