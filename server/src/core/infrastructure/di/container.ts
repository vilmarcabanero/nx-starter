import 'reflect-metadata';
import { container } from 'tsyringe';
import { InMemoryTodoRepository } from '@/core/infrastructure/todo/persistence/InMemoryTodoRepository';
import { CreateTodoUseCase } from '@/core/application/todo/use-cases/commands/CreateTodoUseCase';
import { UpdateTodoUseCase } from '@/core/application/todo/use-cases/commands/UpdateTodoUseCase';
import { DeleteTodoUseCase } from '@/core/application/todo/use-cases/commands/DeleteTodoUseCase';
import { ToggleTodoUseCase } from '@/core/application/todo/use-cases/commands/ToggleTodoUseCase';
import { 
  GetAllTodosQueryHandler,
  GetActiveTodosQueryHandler,
  GetCompletedTodosQueryHandler,
  GetTodoByIdQueryHandler,
  GetTodoStatsQueryHandler
} from '@/core/application/todo/use-cases/queries/TodoQueryHandlers';
import type { ITodoRepository } from '@/core/domain/todo/repositories/ITodoRepository';
import { TOKENS } from './tokens';

// Register dependencies following Clean Architecture layers
export const configureDI = () => {
  // Infrastructure Layer - Repository
  container.registerSingleton<ITodoRepository>(
    TOKENS.TodoRepository,
    InMemoryTodoRepository
  );

  // Application Layer - Use Cases (Commands)
  container.registerSingleton(TOKENS.CreateTodoUseCase, CreateTodoUseCase);
  container.registerSingleton(TOKENS.UpdateTodoUseCase, UpdateTodoUseCase);
  container.registerSingleton(TOKENS.DeleteTodoUseCase, DeleteTodoUseCase);
  container.registerSingleton(TOKENS.ToggleTodoUseCase, ToggleTodoUseCase);

  // Application Layer - Use Cases (Queries)
  container.registerSingleton(TOKENS.GetAllTodosQueryHandler, GetAllTodosQueryHandler);
  container.registerSingleton(TOKENS.GetActiveTodosQueryHandler, GetActiveTodosQueryHandler);
  container.registerSingleton(TOKENS.GetCompletedTodosQueryHandler, GetCompletedTodosQueryHandler);
  container.registerSingleton(TOKENS.GetTodoByIdQueryHandler, GetTodoByIdQueryHandler);
  container.registerSingleton(TOKENS.GetTodoStatsQueryHandler, GetTodoStatsQueryHandler);
};

// Export container and tokens for use in controllers
export { container, TOKENS };