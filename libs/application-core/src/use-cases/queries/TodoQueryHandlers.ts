import { injectable, inject } from 'tsyringe';
import {
  Todo,
  TodoDomainService,
  ActiveTodoSpecification,
  CompletedTodoSpecification,
  OverdueTodoSpecification,
  HighPriorityTodoSpecification,
  TodoNotFoundException,
} from '@nx-starter/domain';
import type { ITodoRepository } from '@nx-starter/domain';
import type {
  GetFilteredTodosQuery,
  GetTodoByIdQuery,
  TodoStatsQueryResult,
} from '../../dto/TodoQueries';
import { TOKENS } from '../../di/tokens';

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
 * Query handler for getting filtered todos
 */
@injectable()
export class GetFilteredTodosQueryHandler {
  constructor(
    @inject(TOKENS.TodoRepository) private todoRepository: ITodoRepository
  ) {}

  async execute(query: GetFilteredTodosQuery): Promise<Todo[]> {
    const allTodos = await this.todoRepository.getAll();

    // Apply filter using specifications
    let filteredTodos: Todo[];

    switch (query.filter) {
      case 'active': {
        const activeSpec = new ActiveTodoSpecification();
        filteredTodos = allTodos.filter((todo) =>
          activeSpec.isSatisfiedBy(todo)
        );
        break;
      }
      case 'completed': {
        const completedSpec = new CompletedTodoSpecification();
        filteredTodos = allTodos.filter((todo) =>
          completedSpec.isSatisfiedBy(todo)
        );
        break;
      }
      default:
        filteredTodos = allTodos;
    }

    // Apply sorting using domain service
    if (query.sortBy === 'priority' || query.sortBy === 'urgency') {
      filteredTodos = TodoDomainService.sortByPriority(filteredTodos);
      if (query.sortOrder === 'desc') {
        filteredTodos.reverse();
      }
    } else if (query.sortBy === 'createdAt') {
      filteredTodos.sort((a, b) => {
        const dateComparison = a.createdAt.getTime() - b.createdAt.getTime();
        return query.sortOrder === 'desc' ? -dateComparison : dateComparison;
      });
    }

    return filteredTodos;
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

  async execute(query: GetTodoByIdQuery): Promise<Todo> {
    const todo = await this.todoRepository.getById(query.id);
    if (!todo) {
      throw new TodoNotFoundException(query.id);
    }
    return todo;
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

  async execute(): Promise<TodoStatsQueryResult> {
    const allTodos = await this.todoRepository.getAll();

    const activeSpec = new ActiveTodoSpecification();
    const completedSpec = new CompletedTodoSpecification();
    const overdueSpec = new OverdueTodoSpecification();
    const highPrioritySpec = new HighPriorityTodoSpecification();

    return {
      total: allTodos.length,
      active: allTodos.filter((todo) => activeSpec.isSatisfiedBy(todo)).length,
      completed: allTodos.filter((todo) => completedSpec.isSatisfiedBy(todo))
        .length,
      overdue: allTodos.filter((todo) => overdueSpec.isSatisfiedBy(todo))
        .length,
      highPriority: allTodos.filter((todo) =>
        highPrioritySpec.isSatisfiedBy(todo)
      ).length,
    };
  }
}
