import { injectable, inject } from 'tsyringe';
import { TodoNotFoundException } from '@nx-starter/domain';
import type { ITodoRepository } from '@nx-starter/domain';
import type { DeleteTodoCommand } from '../../dto/TodoCommands';
import { TOKENS } from '../../di/tokens';

/**
 * Use case for deleting an existing todo
 * Handles business logic and validation for todo deletion
 */
@injectable()
export class DeleteTodoUseCase {
  constructor(
    @inject(TOKENS.TodoRepository) private todoRepository: ITodoRepository
  ) {}

  async execute(command: DeleteTodoCommand): Promise<void> {
    // Business logic: Check if todo exists before deletion
    const existingTodo = await this.todoRepository.getById(command.id);
    if (!existingTodo) {
      throw new TodoNotFoundException(command.id);
    }

    // Additional business logic could be added here:
    // - Check permissions
    // - Log deletion event
    // - Send notifications
    // - Archive instead of delete (soft delete)
    // - Check dependencies

    await this.todoRepository.delete(command.id);
  }
}
