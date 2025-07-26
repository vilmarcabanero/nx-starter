// Data Transfer Objects for Todo operations
// Unified version combining frontend and backend DTOs

export interface TodoDto {
  id: string;
  title: string;
  completed: boolean;
  priority?: string;
  createdAt: string;
  updatedAt?: string; // frontend uses this
  dueDate?: string; // backend uses this
}

export interface CreateTodoDto {
  title: string;
  priority?: string;
  dueDate?: string;
}

export interface UpdateTodoDto {
  title?: string;
  completed?: boolean;
  priority?: string;
  dueDate?: string;
}

export interface TodoStatsDto {
  total: number;
  active: number;
  completed: number;
  overdue?: number; // backend specific
  highPriority?: number; // backend specific
}

export interface TodoFilterDto {
  completed?: boolean;
  priority?: string;
  search?: string;
}
