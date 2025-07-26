import type { Todo } from '@nx-starter/domain';
import type {
  CreateTodoData,
  UpdateTodoData,
} from '@nx-starter/application-shared';

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
  updateTodo(id: string, updates: UpdateTodoData): Promise<void>;
  deleteTodo(id: string): Promise<void>;
  toggleTodo(id: string): Promise<void>;
  setFilter(filter: 'all' | 'active' | 'completed'): void;
  clearError(): void;
}
