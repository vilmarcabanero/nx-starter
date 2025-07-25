import { TodoDto, TodoStatsDto } from './TodoDto';

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

// Error response wrapper
export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
}

// Specific response types for Todo endpoints
export type TodoResponse = ApiSuccessResponse<TodoDto>;
export type TodoListResponse = ApiSuccessResponse<TodoDto[]>;
export type TodoStatsResponse = ApiSuccessResponse<TodoStatsDto>;
export type TodoOperationResponse = ApiSuccessMessageResponse;

// Union type for all possible responses
export type TodoApiResponse = 
  | TodoResponse 
  | TodoListResponse 
  | TodoStatsResponse 
  | TodoOperationResponse 
  | ApiErrorResponse;