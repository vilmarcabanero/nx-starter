import { injectable, inject } from 'tsyringe';
import { ValidationService, IValidationService } from './ValidationService';
import { RegisterUserCommandSchema, LoginUserCommandSchema } from './UserValidationSchemas';
import { RegisterUserCommand, LoginUserCommand } from '../dto/UserCommands';
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
 * Validation service for LoginUserCommand
 * Encapsulates validation logic for user login
 */
@injectable()
export class LoginUserValidationService extends ValidationService<unknown, LoginUserCommand> {
  protected schema = LoginUserCommandSchema;
}


/**
 * Composite validation service that provides all User validation operations
 * Follows the Facade pattern to provide a unified interface for User validation
 */
@injectable()
export class UserValidationService {
  constructor(
    @inject(TOKENS.RegisterUserValidationService)
    private registerValidator: RegisterUserValidationService,
    @inject(TOKENS.LoginUserValidationService)
    private loginValidator: LoginUserValidationService
  ) {}

  /**
   * Validates data for registering a new user
   */
  validateRegisterCommand(data: unknown): RegisterUserCommand {
    return this.registerValidator.validate(data);
  }

  /**
   * Validates data for logging in a user
   */
  validateLoginCommand(data: unknown): LoginUserCommand {
    return this.loginValidator.validate(data);
  }

  /**
   * Safe validation methods that don't throw exceptions
   */
  safeValidateRegisterCommand(data: unknown) {
    return this.registerValidator.safeParse(data);
  }

  safeValidateLoginCommand(data: unknown) {
    return this.loginValidator.safeParse(data);
  }
}

// Export interfaces for dependency injection
export type IRegisterUserValidationService = IValidationService<unknown, RegisterUserCommand>;
export type ILoginUserValidationService = IValidationService<unknown, LoginUserCommand>;

