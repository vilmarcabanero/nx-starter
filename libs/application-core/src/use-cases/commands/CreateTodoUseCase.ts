import { injectable, inject } from 'tsyringe';
import { Todo, TodoTitle } from '@nx-starter/domain';
import type { ITodoRepository } from '@nx-starter/domain';
import type { CreateTodoCommand } from '../../dto/TodoCommands';
import { TOKENS } from '../../di/tokens';

/**
 * Use case for creating a new todo
 * Handles all business logic and validation for todo creation
 */
@injectable()
export class CreateTodoUseCase {
  constructor(
    @inject(TOKENS.TodoRepository) private todoRepository: ITodoRepository
  ) {}

  async execute(command: CreateTodoCommand): Promise<Todo> {
    // Validate command using value objects (domain validation)
    const title = new TodoTitle(command.title);

    // Create todo entity with domain logic
    const todo = new Todo(
      title,
      false, // new todos are always incomplete
      new Date(),
      undefined, // no ID yet
      command.priority || 'medium',
      command.dueDate
    );

    // Validate business invariants
    todo.validate();

    // Persist using repository
    const id = await this.todoRepository.create(todo);

    // Return the created todo with ID
    return new Todo(
      title,
      todo.completed,
      todo.createdAt,
      id,
      todo.priority.level,
      todo.dueDate
    );
  }
}
