import { injectable, inject } from 'tsyringe';
import {
  Controller,
  Delete,
  HttpCode,
} from 'routing-controllers';
import {
  GetAllTodosQueryHandler,
  DeleteTodoUseCase,
  TOKENS,
} from '@nx-starter/application-shared';
import type { ITodoRepository } from '@nx-starter/domain';
import {
  TodoOperationResponse,
} from '@nx-starter/application-shared';
import { ApiResponseBuilder } from '../dto/ApiResponse';

/**
 * Test-specific endpoints for e2e testing
 * Only available in development and test environments
 */
@Controller('/test')
@injectable()
export class TestController {
  constructor(
    @inject(TOKENS.GetAllTodosQueryHandler)
    private getAllTodosQueryHandler: GetAllTodosQueryHandler,
    @inject(TOKENS.DeleteTodoUseCase)
    private deleteTodoUseCase: DeleteTodoUseCase,
    @inject(TOKENS.TodoRepository)
    private todoRepository: ITodoRepository
  ) {}

  /**
   * DELETE /api/test/todos - Clear all todos (testing only)
   * This endpoint is only available in development/test environments
   */
  @Delete('/todos')
  @HttpCode(200)
  async clearAllTodos(): Promise<TodoOperationResponse> {
    // Check if repository has clear method (for in-memory repository)
    if ('clear' in this.todoRepository && typeof this.todoRepository.clear === 'function') {
      await (this.todoRepository as any).clear();
    } else {
      // Fallback: delete all todos one by one
      const todos = await this.getAllTodosQueryHandler.execute();
      for (const todo of todos) {
        await this.deleteTodoUseCase.execute({ id: todo.id.value });
      }
    }

    return ApiResponseBuilder.successWithMessage('All todos cleared successfully');
  }
}