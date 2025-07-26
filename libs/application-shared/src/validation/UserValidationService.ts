import { injectable, inject } from 'tsyringe';
import { ValidationService, IValidationService } from './ValidationService';
import { RegisterUserCommandSchema } from './UserValidationSchemas';
import { RegisterUserCommand } from '../dto/UserCommands';
import { TOKENS } from '../di/tokens';

/**
 * Validation service for RegisterUserCommand
 * Encapsulates validation logic for user registration
 */
@injectable()
export class RegisterUserValidationService extends ValidationService<unknown, RegisterUserCommand> {
  protected schema = RegisterUserCommandSchema;
}


/**
 * Composite validation service that provides all User validation operations
 * Follows the Facade pattern to provide a unified interface for User validation
 */
@injectable()
export class UserValidationService {
  constructor(
    @inject(TOKENS.RegisterUserValidationService)
    private registerValidator: RegisterUserValidationService
  ) {}

  /**
   * Validates data for registering a new user
   */
  validateRegisterCommand(data: unknown): RegisterUserCommand {
    return this.registerValidator.validate(data);
  }

  /**
   * Safe validation methods that don't throw exceptions
   */
  safeValidateRegisterCommand(data: unknown) {
    return this.registerValidator.safeParse(data);
  }
}

// Export interfaces for dependency injection
export type IRegisterUserValidationService = IValidationService<unknown, RegisterUserCommand>;

