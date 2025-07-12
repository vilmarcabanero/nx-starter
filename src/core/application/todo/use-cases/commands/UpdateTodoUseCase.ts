import { injectable, inject } from 'tsyringe';
import { Todo } from '@/core/domain/todo/entities/Todo';
import type { ITodoRepository } from '@/core/domain/todo/repositories/ITodoRepository';
import type { UpdateTodoCommand } from '@/core/application/todo/dto/TodoCommands';

/**
 * Use case for updating an existing todo
 * Handles all business logic and validation for todo updates
 */
@injectable()
export class UpdateTodoUseCase {
  constructor(
    @inject('ITodoRepository') private todoRepository: ITodoRepository
  ) {}

  async execute(command: UpdateTodoCommand): Promise<Todo> {
    // Get existing todo
    const existingTodo = await this.todoRepository.getById(command.id);
    if (!existingTodo) {
      throw new Error('Todo not found');
    }

    // Create updated todo using domain methods
    let updatedTodo = existingTodo;

    if (command.title !== undefined) {
      updatedTodo = updatedTodo.updateTitle(command.title);
    }

    if (command.priority !== undefined) {
      updatedTodo = updatedTodo.updatePriority(command.priority);
    }

    if (command.completed !== undefined) {
      if (command.completed && !updatedTodo.completed) {
        // Use domain method for completion
        updatedTodo = updatedTodo.complete();
      } else if (!command.completed && updatedTodo.completed) {
        // Toggle back to incomplete
        updatedTodo = updatedTodo.toggle();
      }
    }

    if (command.dueDate !== undefined) {
      updatedTodo = updatedTodo.updateDueDate(command.dueDate);
    }

    // Validate business invariants after all updates
    updatedTodo.validate();

    // Persist changes
    await this.todoRepository.update(command.id, {
      title: updatedTodo.title,
      completed: updatedTodo.completed,
      priority: updatedTodo.priority,
      dueDate: updatedTodo.dueDate
    });

    return updatedTodo;
  }
}
