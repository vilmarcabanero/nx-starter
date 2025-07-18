import { injectable, inject } from 'tsyringe';
import type { ITodoRepository } from '@/core/domain/todo/repositories/ITodoRepository';
import type { UpdateTodoCommand } from '@/core/application/todo/dto/TodoCommands';
import { TodoNotFoundException } from '@/core/domain/todo/exceptions/DomainExceptions';
import { TOKENS } from '@/core/infrastructure/di/tokens';

/**
 * Use case for updating an existing todo
 */
@injectable()
export class UpdateTodoUseCase {
  constructor(@inject(TOKENS.TodoRepository) private todoRepository: ITodoRepository) {}

  async execute(command: UpdateTodoCommand): Promise<void> {
    // Check if todo exists
    const existingTodo = await this.todoRepository.getById(command.id);
    if (!existingTodo) {
      throw new TodoNotFoundException(command.id);
    }

    // Prepare updates (exclude undefined values)
    const updates: Partial<any> = {};

    if (command.title !== undefined) {
      updates.title = command.title;
    }

    if (command.completed !== undefined) {
      updates.completed = command.completed;
    }

    if (command.priority !== undefined) {
      updates.priority = command.priority;
    }

    if (command.dueDate !== undefined) {
      updates.dueDate = command.dueDate;
    }

    // Update through repository
    await this.todoRepository.update(command.id, updates);
  }
}
