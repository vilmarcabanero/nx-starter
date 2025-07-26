import { injectable, inject } from 'tsyringe';
import { 
  User, 
  IUserRepository, 
  AuthInvalidCredentialsException 
} from '@nx-starter/domain';
import { LoginUserCommand, TOKENS } from '@nx-starter/application-shared';
import { IPasswordHashingService } from '../../services/PasswordHashingService';
import { IJwtService } from '../../services/JwtService';

/**
 * Login User Use Case
 * Handles user authentication following Clean Architecture principles
 */
@injectable()
export class LoginUserUseCase {
  constructor(
    @inject(TOKENS.UserRepository)
    private userRepository: IUserRepository,
    @inject(TOKENS.PasswordHashingService)
    private passwordHashingService: IPasswordHashingService,
    @inject(TOKENS.JwtService)
    private jwtService: IJwtService
  ) {}

  /**
   * Executes user login
   * 1. Find user by email or username
   * 2. Verify password
   * 3. Generate JWT token
   * 4. Return token with user profile
   */
  async execute(command: LoginUserCommand): Promise<{ token: string; user: User }> {
    // 1. Find user by email or username
    const user = await this.userRepository.getByEmailOrUsername(command.identifier);
    
    if (!user) {
      throw new AuthInvalidCredentialsException();
    }

    // 2. Verify password
    const isPasswordValid = await this.passwordHashingService.compare(
      command.password, 
      user.hashedPassword.value
    );

    if (!isPasswordValid) {
      throw new AuthInvalidCredentialsException();
    }

    // 3. Generate JWT token
    const token = this.jwtService.generateToken({
      userId: user.id,
      email: user.email.value,
      role: 'user' // Default role, can be enhanced later
    });

    // 4. Return token with user profile
    return {
      token,
      user
    };
  }
}