/**
 * Custom API Error class
 * Provides structured error handling for API operations
 * Maintains error context for better debugging and user experience
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly data?: unknown;
  public readonly isApiError = true;

  constructor(message: string, status = 0, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Check if error is a network error (no response from server)
   */
  get isNetworkError(): boolean {
    return this.status === 0;
  }

  /**
   * Check if error is a client error (4xx status codes)
   */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if error is a server error (5xx status codes)
   */
  get isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }

  /**
   * Check if error is a not found error (404)
   */
  get isNotFound(): boolean {
    return this.status === 404;
  }

  /**
   * Create user-friendly error message
   */
  get userMessage(): string {
    if (this.isNetworkError) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    
    if (this.isNotFound) {
      return 'The requested resource was not found.';
    }
    
    if (this.isServerError) {
      return 'Server error occurred. Please try again later.';
    }
    
    if (this.isClientError) {
      return this.message || 'Request failed. Please check your input and try again.';
    }
    
    return this.message || 'An unexpected error occurred.';
  }

  /**
   * Convert to JSON for logging/debugging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      data: this.data,
      stack: this.stack,
    };
  }
}