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
  createCommandValidationSchema,
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
} from '@nx-starter/application-core';
import { DomainException } from '@nx-starter/domain-core';

/**
 * REST API Controller for Todo operations
 * Follows Clean Architecture - Controllers are part of the presentation layer
 */
@Controller('/todos')
@injectable()
export class TodoController {
  private validationSchemas = createCommandValidationSchema();

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
    private getTodoStatsQueryHandler: GetTodoStatsQueryHandler
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
    const todo = await this.getTodoByIdQueryHandler.execute({ id });

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
    const validatedData = this.validationSchemas.CreateTodoCommandSchema
      ? this.validationSchemas.CreateTodoCommandSchema.parse(body)
      : body;
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
    const validatedData = this.validationSchemas.UpdateTodoCommandSchema
      ? this.validationSchemas.UpdateTodoCommandSchema.parse({
          ...body,
          id,
        })
      : { ...body, id };

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
    const validatedData = this.validationSchemas.ToggleTodoCommandSchema
      ? this.validationSchemas.ToggleTodoCommandSchema.parse({ id })
      : { id };

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
    const validatedData = this.validationSchemas.DeleteTodoCommandSchema
      ? this.validationSchemas.DeleteTodoCommandSchema.parse({ id })
      : { id };

    await this.deleteTodoUseCase.execute(validatedData);

    return {
      success: true,
      message: 'Todo deleted successfully',
    };
  }
}
