import { injectable, inject } from 'tsyringe';
import { Todo, TodoNotFoundException } from '@nx-starter/domain';
import type { ITodoRepository } from '@nx-starter/domain';
import type { ToggleTodoCommand } from '../../dto/TodoCommands';
import { TOKENS } from '../../di/tokens';

/**
 * Use case for toggling the completion state of a todo
 * Handles business logic for todo completion/incompletion
 */
@injectable()
export class ToggleTodoUseCase {
  constructor(
    @inject(TOKENS.TodoRepository) private todoRepository: ITodoRepository
  ) {}

  async execute(command: ToggleTodoCommand): Promise<Todo> {
    // Business logic: Check if todo exists
    const existingTodo = await this.todoRepository.getById(command.id);
    if (!existingTodo) {
      throw new TodoNotFoundException(command.id);
    }

    // Use domain method for toggling (rich domain logic)
    const toggledTodo = existingTodo.toggle();

    // Validate business invariants
    toggledTodo.validate();

    // Additional business logic could be added here:
    // - Check permissions
    // - Log completion event
    // - Send notifications
    // - Update completion timestamp
    // - Check dependencies (block completion if subtasks incomplete)
    // - Award points/achievements for completion

    // Persist changes
    await this.todoRepository.update(command.id, {
      completed: toggledTodo.completed,
    });

    return toggledTodo;
  }
}
