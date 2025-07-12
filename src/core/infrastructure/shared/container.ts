import 'reflect-metadata';
import { container } from 'tsyringe';
import { TodoRepository } from '@/core/infrastructure/todo/persistence/TodoRepository';
import { TodoCommandService } from '@/core/application/todo/services/TodoCommandService';
import { TodoQueryService } from '@/core/application/todo/services/TodoQueryService';
import { CreateTodoUseCase } from '@/core/application/todo/use-cases/commands/CreateTodoUseCase';
import { UpdateTodoUseCase } from '@/core/application/todo/use-cases/commands/UpdateTodoUseCase';
import { DeleteTodoUseCase } from '@/core/application/todo/use-cases/commands/DeleteTodoUseCase';
import { ToggleTodoUseCase } from '@/core/application/todo/use-cases/commands/ToggleTodoUseCase';
import { 
  GetAllTodosQueryHandler,
  GetFilteredTodosQueryHandler,
  GetTodoStatsQueryHandler,
  GetTodoByIdQueryHandler
} from '@/core/application/todo/use-cases/queries/TodoQueryHandlers';
import type { ITodoRepository } from '@/core/domain/todo/repositories/ITodoRepository';
import type { ITodoCommandService, ITodoQueryService } from '@/core/application/shared/interfaces/ITodoService';
import { TOKENS } from './tokens';

// Register dependencies following Clean Architecture layers
export const configureDI = () => {
  // Infrastructure Layer - Repository
  container.registerSingleton<ITodoRepository>(
    TOKENS.TodoRepository,
    TodoRepository
  );

  // Application Layer - Use Cases (Commands)
  container.registerSingleton(TOKENS.CreateTodoUseCase, CreateTodoUseCase);
  container.registerSingleton(TOKENS.UpdateTodoUseCase, UpdateTodoUseCase);
  container.registerSingleton(TOKENS.DeleteTodoUseCase, DeleteTodoUseCase);
  container.registerSingleton(TOKENS.ToggleTodoUseCase, ToggleTodoUseCase);
  container.registerSingleton(TOKENS.DeleteTodoUseCase, DeleteTodoUseCase);
  container.registerSingleton(TOKENS.ToggleTodoUseCase, ToggleTodoUseCase);

  // Application Layer - Use Cases (Queries)
  container.registerSingleton(TOKENS.GetAllTodosQueryHandler, GetAllTodosQueryHandler);
  container.registerSingleton(TOKENS.GetFilteredTodosQueryHandler, GetFilteredTodosQueryHandler);
  container.registerSingleton(TOKENS.GetTodoStatsQueryHandler, GetTodoStatsQueryHandler);
  container.registerSingleton(TOKENS.GetTodoByIdQueryHandler, GetTodoByIdQueryHandler);

  // Application Layer - CQRS Services
  container.registerSingleton<ITodoCommandService>(TOKENS.TodoCommandService, TodoCommandService);
  container.registerSingleton<ITodoQueryService>(TOKENS.TodoQueryService, TodoQueryService);
};

// Export container and tokens for use in components
export { container, TOKENS };
