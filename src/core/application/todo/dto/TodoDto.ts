// Data Transfer Objects for Todo operations

export interface TodoDto {
  id: string;
  title: string;
  completed: boolean;
  priority?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoDto {
  title: string;
  priority?: string;
}

export interface UpdateTodoDto {
  title?: string;
  completed?: boolean;
  priority?: string;
}

export interface TodoStatsDto {
  total: number;
  active: number;
  completed: number;
}

export interface TodoFilterDto {
  completed?: boolean;
  priority?: string;
  search?: string;
}
