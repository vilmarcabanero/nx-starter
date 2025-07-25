import { injectable, inject } from 'tsyringe';
import { ValidationService, IValidationService } from './ValidationService';
import { TOKENS } from '../di/tokens';
import {
  CreateTodoCommandSchema,
  UpdateTodoCommandSchema,
  DeleteTodoCommandSchema,
  ToggleTodoCommandSchema,
  CreateTodoCommand,
  UpdateTodoCommand,
  DeleteTodoCommand,
  ToggleTodoCommand,
} from './TodoValidationSchemas';

/**
 * Validation service for CreateTodoCommand
 * Encapsulates validation logic for creating new todos
 */
@injectable()
export class CreateTodoValidationService extends ValidationService<unknown, CreateTodoCommand> {
  protected schema = CreateTodoCommandSchema;
}

/**
 * Validation service for UpdateTodoCommand
 * Encapsulates validation logic for updating existing todos
 */
@injectable()
export class UpdateTodoValidationService extends ValidationService<unknown, UpdateTodoCommand> {
  protected schema = UpdateTodoCommandSchema;
}

/**
 * Validation service for DeleteTodoCommand
 * Encapsulates validation logic for deleting todos
 */
@injectable()
export class DeleteTodoValidationService extends ValidationService<unknown, DeleteTodoCommand> {
  protected schema = DeleteTodoCommandSchema;
}

/**
 * Validation service for ToggleTodoCommand
 * Encapsulates validation logic for toggling todo completion status
 */
@injectable()
export class ToggleTodoValidationService extends ValidationService<unknown, ToggleTodoCommand> {
  protected schema = ToggleTodoCommandSchema;
}


/**
 * Composite validation service that provides all Todo validation operations
 * Follows the Facade pattern to provide a unified interface for Todo validation
 */
@injectable()
export class TodoValidationService {
  constructor(
    @inject(TOKENS.CreateTodoValidationService)
    private createValidator: CreateTodoValidationService,
    @inject(TOKENS.UpdateTodoValidationService)
    private updateValidator: UpdateTodoValidationService,
    @inject(TOKENS.DeleteTodoValidationService)
    private deleteValidator: DeleteTodoValidationService,
    @inject(TOKENS.ToggleTodoValidationService)
    private toggleValidator: ToggleTodoValidationService
  ) {}

  /**
   * Validates data for creating a new todo
   */
  validateCreateCommand(data: unknown): CreateTodoCommand {
    return this.createValidator.validate(data);
  }

  /**
   * Validates data for updating an existing todo
   */
  validateUpdateCommand(data: unknown): UpdateTodoCommand {
    return this.updateValidator.validate(data);
  }

  /**
   * Validates data for deleting a todo
   */
  validateDeleteCommand(data: unknown): DeleteTodoCommand {
    return this.deleteValidator.validate(data);
  }

  /**
   * Validates data for toggling todo completion
   */
  validateToggleCommand(data: unknown): ToggleTodoCommand {
    return this.toggleValidator.validate(data);
  }

  /**
   * Safe validation methods that don't throw exceptions
   */
  safeValidateCreateCommand(data: unknown) {
    return this.createValidator.safeParse(data);
  }

  safeValidateUpdateCommand(data: unknown) {
    return this.updateValidator.safeParse(data);
  }

  safeValidateDeleteCommand(data: unknown) {
    return this.deleteValidator.safeParse(data);
  }

  safeValidateToggleCommand(data: unknown) {
    return this.toggleValidator.safeParse(data);
  }
}

// Export interfaces for dependency injection
export type ICreateTodoValidationService = IValidationService<unknown, CreateTodoCommand>;
export type IUpdateTodoValidationService = IValidationService<unknown, UpdateTodoCommand>;
export type IDeleteTodoValidationService = IValidationService<unknown, DeleteTodoCommand>;
export type IToggleTodoValidationService = IValidationService<unknown, ToggleTodoCommand>;