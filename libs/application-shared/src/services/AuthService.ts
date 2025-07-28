import { LoginUserCommand, LoginUserResponseDto } from '../dto';

/**
 * Authentication Command Service Interface
 * Handles authentication-related command operations following CQRS pattern
 */
export interface IAuthCommandService {
  /**
   * Process user login
   */
  login(command: LoginUserCommand): Promise<LoginUserResponseDto>;
}

/**
 * Authentication Query Service Interface
 * Handles authentication-related query operations following CQRS pattern
 */
export interface IAuthQueryService {
  /**
   * Validate JWT token
   */
  validateToken(token: string): Promise<boolean>;
  
  /**
   * Get current user from token
   */
  getCurrentUser(token: string): Promise<any>;
}