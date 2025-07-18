import { injectable, inject } from 'tsyringe';
import { Todo } from '@/core/domain/todo/entities/Todo';
import { TodoTitle } from '@/core/domain/todo/value-objects/TodoTitle';
import type { ITodoRepository } from '@/core/domain/todo/repositories/ITodoRepository';
import type { CreateTodoCommand } from '@/core/application/todo/dto/TodoCommands';
import { TOKENS } from '@/core/infrastructure/di/tokens';

/**
 * Use case for creating a new todo
 * Handles all business logic and validation for todo creation
 */
@injectable()
export class CreateTodoUseCase {
  constructor(@inject(TOKENS.TodoRepository) private todoRepository: ITodoRepository) {}

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
    return new Todo(title, todo.completed, todo.createdAt, id, todo.priority.level, todo.dueDate);
  }
}
