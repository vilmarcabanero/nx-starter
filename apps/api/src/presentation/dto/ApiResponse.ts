import {
  ApiResponse,
  ApiErrorResponse,
  ApiSuccessResponse,
  ApiSuccessMessageResponse,
} from '@nx-starter/application-shared';

// Response Builder Class - Factory for creating consistent API responses
export class ApiResponseBuilder {
  /**
   * Creates a successful response with data
   * @param data - The data to include in the response
   * @returns A success response with data
   */
  static success<T>(data: T): ApiSuccessResponse<T> {
    return {
      success: true,
      data,
    };
  }

  /**
   * Creates a successful response with a message (for operations)
   * @param message - The success message
   * @returns A success response with message
   */
  static successWithMessage(message: string): ApiSuccessMessageResponse {
    return {
      success: true,
      message,
    };
  }

  /**
   * Creates an error response
   * @param error - The error message
   * @param message - Optional additional message
   * @returns An error response
   */
  static error(error: string, message?: string): ApiErrorResponse {
    return {
      success: false,
      error,
      ...(message && { message }),
    };
  }
}