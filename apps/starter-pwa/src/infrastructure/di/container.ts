import 'reflect-metadata';
import { container } from 'tsyringe';
import { TodoRepository } from '../persistence/TodoRepository';
import { ApiTodoRepository } from '../api/ApiTodoRepository';
import { IHttpClient } from '../http/IHttpClient';
import { AxiosHttpClient } from '../http/AxiosHttpClient';
import { ITodoApiService } from '../api/ITodoApiService';
import { TodoApiService } from '../api/TodoApiService';
import { getFeatureFlags, configProvider } from '../config';
import {
  TodoCommandService,
  TodoQueryService,
  CreateTodoUseCase,
  UpdateTodoUseCase,
  DeleteTodoUseCase,
  ToggleTodoUseCase,
  GetAllTodosQueryHandler,
  GetFilteredTodosQueryHandler,
  GetActiveTodosQueryHandler,
  GetCompletedTodosQueryHandler,
  GetTodoStatsQueryHandler,
  GetTodoByIdQueryHandler,
  TOKENS,
} from '@nx-starter/application-core';
import type { ITodoRepository } from '@nx-starter/domain-core';
import type {
  ITodoCommandService,
  ITodoQueryService,
} from '@nx-starter/application-core';

// Initialize configuration before using it
configProvider.initialize();

// Get feature flags from centralized configuration
const { useApiBackend } = getFeatureFlags(); 

// Register dependencies following Clean Architecture layers
export const configureDI = () => {
  // Infrastructure Layer - HTTP Client (always register for potential future use)
  container.register<IHttpClient>(TOKENS.HttpClient, {
    useFactory: () => new AxiosHttpClient()
  });
  
  // Infrastructure Layer - API Services (always register for potential future use)
  container.registerSingleton<ITodoApiService>(TOKENS.TodoApiService, TodoApiService);

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
  container.registerSingleton(
    TOKENS.GetAllTodosQueryHandler,
    GetAllTodosQueryHandler
  );
  container.registerSingleton(
    TOKENS.GetFilteredTodosQueryHandler,
    GetFilteredTodosQueryHandler
  );
  container.registerSingleton(
    TOKENS.GetActiveTodosQueryHandler,
    GetActiveTodosQueryHandler
  );
  container.registerSingleton(
    TOKENS.GetCompletedTodosQueryHandler,
    GetCompletedTodosQueryHandler
  );
  container.registerSingleton(
    TOKENS.GetTodoStatsQueryHandler,
    GetTodoStatsQueryHandler
  );
  container.registerSingleton(
    TOKENS.GetTodoByIdQueryHandler,
    GetTodoByIdQueryHandler
  );

  // Application Layer - CQRS Services
  container.registerSingleton<ITodoCommandService>(
    TOKENS.TodoCommandService,
    TodoCommandService
  );
  container.registerSingleton<ITodoQueryService>(
    TOKENS.TodoQueryService,
    TodoQueryService
  );
};

// Export container and tokens for use in components
export { container, TOKENS };
