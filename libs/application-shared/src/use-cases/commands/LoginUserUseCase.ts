import { LoginUserCommand, LoginUserResponseDto, TOKENS } from '../..';

/**
 * Login User Use Case Interface
 * Defines the contract for user authentication
 */
export interface ILoginUserUseCase {
  execute(command: LoginUserCommand): Promise<LoginUserResponseDto>;
}