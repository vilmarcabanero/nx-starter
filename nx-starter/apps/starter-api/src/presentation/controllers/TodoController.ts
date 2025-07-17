import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
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
} from '@nx-starter/shared-application';
import { DomainException } from '@nx-starter/shared-domain';
import { TOKENS } from '../../infrastructure/di/tokens';
import { asyncHandler } from '../../shared/middleware/ErrorHandler';

/**
 * REST API Controller for Todo operations
 * Follows Clean Architecture - Controllers are part of the presentation layer
 */
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
  getAllTodos = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const todos = await this.getAllTodosQueryHandler.execute();
      const todoDtos = TodoMapper.toDtoArray(todos);

      res.json({
        success: true,
        data: todoDtos,
      });
    }
  );

  /**
   * GET /api/todos/active - Get active todos
   */
  getActiveTodos = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const todos = await this.getActiveTodosQueryHandler.execute();
      const todoDtos = TodoMapper.toDtoArray(todos);

      res.json({
        success: true,
        data: todoDtos,
      });
    }
  );

  /**
   * GET /api/todos/completed - Get completed todos
   */
  getCompletedTodos = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const todos = await this.getCompletedTodosQueryHandler.execute();
      const todoDtos = TodoMapper.toDtoArray(todos);

      res.json({
        success: true,
        data: todoDtos,
      });
    }
  );

  /**
   * GET /api/todos/stats - Get todo statistics
   */
  getTodoStats = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const stats = await this.getTodoStatsQueryHandler.execute();

      res.json({
        success: true,
        data: stats,
      });
    }
  );

  /**
   * GET /api/todos/:id - Get todo by ID
   */
  getTodoById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const todo = await this.getTodoByIdQueryHandler.execute({ id });

      if (!todo) {
        res.status(404).json({
          success: false,
          error: 'Todo not found',
        });
        return;
      }

      const todoDto = TodoMapper.toDto(todo);
      res.json({
        success: true,
        data: todoDto,
      });
    }
  );

  /**
   * POST /api/todos - Create a new todo
   */
  createTodo = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const validatedData = this.validationSchemas.CreateTodoCommandSchema
        ? this.validationSchemas.CreateTodoCommandSchema.parse(req.body)
        : req.body;
      const todo = await this.createTodoUseCase.execute(validatedData);
      const todoDto = TodoMapper.toDto(todo);

      res.status(201).json({
        success: true,
        data: todoDto,
      });
    }
  );

  /**
   * PUT /api/todos/:id - Update a todo
   */
  updateTodo = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const validatedData = this.validationSchemas.UpdateTodoCommandSchema
        ? this.validationSchemas.UpdateTodoCommandSchema.parse({
            ...req.body,
            id,
          })
        : { ...req.body, id };

      await this.updateTodoUseCase.execute(validatedData);

      res.json({
        success: true,
        message: 'Todo updated successfully',
      });
    }
  );

  /**
   * PATCH /api/todos/:id/toggle - Toggle todo completion
   */
  toggleTodo = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const validatedData = this.validationSchemas.ToggleTodoCommandSchema
        ? this.validationSchemas.ToggleTodoCommandSchema.parse({ id })
        : { id };

      await this.toggleTodoUseCase.execute(validatedData);

      res.json({
        success: true,
        message: 'Todo toggled successfully',
      });
    }
  );

  /**
   * DELETE /api/todos/:id - Delete a todo
   */
  deleteTodo = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const validatedData = this.validationSchemas.DeleteTodoCommandSchema
        ? this.validationSchemas.DeleteTodoCommandSchema.parse({ id })
        : { id };

      await this.deleteTodoUseCase.execute(validatedData);

      res.json({
        success: true,
        message: 'Todo deleted successfully',
      });
    }
  );
}
