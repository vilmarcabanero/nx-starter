import { injectable, inject } from 'tsyringe';
import { IAuthCommandService } from '@nx-starter/application-shared';
import { IAuthApiService } from '../api/IAuthApiService';
import {
  LoginUserCommand,
  LoginUserResponseDto,
  TOKENS,
} from '@nx-starter/application-shared';
import { extractErrorMessage } from '../utils/ErrorMapping';

/**
 * Authentication Command Service Implementation
 * Handles authentication command operations following CQRS pattern
 */
@injectable()
export class AuthCommandService implements IAuthCommandService {
  constructor(
    @inject(TOKENS.AuthApiService) private readonly authApiService: IAuthApiService
  ) {}

  async login(command: LoginUserCommand): Promise<LoginUserResponseDto> {
    try {
      return await this.authApiService.login(command);
    } catch (error: unknown) {
      // Use the unified error extraction utility that handles typed errors
      const errorMessage = extractErrorMessage(error);
      throw new Error(errorMessage);
    }
  }
}