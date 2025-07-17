import { injectable, inject } from 'tsyringe';
import type { Todo } from '@/core/domain/todo/entities/Todo';
import type { ITodoCommandService, CreateTodoData, UpdateTodoData } from '@/core/application/shared/interfaces/ITodoService';
import type { CreateTodoCommand, UpdateTodoCommand, DeleteTodoCommand, ToggleTodoCommand } from '@/core/application/todo/dto/TodoCommands';
import { CreateTodoUseCase } from '@/core/application/todo/use-cases/commands/CreateTodoUseCase';
import { UpdateTodoUseCase } from '@/core/application/todo/use-cases/commands/UpdateTodoUseCase';
import { DeleteTodoUseCase } from '@/core/application/todo/use-cases/commands/DeleteTodoUseCase';
import { ToggleTodoUseCase } from '@/core/application/todo/use-cases/commands/ToggleTodoUseCase';
import { TOKENS } from '@/core/infrastructure/di/tokens';

/**
 * Command Service implementing Command Responsibility Segregation
 * Handles all write operations (Create, Update, Delete)
 * Follows Single Responsibility Principle and Clean Architecture
 */
@injectable()
export class TodoCommandService implements ITodoCommandService {
  constructor(
    @inject(TOKENS.CreateTodoUseCase) private createTodoUseCase: CreateTodoUseCase,
    @inject(TOKENS.UpdateTodoUseCase) private updateTodoUseCase: UpdateTodoUseCase,
    @inject(TOKENS.DeleteTodoUseCase) private deleteTodoUseCase: DeleteTodoUseCase,
    @inject(TOKENS.ToggleTodoUseCase) private toggleTodoUseCase: ToggleTodoUseCase
  ) {}

  async createTodo(data: CreateTodoData): Promise<Todo> {
    const command: CreateTodoCommand = {
      title: data.title,
      priority: data.priority,
      dueDate: data.dueDate
    };
    return await this.createTodoUseCase.execute(command);
  }

  async updateTodo(id: string, updates: UpdateTodoData): Promise<Todo> {
    const command: UpdateTodoCommand = {
      id,
      title: updates.title,
      completed: updates.completed,
      priority: updates.priority,
      dueDate: updates.dueDate
    };
    return await this.updateTodoUseCase.execute(command);
  }

  async deleteTodo(id: string): Promise<void> {
    const command: DeleteTodoCommand = { id };
    return await this.deleteTodoUseCase.execute(command);
  }

  async toggleTodo(id: string): Promise<Todo> {
    const command: ToggleTodoCommand = { id };
    return await this.toggleTodoUseCase.execute(command);
  }
}