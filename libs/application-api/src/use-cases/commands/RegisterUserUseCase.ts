import { injectable, inject } from 'tsyringe';
import { User, IUserRepository, UserDomainService } from '@nx-starter/domain';
import { generateUUID } from '@nx-starter/utils-core';
import { RegisterUserCommand, TOKENS } from '@nx-starter/application-shared';
import { IPasswordHashingService } from '../../services/PasswordHashingService';

/**
 * Register User Use Case
 * Handles user registration following Clean Architecture principles
 */
@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject(TOKENS.UserRepository)
    private userRepository: IUserRepository,
    @inject(TOKENS.PasswordHashingService)
    private passwordHashingService: IPasswordHashingService
  ) {
    // Domain services are instantiated manually, not injected
    this.userDomainService = new UserDomainService(this.userRepository);
  }

  private userDomainService: UserDomainService;

  /**
   * Executes user registration
   * 1. Check email uniqueness
   * 2. Generate unique username from email
   * 3. Hash the password
   * 4. Create user entity with domain validation
   * 5. Persist user
   * 6. Returns created user
   */
  async execute(command: RegisterUserCommand): Promise<User> {
    // 1. Check email uniqueness (throws domain exception if exists)
    await this.userDomainService.validateEmailUniqueness(command.email);

    // 2. Generate unique username from email
    const username = await this.userDomainService.generateUniqueUsername(command.email);

    // 3. Hash the password
    const hashedPassword = await this.passwordHashingService.hash(command.password);

    // 4. Create user entity with domain validation
    const userId = generateUUID();
    const user = User.create(
      userId,
      command.firstName,
      command.lastName,
      command.email,
      username,
      hashedPassword
    );

    // 5. Persist user
    await this.userRepository.create(user);

    // 6. Return created user
    return user;
  }
}