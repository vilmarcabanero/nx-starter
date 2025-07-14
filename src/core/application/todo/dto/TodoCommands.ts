/**
 * Command for creating a new todo
 */
export interface CreateTodoCommand {
  title: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

/**
 * Command for updating an existing todo
 */
export interface UpdateTodoCommand {
  id: number;
  title?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

/**
 * Command for deleting a todo
 */
export interface DeleteTodoCommand {
  id: number;
}

/**
 * Command for toggling todo completion status
 */
export interface ToggleTodoCommand {
  id: number;
}
