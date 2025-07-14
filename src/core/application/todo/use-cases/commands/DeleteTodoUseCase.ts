import { injectable, inject } from 'tsyringe';
import type { ITodoRepository } from '@/core/domain/todo/repositories/ITodoRepository';
import type { DeleteTodoCommand } from '@/core/application/todo/dto/TodoCommands';
import { TOKENS } from '@/core/infrastructure/di/tokens';

/**
 * Use Case for deleting a Todo item
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
      throw new Error('Todo not found');
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
