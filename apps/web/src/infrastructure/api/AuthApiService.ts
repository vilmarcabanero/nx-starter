import { injectable, inject } from 'tsyringe';
import { IHttpClient } from '../http/IHttpClient';
import { IAuthApiService } from './IAuthApiService';
import { getApiConfig } from './config/ApiConfig';
import {
  LoginUserCommand,
  LoginUserResponseDto,
  ApiSuccessResponse,
  TOKENS,
} from '@nx-starter/application-shared';

@injectable()
export class AuthApiService implements IAuthApiService {
  private readonly apiConfig = getApiConfig();

  constructor(
    @inject(TOKENS.HttpClient) private readonly httpClient: IHttpClient
  ) {}

  async login(command: LoginUserCommand): Promise<LoginUserResponseDto> {
    if (!this.apiConfig.endpoints.auth) {
      throw new Error('Authentication endpoints not configured');
    }
    
    // Transform LoginUserCommand to LoginUserRequestDto
    // Determine if identifier is email or username
    const isEmail = command.identifier.includes('@');
    const requestDto = {
      password: command.password,
      ...(isEmail ? { email: command.identifier } : { username: command.identifier })
    };
    
    const response = await this.httpClient.post<ApiSuccessResponse<LoginUserResponseDto>>(
      this.apiConfig.endpoints.auth.login,
      requestDto
    );
    
    if (!response.data) {
      throw new Error('Login failed - no response data');
    }
    
    // Extract the actual login data from the API response wrapper
    const apiResponse = response.data;
    if (!apiResponse.success || !apiResponse.data) {
      throw new Error('Login failed - invalid response format');
    }
    
    console.log('🔐 AuthApiService received response:', apiResponse);
    console.log('🔐 AuthApiService extracting token:', apiResponse.data.token);
    
    return apiResponse.data;
  }

  async validateToken(token: string): Promise<{ valid: boolean; user?: any }> {
    if (!this.apiConfig.endpoints.auth) {
      throw new Error('Authentication endpoints not configured');
    }
    
    try {
      const response = await this.httpClient.get<{ valid: boolean; user?: any }>(
        this.apiConfig.endpoints.auth.validate,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      return { valid: false };
    }
  }

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    if (!this.apiConfig.endpoints.auth) {
      throw new Error('Authentication endpoints not configured');
    }
    
    const response = await this.httpClient.post<{ token: string }>(
      this.apiConfig.endpoints.auth.refresh,
      { refreshToken }
    );
    
    if (!response.data) {
      throw new Error('Token refresh failed');
    }
    
    return response.data;
  }
}