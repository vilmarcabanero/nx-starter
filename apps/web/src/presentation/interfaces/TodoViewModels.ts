import { Todo } from '@nx-starter/domain';

/**
 * View Model interfaces for presentation layer
 * These define the contract between view models and views
 */

export interface TodoListViewModel {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
  isLoading: boolean;
  error: string | null;

  // Actions
  setFilter(filter: 'all' | 'active' | 'completed'): void;
  refreshTodos(): Promise<void>;
}

export interface TodoFormViewModel {
  isSubmitting: boolean;
  isGlobalLoading: boolean;
  validationErrors: Record<string, string>;

  // Actions
  submitTodo(title: string): Promise<void>;
  validateTitle(title: string): boolean;
  handleFormSubmit(title: string): Promise<boolean>;
}

export interface TodoStatsViewModel {
  stats: {
    total: number;
    active: number;
    completed: number;
    overdue: number;
    highPriority: number;
  };
  isLoading: boolean;
  currentFilter: 'all' | 'active' | 'completed';

  // Actions
  refreshStats(): Promise<void>;
  handleFilterChange(value: string): void;
  validateFilterValue(value: string): value is 'all' | 'active' | 'completed';
}

export interface TodoItemViewModel {
  todo: Todo;
  isUpdating: boolean;
  isEditing: boolean;
  editTitle: string;

  // Actions
  toggleComplete(): Promise<void>;
  updateTitle(newTitle: string): Promise<void>;
  deleteTodo(): Promise<void>;
  updatePriority(priority: 'low' | 'medium' | 'high'): Promise<void>;

  // Edit mode actions
  startEditing(): void;
  cancelEditing(): void;
  saveEdit(): Promise<void>;
  handleEditTitleChange(newTitle: string): void;
  handleKeyDown(e: React.KeyboardEvent): void;
}

export interface ErrorBannerViewModel {
  hasError: boolean;
  error: string | null;

  // Actions
  dismiss(): void;
  retry(): void;
}
