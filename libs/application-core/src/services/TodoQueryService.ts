import { injectable, inject } from 'tsyringe';
import type { Todo } from '@nx-starter/domain';
import type { ITodoQueryService } from '../interfaces/ITodoService';
import type {
  GetFilteredTodosQuery,
  GetTodoByIdQuery,
} from '../dto/TodoQueries';
import {
  GetAllTodosQueryHandler,
  GetFilteredTodosQueryHandler,
  GetActiveTodosQueryHandler,
  GetCompletedTodosQueryHandler,
  GetTodoStatsQueryHandler,
  GetTodoByIdQueryHandler,
} from '../use-cases/queries/TodoQueryHandlers';
import { TOKENS } from '../di/tokens';

/**
 * Query Service implementing Query Responsibility Segregation
 * Handles all read operations (Queries)
 * Follows Single Responsibility Principle
 */
@injectable()
export class TodoQueryService implements ITodoQueryService {
  constructor(
    @inject(TOKENS.GetAllTodosQueryHandler)
    private getAllTodosHandler: GetAllTodosQueryHandler,
    @inject(TOKENS.GetFilteredTodosQueryHandler)
    private getFilteredTodosHandler: GetFilteredTodosQueryHandler,
    @inject(TOKENS.GetActiveTodosQueryHandler)
    private getActiveTodosHandler: GetActiveTodosQueryHandler,
    @inject(TOKENS.GetCompletedTodosQueryHandler)
    private getCompletedTodosHandler: GetCompletedTodosQueryHandler,
    @inject(TOKENS.GetTodoStatsQueryHandler)
    private getTodoStatsHandler: GetTodoStatsQueryHandler,
    @inject(TOKENS.GetTodoByIdQueryHandler)
    private getTodoByIdHandler: GetTodoByIdQueryHandler
  ) {}

  async getAllTodos(): Promise<Todo[]> {
    return await this.getAllTodosHandler.execute();
  }

  async getActiveTodos(): Promise<Todo[]> {
    return await this.getActiveTodosHandler.execute();
  }

  async getCompletedTodos(): Promise<Todo[]> {
    return await this.getCompletedTodosHandler.execute();
  }

  async getTodoById(id: string): Promise<Todo> {
    const query: GetTodoByIdQuery = { id };
    return await this.getTodoByIdHandler.execute(query);
  }

  async getFilteredTodos(
    filter: 'all' | 'active' | 'completed',
    sortBy?: 'priority' | 'createdAt' | 'urgency'
  ): Promise<Todo[]> {
    const query: GetFilteredTodosQuery = { filter, sortBy };
    return await this.getFilteredTodosHandler.execute(query);
  }

  async getTodoStats(): Promise<{
    total: number;
    active: number;
    completed: number;
    overdue?: number;
    highPriority?: number;
  }> {
    const stats = await this.getTodoStatsHandler.execute();

    // Return full stats with optional backend-specific fields
    return {
      total: stats.total,
      active: stats.active,
      completed: stats.completed,
      overdue: stats.overdue,
      highPriority: stats.highPriority,
    };
  }
}
