import { LoginUserCommand, LoginUserResponseDto } from '@nx-starter/application-shared';

/**
 * Authentication API Service Interface
 * Defines the contract for authentication-related API operations
 */
export interface IAuthApiService {
  /**
   * Login user with credentials
   */
  login(command: LoginUserCommand): Promise<LoginUserResponseDto>;
  
  /**
   * Validate JWT token
   */
  validateToken(token: string): Promise<{ valid: boolean; user?: any }>;
  
  /**
   * Refresh JWT token
   */
  refreshToken(refreshToken: string): Promise<{ token: string }>;
}