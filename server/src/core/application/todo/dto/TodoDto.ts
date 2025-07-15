// Data Transfer Objects for Todo operations

export interface TodoDto {
  id: string;
  title: string;
  completed: boolean;
  priority: string;
  createdAt: string;
  dueDate?: string;
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
  overdue: number;
  highPriority: number;
}

export interface TodoFilterDto {
  completed?: boolean;
  priority?: string;
  search?: string;
}