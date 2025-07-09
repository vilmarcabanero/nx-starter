import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { configureDI, TOKENS } from '../core/infrastructure/di/container';
import { TodoService } from '../core/application/services/TodoService';
import { TodoRepository } from '../core/infrastructure/db/TodoRepository';
import type { ITodoService } from '../core/application/interfaces/ITodoService';
import type { ITodoRepository } from '../core/domain/repositories/ITodoRepository';

describe('Dependency Injection', () => {
  beforeEach(() => {
    container.clearInstances();
    configureDI();
  });

  it('should register and resolve TodoRepository', () => {
    const repository = container.resolve<ITodoRepository>(TOKENS.TodoRepository);
    expect(repository).toBeInstanceOf(TodoRepository);
  });

  it('should register and resolve TodoService with injected dependencies', () => {
    const service = container.resolve<ITodoService>(TOKENS.TodoService);
    expect(service).toBeInstanceOf(TodoService);
  });

  it('should provide the same instance when using singleton registration for repository', () => {
    const repo1 = container.resolve<ITodoRepository>(TOKENS.TodoRepository);
    const repo2 = container.resolve<ITodoRepository>(TOKENS.TodoRepository);
    expect(repo1).toBe(repo2);
  });

  it('should resolve dependencies correctly', async () => {
    const service = container.resolve<ITodoService>(TOKENS.TodoService);
    
    // Test that the service can call repository methods without errors
    const todos = await service.getAllTodos();
    expect(Array.isArray(todos)).toBe(true);
  });

  it('should use symbol-based tokens for type safety', () => {
    // Verify that tokens are symbols
    expect(typeof TOKENS.TodoRepository).toBe('symbol');
    expect(typeof TOKENS.TodoService).toBe('symbol');
    
    // Verify that symbols have meaningful descriptions
    expect(TOKENS.TodoRepository.description).toBe('TodoRepository');
    expect(TOKENS.TodoService.description).toBe('TodoService');
  });
});
