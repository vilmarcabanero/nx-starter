import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { configureDI, TOKENS } from './container';
import { CreateTodoUseCase } from '../../application/todo/use-cases/commands/CreateTodoUseCase';
import { UpdateTodoUseCase } from '../../application/todo/use-cases/commands/UpdateTodoUseCase';
import { DeleteTodoUseCase } from '../../application/todo/use-cases/commands/DeleteTodoUseCase';
import { ToggleTodoUseCase } from '../../application/todo/use-cases/commands/ToggleTodoUseCase';
import { GetAllTodosQueryHandler } from '../../application/todo/use-cases/queries/TodoQueryHandlers';
import { GetFilteredTodosQueryHandler } from '../../application/todo/use-cases/queries/TodoQueryHandlers';
import { GetTodoStatsQueryHandler } from '../../application/todo/use-cases/queries/TodoQueryHandlers';
import { GetTodoByIdQueryHandler } from '../../application/todo/use-cases/queries/TodoQueryHandlers';
import { TodoCommandService } from '../../application/todo/services/TodoCommandService';
import { TodoQueryService } from '../../application/todo/services/TodoQueryService';
import { TodoRepository } from '../todo/persistence/TodoRepository';

describe('Shared Container Configuration', () => {
  beforeEach(() => {
    container.clearInstances();
  });

  it('should configure all dependencies without errors', () => {
    expect(() => configureDI()).not.toThrow();
  });

  it('should register TodoRepository as singleton', () => {
    configureDI();
    
    const repo1 = container.resolve(TOKENS.TodoRepository);
    const repo2 = container.resolve(TOKENS.TodoRepository);
    
    expect(repo1).toBeInstanceOf(TodoRepository);
    expect(repo1).toBe(repo2);
  });

  it('should register all command use cases', () => {
    configureDI();
    
    const createUseCase = container.resolve(TOKENS.CreateTodoUseCase);
    const updateUseCase = container.resolve(TOKENS.UpdateTodoUseCase);
    const deleteUseCase = container.resolve(TOKENS.DeleteTodoUseCase);
    const toggleUseCase = container.resolve(TOKENS.ToggleTodoUseCase);
    
    expect(createUseCase).toBeInstanceOf(CreateTodoUseCase);
    expect(updateUseCase).toBeInstanceOf(UpdateTodoUseCase);
    expect(deleteUseCase).toBeInstanceOf(DeleteTodoUseCase);
    expect(toggleUseCase).toBeInstanceOf(ToggleTodoUseCase);
  });

  it('should register all query handlers', () => {
    configureDI();
    
    const getAllHandler = container.resolve(TOKENS.GetAllTodosQueryHandler);
    const getFilteredHandler = container.resolve(TOKENS.GetFilteredTodosQueryHandler);
    const getStatsHandler = container.resolve(TOKENS.GetTodoStatsQueryHandler);
    const getByIdHandler = container.resolve(TOKENS.GetTodoByIdQueryHandler);
    
    expect(getAllHandler).toBeInstanceOf(GetAllTodosQueryHandler);
    expect(getFilteredHandler).toBeInstanceOf(GetFilteredTodosQueryHandler);
    expect(getStatsHandler).toBeInstanceOf(GetTodoStatsQueryHandler);
    expect(getByIdHandler).toBeInstanceOf(GetTodoByIdQueryHandler);
  });

  it('should register CQRS services', () => {
    configureDI();
    
    const commandService = container.resolve(TOKENS.TodoCommandService);
    const queryService = container.resolve(TOKENS.TodoQueryService);
    
    expect(commandService).toBeInstanceOf(TodoCommandService);
    expect(queryService).toBeInstanceOf(TodoQueryService);
  });

  it('should provide singleton instances for all services', () => {
    configureDI();
    
    // Test command use cases
    const create1 = container.resolve(TOKENS.CreateTodoUseCase);
    const create2 = container.resolve(TOKENS.CreateTodoUseCase);
    expect(create1).toBe(create2);
    
    // Test query handlers
    const getAll1 = container.resolve(TOKENS.GetAllTodosQueryHandler);
    const getAll2 = container.resolve(TOKENS.GetAllTodosQueryHandler);
    expect(getAll1).toBe(getAll2);
    
    // Test CQRS services
    const cmd1 = container.resolve(TOKENS.TodoCommandService);
    const cmd2 = container.resolve(TOKENS.TodoCommandService);
    expect(cmd1).toBe(cmd2);
  });

  it('should have all required tokens defined', () => {
    const requiredTokens = [
      'TodoRepository',
      'CreateTodoUseCase',
      'UpdateTodoUseCase', 
      'DeleteTodoUseCase',
      'ToggleTodoUseCase',
      'GetAllTodosQueryHandler',
      'GetFilteredTodosQueryHandler',
      'GetTodoStatsQueryHandler',
      'GetTodoByIdQueryHandler',
      'TodoCommandService',
      'TodoQueryService'
    ];
    
    requiredTokens.forEach(tokenName => {
      expect(TOKENS[tokenName as keyof typeof TOKENS]).toBeDefined();
      expect(typeof TOKENS[tokenName as keyof typeof TOKENS]).toBe('string');
    });
  });

  it('should be callable multiple times without errors', () => {
    expect(() => {
      configureDI();
      configureDI();
      configureDI();
    }).not.toThrow();
  });
});