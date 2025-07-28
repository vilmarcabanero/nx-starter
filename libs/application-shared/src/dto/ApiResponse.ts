import { TodoDto, TodoStatsDto } from './TodoDto';
import { LoginUserResponseDto, RegisterUserResponseDto } from './UserDto';

/**
 * API Response Interfaces
 * Shared response types for consistent API contracts across all applications
 */

// Base API response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Success response wrapper
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

// Success response with message (for operations like update, delete)
export interface ApiSuccessMessageResponse {
  success: true;
  message: string;
}

// Error response wrapper - matches backend structure
export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  message?: string;
}

// Specific error codes for authentication
export type AuthErrorCode = 
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_TOKEN_EXPIRED'
  | 'AUTH_TOKEN_INVALID'
  | 'AUTH_USER_NOT_FOUND'
  | 'AUTH_ACCOUNT_LOCKED'
  | 'AUTH_RATE_LIMITED';

// Authentication error response
export interface AuthErrorResponse extends ApiErrorResponse {
  code: AuthErrorCode;
}

// HTTP Error interface for handling axios/fetch errors
export interface HttpErrorResponse {
  response?: {
    status: number;
    data?: ApiErrorResponse;
  };
  message: string;
  code?: string;
}

// Specific response types for Todo endpoints
export type TodoResponse = ApiSuccessResponse<TodoDto>;
export type TodoListResponse = ApiSuccessResponse<TodoDto[]>;
export type TodoStatsResponse = ApiSuccessResponse<TodoStatsDto>;
export type TodoOperationResponse = ApiSuccessMessageResponse;

// Specific response types for Auth endpoints
export type LoginResponse = ApiSuccessResponse<LoginUserResponseDto>;
export type RegisterResponse = ApiSuccessResponse<RegisterUserResponseDto>;

// Union type for all possible responses
export type TodoApiResponse = 
  | TodoResponse 
  | TodoListResponse 
  | TodoStatsResponse 
  | TodoOperationResponse 
  | ApiErrorResponse;

export type AuthApiResponse =
  | LoginResponse
  | RegisterResponse
  | AuthErrorResponse
  | ApiErrorResponse;