import { injectable, inject } from 'tsyringe';
import type { ITodoRepository } from '@/core/domain/todo/repositories/ITodoRepository';
import type { DeleteTodoCommand } from '@/core/application/todo/dto/TodoCommands';
import { TodoNotFoundException } from '@/core/domain/todo/exceptions/DomainExceptions';
import { TOKENS } from '@/core/infrastructure/di/tokens';

/**
 * Use case for deleting an existing todo
 */
@injectable()
export class DeleteTodoUseCase {
  constructor(
    @inject(TOKENS.TodoRepository) private todoRepository: ITodoRepository
  ) {}

  async execute(command: DeleteTodoCommand): Promise<void> {
    // Check if todo exists
    const existingTodo = await this.todoRepository.getById(command.id);
    if (!existingTodo) {
      throw new TodoNotFoundException(command.id);
    }

    // Delete through repository
    await this.todoRepository.delete(command.id);
  }
}