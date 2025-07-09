import type { Todo } from '../../domain/entities/Todo';

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

export interface ITodoService {
  getAllTodos(): Promise<Todo[]>;
  createTodo(data: CreateTodoData): Promise<Todo>;
  updateTodo(id: number, updates: UpdateTodoData): Promise<Todo>;
  deleteTodo(id: number): Promise<void>;
  toggleTodo(id: number): Promise<Todo>;
  getActiveTodos(): Promise<Todo[]>;
  getCompletedTodos(): Promise<Todo[]>;
  getTodoStats(): Promise<{ total: number; active: number; completed: number }>;
}
