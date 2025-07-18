import { injectable, inject } from 'tsyringe';
import type { ITodoRepository } from '@/core/domain/todo/repositories/ITodoRepository';
import type { ToggleTodoCommand } from '@/core/application/todo/dto/TodoCommands';
import { TodoNotFoundException } from '@/core/domain/todo/exceptions/DomainExceptions';
import { TOKENS } from '@/core/infrastructure/di/tokens';
import { Todo } from '@/core/domain/todo/entities/Todo';

/**
 * Use case for toggling the completion state of a todo
 */
@injectable()
export class ToggleTodoUseCase {
  constructor(@inject(TOKENS.TodoRepository) private todoRepository: ITodoRepository) {}

  async execute(command: ToggleTodoCommand): Promise<Todo> {
    // Check if todo exists
    const existingTodo = await this.todoRepository.getById(command.id);
    if (!existingTodo) {
      throw new TodoNotFoundException(command.id);
    }

    // Toggle completion state
    await this.todoRepository.update(command.id, {
      completed: !existingTodo.completed,
    });

    // Return the updated todo
    const updatedTodo = await this.todoRepository.getById(command.id);
    return updatedTodo!;
  }
}
