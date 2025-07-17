import 'reflect-metadata';
import { container } from 'tsyringe';
import { TodoRepository } from '../persistence/TodoRepository';
import { ApiTodoRepository } from '../api/ApiTodoRepository';
import { 
  TodoCommandService,
  TodoQueryService,
  CreateTodoUseCase,
  UpdateTodoUseCase,
  DeleteTodoUseCase,
  ToggleTodoUseCase,
  GetAllTodosQueryHandler,
  GetFilteredTodosQueryHandler,
  GetTodoStatsQueryHandler,
  GetTodoByIdQueryHandler
} from '@nx-starter/shared-application';
import type { ITodoRepository } from '@nx-starter/shared-domain';
import type { ITodoCommandService, ITodoQueryService } from '@nx-starter/shared-application';
import { TOKENS } from './tokens';

// Check environment variable to determine data source
const useApiBackend = import.meta.env.VITE_USE_API_BACKEND === 'true';

// Register dependencies following Clean Architecture layers
export const configureDI = () => {
  // Infrastructure Layer - Repository (conditionally based on environment)
  if (useApiBackend) {
    console.log('📡 Using API backend for data storage');
    container.registerSingleton<ITodoRepository>(
      TOKENS.TodoRepository,
      ApiTodoRepository
    );
  } else {
    console.log('💾 Using local Dexie.js for data storage');
    container.registerSingleton<ITodoRepository>(
      TOKENS.TodoRepository,
      TodoRepository
    );
  }

  // Application Layer - Use Cases (Commands)
  container.registerSingleton(TOKENS.CreateTodoUseCase, CreateTodoUseCase);
  container.registerSingleton(TOKENS.UpdateTodoUseCase, UpdateTodoUseCase);
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