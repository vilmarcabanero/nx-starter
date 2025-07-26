import { injectable, inject } from 'tsyringe';
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
} from 'routing-controllers';
import {
  CreateTodoUseCase,
  UpdateTodoUseCase,
  DeleteTodoUseCase,
  ToggleTodoUseCase,
  GetAllTodosQueryHandler,
  GetActiveTodosQueryHandler,
  GetCompletedTodosQueryHandler,
  GetTodoByIdQueryHandler,
  GetTodoStatsQueryHandler,
  TodoMapper,
  TOKENS,
  TodoValidationService,
  TodoIdSchema,
} from '@nx-starter/application-shared';
import {
  TodoListResponse,
  TodoResponse,
  TodoStatsResponse,
  TodoOperationResponse,
  CreateTodoRequestDto,
  UpdateTodoRequestDto,
} from '@nx-starter/application-shared';
import { ApiResponseBuilder } from '../dto/ApiResponse';

/**
 * REST API Controller for Todo operations
 * Follows Clean Architecture - Controllers are part of the presentation layer
 */
@Controller('/todos')
@injectable()
export class TodoController {
  constructor(
    @inject(TOKENS.CreateTodoUseCase)
    private createTodoUseCase: CreateTodoUseCase,
    @inject(TOKENS.UpdateTodoUseCase)
    private updateTodoUseCase: UpdateTodoUseCase,
    @inject(TOKENS.DeleteTodoUseCase)
    private deleteTodoUseCase: DeleteTodoUseCase,
    @inject(TOKENS.ToggleTodoUseCase)
    private toggleTodoUseCase: ToggleTodoUseCase,
    @inject(TOKENS.GetAllTodosQueryHandler)
    private getAllTodosQueryHandler: GetAllTodosQueryHandler,
    @inject(TOKENS.GetActiveTodosQueryHandler)
    private getActiveTodosQueryHandler: GetActiveTodosQueryHandler,
    @inject(TOKENS.GetCompletedTodosQueryHandler)
    private getCompletedTodosQueryHandler: GetCompletedTodosQueryHandler,
    @inject(TOKENS.GetTodoByIdQueryHandler)
    private getTodoByIdQueryHandler: GetTodoByIdQueryHandler,
    @inject(TOKENS.GetTodoStatsQueryHandler)
    private getTodoStatsQueryHandler: GetTodoStatsQueryHandler,
    @inject(TOKENS.TodoValidationService)
    private validationService: TodoValidationService
  ) {}

  /**
   * GET /api/todos - Get all todos
   */
  @Get('/')
  async getAllTodos(): Promise<TodoListResponse> {
    const todos = await this.getAllTodosQueryHandler.execute();
    const todoDtos = TodoMapper.toDtoArray(todos);

    return ApiResponseBuilder.success(todoDtos);
  }

  /**
   * GET /api/todos/active - Get active todos
   */
  @Get('/active')
  async getActiveTodos(): Promise<TodoListResponse> {
    const todos = await this.getActiveTodosQueryHandler.execute();
    const todoDtos = TodoMapper.toDtoArray(todos);

    return ApiResponseBuilder.success(todoDtos);
  }

  /**
   * GET /api/todos/completed - Get completed todos
   */
  @Get('/completed')
  async getCompletedTodos(): Promise<TodoListResponse> {
    const todos = await this.getCompletedTodosQueryHandler.execute();
    const todoDtos = TodoMapper.toDtoArray(todos);

    return ApiResponseBuilder.success(todoDtos);
  }

  /**
   * GET /api/todos/stats - Get todo statistics
   */
  @Get('/stats')
  async getTodoStats(): Promise<TodoStatsResponse> {
    const stats = await this.getTodoStatsQueryHandler.execute();

    return ApiResponseBuilder.success(stats);
  }

  /**
   * GET /api/todos/:id - Get todo by ID
   */
  @Get('/:id')
  async getTodoById(@Param('id') id: string): Promise<TodoResponse> {
    // Validate the ID parameter
    const validatedId = TodoIdSchema.parse(id);
    const todo = await this.getTodoByIdQueryHandler.execute({ id: validatedId });
    const todoDto = TodoMapper.toDto(todo);
    return ApiResponseBuilder.success(todoDto);
  }

  /**
   * POST /api/todos - Create a new todo
   */
  @Post('/')
  @HttpCode(201)
  async createTodo(@Body() body: CreateTodoRequestDto): Promise<TodoResponse> {
    const validatedData = this.validationService.validateCreateCommand(body);
    const todo = await this.createTodoUseCase.execute(validatedData);
    const todoDto = TodoMapper.toDto(todo);

    return ApiResponseBuilder.success(todoDto);
  }

  /**
   * PUT /api/todos/:id - Update a todo
   */
  @Put('/:id')
  async updateTodo(@Param('id') id: string, @Body() body: UpdateTodoRequestDto): Promise<TodoOperationResponse> {
    // Validate the combined data (body + id) using the validation service
    const validatedData = this.validationService.validateUpdateCommand({
      ...body,
      id,
    });

    await this.updateTodoUseCase.execute(validatedData);

    return ApiResponseBuilder.successWithMessage('Todo updated successfully');
  }

  /**
   * PATCH /api/todos/:id/toggle - Toggle todo completion
   */
  @Patch('/:id/toggle')
  async toggleTodo(@Param('id') id: string): Promise<TodoOperationResponse> {
    const validatedData = this.validationService.validateToggleCommand({ id });

    await this.toggleTodoUseCase.execute(validatedData);

    return ApiResponseBuilder.successWithMessage('Todo toggled successfully');
  }

  /**
   * DELETE /api/todos/:id - Delete a todo
   */
  @Delete('/:id')
  async deleteTodo(@Param('id') id: string): Promise<TodoOperationResponse> {
    const validatedData = this.validationService.validateDeleteCommand({ id });

    await this.deleteTodoUseCase.execute(validatedData);

    return ApiResponseBuilder.successWithMessage('Todo deleted successfully');
  }
}
