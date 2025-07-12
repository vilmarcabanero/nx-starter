import type { Todo } from '@/core/domain/todo/entities/Todo';

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
  updateTodo(id: number, updates: UpdateTodoData): Promise<Todo>;
  deleteTodo(id: number): Promise<void>;
  toggleTodo(id: number): Promise<Todo>;
}

export interface ITodoQueryService {
  getAllTodos(): Promise<Todo[]>;
  getActiveTodos(): Promise<Todo[]>;
  getCompletedTodos(): Promise<Todo[]>;
  getTodoById(id: number): Promise<Todo | null>;
  getFilteredTodos(filter: 'all' | 'active' | 'completed', sortBy?: 'priority' | 'createdAt' | 'urgency'): Promise<Todo[]>;
  getTodoStats(): Promise<{ total: number; active: number; completed: number }>;
}

// Combined interface for backward compatibility
export interface ITodoService extends ITodoCommandService, ITodoQueryService {}
