import type { Todo } from '@nx-starter/domain';

export interface CreateTodoData {
  title: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

export interface UpdateTodoData {
  title?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

// Interface Segregation Principle - Separate read and write operations
export interface ITodoCommandService {
  createTodo(data: CreateTodoData): Promise<Todo>;
  updateTodo(id: string, updates: UpdateTodoData): Promise<Todo>;
  deleteTodo(id: string): Promise<void>;
  toggleTodo(id: string): Promise<Todo>;
}

export interface ITodoQueryService {
  getAllTodos(): Promise<Todo[]>;
  getActiveTodos(): Promise<Todo[]>;
  getCompletedTodos(): Promise<Todo[]>;
  getTodoById(id: string): Promise<Todo>;
  getFilteredTodos(
    filter: 'all' | 'active' | 'completed',
    sortBy?: 'priority' | 'createdAt' | 'urgency'
  ): Promise<Todo[]>;
  getTodoStats(): Promise<{
    total: number;
    active: number;
    completed: number;
    overdue?: number;
    highPriority?: number;
  }>;
}

// Combined interface for backward compatibility
export interface ITodoService extends ITodoCommandService, ITodoQueryService {}
