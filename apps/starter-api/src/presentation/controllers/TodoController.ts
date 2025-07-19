import { Response } from 'express';
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
  VALIDATION_TOKENS,
  CreateTodoCommandSchema,
  UpdateTodoCommandSchema,
  DeleteTodoCommandSchema,
  ToggleTodoCommandSchema,
  TodoIdSchema,
} from '@nx-starter/application-core';

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
    @inject(VALIDATION_TOKENS.TodoValidationService)
    private validationService: TodoValidationService
  ) {}

  /**
   * GET /api/todos - Get all todos
   */
  @Get('/')
  async getAllTodos(): Promise<any> {
    const todos = await this.getAllTodosQueryHandler.execute();
    const todoDtos = TodoMapper.toDtoArray(todos);

    return {
      success: true,
      data: todoDtos,
    };
  }

  /**
   * GET /api/todos/active - Get active todos
   */
  @Get('/active')
  async getActiveTodos(): Promise<any> {
    const todos = await this.getActiveTodosQueryHandler.execute();
    const todoDtos = TodoMapper.toDtoArray(todos);

    return {
      success: true,
      data: todoDtos,
    };
  }

  /**
   * GET /api/todos/completed - Get completed todos
   */
  @Get('/completed')
  async getCompletedTodos(): Promise<any> {
    const todos = await this.getCompletedTodosQueryHandler.execute();
    const todoDtos = TodoMapper.toDtoArray(todos);

    return {
      success: true,
      data: todoDtos,
    };
  }

  /**
   * GET /api/todos/stats - Get todo statistics
   */
  @Get('/stats')
  async getTodoStats(): Promise<any> {
    const stats = await this.getTodoStatsQueryHandler.execute();

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * GET /api/todos/:id - Get todo by ID
   */
  @Get('/:id')
  async getTodoById(@Param('id') id: string): Promise<any> {
    // Validate the ID parameter
    const validatedId = TodoIdSchema.parse(id);
    const todo = await this.getTodoByIdQueryHandler.execute({ id: validatedId });
    const todoDto = TodoMapper.toDto(todo);
    return {
      success: true,
      data: todoDto,
    };
  }

  /**
   * POST /api/todos - Create a new todo
   */
  @Post('/')
  @HttpCode(201)
  async createTodo(@Body() body: any): Promise<any> {
    const validatedData = this.validationService.validateCreateCommand(body);
    const todo = await this.createTodoUseCase.execute(validatedData);
    const todoDto = TodoMapper.toDto(todo);

    return {
      success: true,
      data: todoDto,
    };
  }

  /**
   * PUT /api/todos/:id - Update a todo
   */
  @Put('/:id')
  async updateTodo(@Param('id') id: string, @Body() body: any): Promise<any> {
    // Validate the combined data (body + id) using the validation service
    const validatedData = this.validationService.validateUpdateCommand({
      ...body,
      id,
    });

    await this.updateTodoUseCase.execute(validatedData);

    return {
      success: true,
      message: 'Todo updated successfully',
    };
  }

  /**
   * PATCH /api/todos/:id/toggle - Toggle todo completion
   */
  @Patch('/:id/toggle')
  async toggleTodo(@Param('id') id: string): Promise<any> {
    const validatedData = this.validationService.validateToggleCommand({ id });

    await this.toggleTodoUseCase.execute(validatedData);

    return {
      success: true,
      message: 'Todo toggled successfully',
    };
  }

  /**
   * DELETE /api/todos/:id - Delete a todo
   */
  @Delete('/:id')
  async deleteTodo(@Param('id') id: string): Promise<any> {
    const validatedData = this.validationService.validateDeleteCommand({ id });

    await this.deleteTodoUseCase.execute(validatedData);

    return {
      success: true,
      message: 'Todo deleted successfully',
    };
  }
}
