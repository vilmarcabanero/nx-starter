/**
 * Request DTOs for Todo API endpoints
 * These define the shape of HTTP request bodies for type safety
 * Shared between frontend and backend for consistent API contracts
 * Validation is still handled by Zod schemas in the application layer
 */

// Todo priority levels (matches domain model)
export type TodoPriorityLevel = 'low' | 'medium' | 'high';

/**
 * Request body for creating a new todo
 * POST /api/todos
 */
export interface CreateTodoRequestDto {
  title: string;
  priority?: TodoPriorityLevel;
  dueDate?: string; // ISO datetime string
}

/**
 * Request body for updating an existing todo
 * PUT /api/todos/:id
 * Note: id comes from route parameter, not request body
 */
export interface UpdateTodoRequestDto {
  title?: string;
  completed?: boolean;
  priority?: TodoPriorityLevel;
  dueDate?: string; // ISO datetime string
}