import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { configureDI, TOKENS } from './container';
import { TodoCommandService } from '../../application/todo/services/TodoCommandService';
import { TodoQueryService } from '../../application/todo/services/TodoQueryService';
import { TodoRepository } from '../todo/persistence/TodoRepository';
import { ApiTodoRepository } from '../todo/persistence/ApiTodoRepository';
import type { ITodoCommandService, ITodoQueryService } from '../../application/shared/interfaces/ITodoService';
import type { ITodoRepository } from '../../domain/todo/repositories/ITodoRepository';

describe('Dependency Injection', () => {
  beforeEach(() => {
    container.clearInstances();
    configureDI();
  });

  describe('Infrastructure Services', () => {
    it('should register and resolve TodoRepository', () => {
      const repository = container.resolve<ITodoRepository>(TOKENS.TodoRepository);
      // Check that we get the correct implementation based on environment
      const useApiBackend = import.meta.env.VITE_USE_API_BACKEND === 'true';
      if (useApiBackend) {
        expect(repository).toBeInstanceOf(ApiTodoRepository);
      } else {
        expect(repository).toBeInstanceOf(TodoRepository);
      }
    });

    it('should provide the same instance when using singleton registration for repository', () => {
      const repo1 = container.resolve<ITodoRepository>(TOKENS.TodoRepository);
      const repo2 = container.resolve<ITodoRepository>(TOKENS.TodoRepository);
      expect(repo1).toBe(repo2);
    });
  });

  describe('Modern CQRS Services', () => {
    it('should register and resolve TodoCommandService', () => {
      const service = container.resolve<ITodoCommandService>(TOKENS.TodoCommandService);
      expect(service).toBeInstanceOf(TodoCommandService);
    });

    it('should register and resolve TodoQueryService', () => {
      const service = container.resolve<ITodoQueryService>(TOKENS.TodoQueryService);
      expect(service).toBeInstanceOf(TodoQueryService);
    });

    it('should resolve CQRS dependencies correctly', async () => {
      const commandService = container.resolve<ITodoCommandService>(TOKENS.TodoCommandService);
      const queryService = container.resolve<ITodoQueryService>(TOKENS.TodoQueryService);
      
      // Test that services can call methods without errors
      const todosFromQuery = await queryService.getAllTodos();
      expect(Array.isArray(todosFromQuery)).toBe(true);

      // Test command service by ensuring it's properly instantiated
      expect(commandService).toBeDefined();
      expect(typeof commandService.createTodo).toBe('function');
    });

    it('should provide singleton instances for CQRS services', () => {
      const cmd1 = container.resolve<ITodoCommandService>(TOKENS.TodoCommandService);
      const cmd2 = container.resolve<ITodoCommandService>(TOKENS.TodoCommandService);
      expect(cmd1).toBe(cmd2);

      const query1 = container.resolve<ITodoQueryService>(TOKENS.TodoQueryService);
      const query2 = container.resolve<ITodoQueryService>(TOKENS.TodoQueryService);
      expect(query1).toBe(query2);
    });
  });

  describe('Token Validation', () => {
    it('should use string-based tokens for DI', () => {
      // Verify that tokens are strings (as defined in tokens.ts)
      expect(typeof TOKENS.TodoRepository).toBe('string');
      expect(typeof TOKENS.TodoCommandService).toBe('string');
      expect(typeof TOKENS.TodoQueryService).toBe('string');
      
      // Verify token values
      expect(TOKENS.TodoRepository).toBe('ITodoRepository');
      expect(TOKENS.TodoCommandService).toBe('ITodoCommandService');
      expect(TOKENS.TodoQueryService).toBe('ITodoQueryService');
    });
  });
});