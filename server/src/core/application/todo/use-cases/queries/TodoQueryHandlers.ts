import { injectable, inject } from 'tsyringe';
import type { ITodoRepository } from '@/core/domain/todo/repositories/ITodoRepository';
import type { Todo } from '@/core/domain/todo/entities/Todo';
import type { TodoStatsDto } from '@/core/application/todo/dto/TodoDto';
import { TOKENS } from '@/core/infrastructure/di/tokens';

/**
 * Query handler for getting all todos
 */
@injectable()
export class GetAllTodosQueryHandler {
  constructor(
    @inject(TOKENS.TodoRepository) private todoRepository: ITodoRepository
  ) {}

  async execute(): Promise<Todo[]> {
    return await this.todoRepository.getAll();
  }
}

/**
 * Query handler for getting active todos
 */
@injectable()
export class GetActiveTodosQueryHandler {
  constructor(
    @inject(TOKENS.TodoRepository) private todoRepository: ITodoRepository
  ) {}

  async execute(): Promise<Todo[]> {
    return await this.todoRepository.getActive();
  }
}

/**
 * Query handler for getting completed todos
 */
@injectable()
export class GetCompletedTodosQueryHandler {
  constructor(
    @inject(TOKENS.TodoRepository) private todoRepository: ITodoRepository
  ) {}

  async execute(): Promise<Todo[]> {
    return await this.todoRepository.getCompleted();
  }
}

/**
 * Query handler for getting todo by ID
 */
@injectable()
export class GetTodoByIdQueryHandler {
  constructor(
    @inject(TOKENS.TodoRepository) private todoRepository: ITodoRepository
  ) {}

  async execute(id: string): Promise<Todo | undefined> {
    return await this.todoRepository.getById(id);
  }
}

/**
 * Query handler for getting todo statistics
 */
@injectable()
export class GetTodoStatsQueryHandler {
  constructor(
    @inject(TOKENS.TodoRepository) private todoRepository: ITodoRepository
  ) {}

  async execute(): Promise<TodoStatsDto> {
    const [total, active, completed] = await Promise.all([
      this.todoRepository.count(),
      this.todoRepository.countActive(),
      this.todoRepository.countCompleted()
    ]);

    return {
      total,
      active,
      completed
    };
  }
}