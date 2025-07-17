// Query DTOs for CQRS pattern
// Unified version (identical in both frontend and backend)

/**
 * Query for getting all todos
 */
export type GetAllTodosQuery = object;

/**
 * Query for getting filtered todos
 */
export interface GetFilteredTodosQuery {
  filter: 'all' | 'active' | 'completed';
  sortBy?: 'priority' | 'createdAt' | 'urgency';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Query for getting todo statistics
 */
export type GetTodoStatsQuery = object;

/**
 * Query for getting a single todo by ID
 */
export interface GetTodoByIdQuery {
  id: string;
}

/**
 * Query response for todo statistics
 */
export interface TodoStatsQueryResult {
  total: number;
  active: number;
  completed: number;
  overdue: number;
  highPriority: number;
}
