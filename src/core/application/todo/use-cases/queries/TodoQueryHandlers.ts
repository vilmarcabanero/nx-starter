import { injectable, inject } from 'tsyringe';
import { Todo } from '@/core/domain/todo/entities/Todo';
import { TodoDomainService } from '@/core/domain/todo/services/TodoDomainService';
import { 
  ActiveTodoSpecification, 
  CompletedTodoSpecification, 
  OverdueTodoSpecification,
  HighPriorityTodoSpecification 
} from '@/core/domain/todo/specifications/TodoSpecifications';
import type { ITodoRepository } from '@/core/domain/todo/repositories/ITodoRepository';
import type { 
  GetFilteredTodosQuery, 
  GetTodoByIdQuery,
  TodoStatsQueryResult
} from '@/core/application/todo/dto/TodoQueries';

/**
 * Query handler for getting all todos
 */
@injectable()
export class GetAllTodosQueryHandler {
  constructor(
    @inject('ITodoRepository') private todoRepository: ITodoRepository
  ) {}

  async handle(): Promise<Todo[]> {
    return await this.todoRepository.getAll();
  }
}

/**
 * Query handler for getting filtered todos
 */
@injectable()
export class GetFilteredTodosQueryHandler {
  constructor(
    @inject('ITodoRepository') private todoRepository: ITodoRepository
  ) {}

  async handle(query: GetFilteredTodosQuery): Promise<Todo[]> {
    const allTodos = await this.todoRepository.getAll();
    
    // Apply filter using specifications
    let filteredTodos: Todo[];
    
    switch (query.filter) {
      case 'active': {
        const activeSpec = new ActiveTodoSpecification();
        filteredTodos = allTodos.filter(todo => activeSpec.isSatisfiedBy(todo));
        break;
      }
      case 'completed': {
        const completedSpec = new CompletedTodoSpecification();
        filteredTodos = allTodos.filter(todo => completedSpec.isSatisfiedBy(todo));
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
 * Query handler for getting todo statistics
 */
@injectable()
export class GetTodoStatsQueryHandler {
  constructor(
    @inject('ITodoRepository') private todoRepository: ITodoRepository
  ) {}

  async handle(): Promise<TodoStatsQueryResult> {
    const allTodos = await this.todoRepository.getAll();
    
    const activeSpec = new ActiveTodoSpecification();
    const completedSpec = new CompletedTodoSpecification();
    const overdueSpec = new OverdueTodoSpecification();
    const highPrioritySpec = new HighPriorityTodoSpecification();

    return {
      total: allTodos.length,
      active: allTodos.filter(todo => activeSpec.isSatisfiedBy(todo)).length,
      completed: allTodos.filter(todo => completedSpec.isSatisfiedBy(todo)).length,
      overdue: allTodos.filter(todo => overdueSpec.isSatisfiedBy(todo)).length,
      highPriority: allTodos.filter(todo => highPrioritySpec.isSatisfiedBy(todo)).length,
    };
  }
}

/**
 * Query handler for getting a single todo by ID
 */
@injectable()
export class GetTodoByIdQueryHandler {
  constructor(
    @inject('ITodoRepository') private todoRepository: ITodoRepository
  ) {}

  async handle(query: GetTodoByIdQuery): Promise<Todo | null> {
    const todo = await this.todoRepository.getById(query.id);
    return todo || null;
  }
}
