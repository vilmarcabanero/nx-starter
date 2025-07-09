import 'reflect-metadata';
import { container } from 'tsyringe';
import { TodoRepository } from '../db/TodoRepository';
import { TodoService } from '../../application/services/TodoService';
import type { ITodoRepository } from '../../domain/repositories/ITodoRepository';
import type { ITodoService } from '../../application/interfaces/ITodoService';
import { TOKENS } from './tokens';

// Register dependencies
export const configureDI = () => {
  // Register repository as singleton
  container.registerSingleton<ITodoRepository>(
    TOKENS.TodoRepository,
    TodoRepository
  );

  // Register service using factory pattern for explicit dependency injection
  container.register<ITodoService>(
    TOKENS.TodoService,
    {
      useFactory: (c) => new TodoService(c.resolve(TOKENS.TodoRepository))
    }
  );
};

// Export container and tokens for use in components
export { container, TOKENS };
