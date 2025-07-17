// DI Container tokens following Clean Architecture layers
export const TOKENS = {
  // Infrastructure Layer - Repositories
  TodoRepository: 'TodoRepository',

  // Application Layer - Use Cases (Commands)
  CreateTodoUseCase: 'CreateTodoUseCase',
  UpdateTodoUseCase: 'UpdateTodoUseCase',
  DeleteTodoUseCase: 'DeleteTodoUseCase',
  ToggleTodoUseCase: 'ToggleTodoUseCase',

  // Application Layer - Use Cases (Queries)
  GetAllTodosQueryHandler: 'GetAllTodosQueryHandler',
  GetActiveTodosQueryHandler: 'GetActiveTodosQueryHandler',
  GetCompletedTodosQueryHandler: 'GetCompletedTodosQueryHandler',
  GetTodoByIdQueryHandler: 'GetTodoByIdQueryHandler',
  GetTodoStatsQueryHandler: 'GetTodoStatsQueryHandler',

  // Infrastructure Layer - Database Connections
  DatabaseConnection: 'DatabaseConnection',
} as const;

// Type-safe token keys
export type TokenKey = keyof typeof TOKENS;