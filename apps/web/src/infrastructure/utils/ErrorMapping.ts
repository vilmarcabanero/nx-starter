import type { ZodError, ZodIssue } from 'zod';
import type { 
  ApiErrorResponse, 
  AuthErrorResponse, 
  HttpErrorResponse,
  AuthErrorCode 
} from '@nx-starter/application-shared';

/**
 * Shared Error Mapping Utility
 * Provides consistent error handling across all web application features
 * Follows Clean Architecture principles by being in the infrastructure layer
 */

export interface FormError {
  field: string;
  message: string;
}

/**
 * Maps Zod validation errors to user-friendly form errors
 * @param zodError - The Zod validation error
 * @returns Array of form errors with field names and messages
 */
export const mapZodErrorToFormErrors = (zodError: ZodError): FormError[] => {
  return zodError.issues.map((issue: ZodIssue) => ({
    field: issue.path.join('.'),
    message: getUserFriendlyMessage(issue),
  }));
};

/**
 * Converts a Zod issue to a user-friendly error message
 * @param issue - The Zod validation issue
 * @returns User-friendly error message
 */
const getUserFriendlyMessage = (issue: ZodIssue): string => {
  const fieldName = getFieldDisplayName(issue.path[0] as string);
  
  switch (issue.code) {
    case 'too_small':
      if (issue.minimum === 1) {
        return `${fieldName} is required`;
      }
      return `${fieldName} must be at least ${issue.minimum} characters`;
      
    case 'too_big':
      return `${fieldName} cannot exceed ${issue.maximum} characters`;
      
    case 'invalid_type':
      return `${fieldName} is required`;
      
    case 'custom':
      return issue.message;
      
    default:
      return issue.message;
  }
};

/**
 * Maps technical field names to user-friendly display names
 * Extensible for all features in the application
 * @param fieldName - The technical field name
 * @returns User-friendly field display name
 */
const getFieldDisplayName = (fieldName: string): string => {
  const fieldDisplayNames: Record<string, string> = {
    // Todo feature fields
    title: 'Title',
    priority: 'Priority',
    dueDate: 'Due Date',
    completed: 'Completed Status',
    id: 'ID',
    
    // Auth feature fields
    identifier: 'Email or username',
    email: 'Email',
    username: 'Username',
    password: 'Password',
    rememberMe: 'Remember Me',
    
    // User feature fields
    firstName: 'First name',
    lastName: 'Last name',
  };
  
  return fieldDisplayNames[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
};

/**
 * Extracts the first error message for a specific field
 * Useful for displaying single error messages in form inputs
 * @param zodError - The Zod validation error
 * @param fieldName - The field to get the error for
 * @returns The error message or null if no error exists for the field
 */
export const getFieldError = (zodError: ZodError | null, fieldName: string): string | null => {
  if (!zodError) return null;
  
  const fieldError = zodError.issues.find((issue) =>
    issue.path.join('.') === fieldName
  );
  
  return fieldError ? getUserFriendlyMessage(fieldError) : null;
};

/**
 * Checks if a specific field has validation errors
 * @param zodError - The Zod validation error
 * @param fieldName - The field to check
 * @returns True if the field has errors
 */
export const hasFieldError = (zodError: ZodError | null, fieldName: string): boolean => {
  return getFieldError(zodError, fieldName) !== null;
};

/**
 * Transforms form data to match backend command structure
 * Useful for converting frontend form data to backend command DTOs
 * @param formData - The form data object
 * @param transformMap - Mapping of form fields to command fields
 * @returns Transformed command object
 */
export const transformFormDataToCommand = <TForm, TCommand>(
  formData: TForm,
  transformMap: Record<string, string | ((value: unknown) => unknown)>
): TCommand => {
  const command: Record<string, unknown> = {};
  
  Object.entries(transformMap).forEach(([formField, commandField]) => {
    const value = (formData as Record<string, unknown>)[formField];
    
    if (typeof commandField === 'function') {
      Object.assign(command, commandField(value));
    } else {
      command[commandField] = value;
    }
  });
  
  return command as TCommand;
};

/**
 * Type guard to check if error is an ApiError
 */
export const isApiError = (error: unknown): error is any => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isApiError' in error &&
    (error as any).isApiError === true
  );
};

/**
 * Type guard to check if error is an HttpErrorResponse
 */
export const isHttpErrorResponse = (error: unknown): error is HttpErrorResponse => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    'message' in error
  );
};

/**
 * Type guard to check if error is an ApiErrorResponse
 */
export const isApiErrorResponse = (error: unknown): error is ApiErrorResponse => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'success' in error &&
    'error' in error &&
    (error as ApiErrorResponse).success === false
  );
};

/**
 * Type guard to check if error is an AuthErrorResponse
 */
export const isAuthErrorResponse = (error: unknown): error is AuthErrorResponse => {
  return (
    isApiErrorResponse(error) &&
    'code' in error &&
    typeof (error as AuthErrorResponse).code === 'string'
  );
};

/**
 * Maps auth error codes to user-friendly messages
 */
const getAuthErrorMessage = (code: AuthErrorCode): string => {
  const errorMessages: Record<AuthErrorCode, string> = {
    AUTH_INVALID_CREDENTIALS: 'Invalid email/username or password',
    AUTH_TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
    AUTH_TOKEN_INVALID: 'Invalid authentication token. Please log in again.',
    AUTH_USER_NOT_FOUND: 'User account not found',
    AUTH_ACCOUNT_LOCKED: 'Account is temporarily locked. Please try again later.',
    AUTH_RATE_LIMITED: 'Too many login attempts. Please try again later.',
  };
  
  return errorMessages[code] || 'Authentication failed';
};

/**
 * Extracts user-friendly error message from HTTP error response
 * Handles backend API error structure with fallbacks
 */
export const extractErrorMessage = (error: unknown): string => {
  // Check if it's an ApiError (from AxiosHttpClient)
  if (isApiError(error)) {
    const apiError = error as any;
    
    // Check if ApiError has response data (backend error structure)
    if (apiError.response?.data) {
      const backendError = apiError.response.data;
      
      if (isAuthErrorResponse(backendError)) {
        // Use backend error message if available, otherwise map by code
        return backendError.error || getAuthErrorMessage(backendError.code);
      }
      
      if (isApiErrorResponse(backendError)) {
        return backendError.error;
      }
    }
    
    // Check if it's a network error
    if (apiError.code === 'NETWORK_ERROR' || !navigator.onLine) {
      return 'Network error. Please check your connection.';
    }
    
    // Fallback to status-based error mapping for ApiError
    const status = apiError.status;
    if (status === 401) {
      return 'Invalid email/username or password';
    }
    if (status === 429) {
      return 'Too many login attempts. Please try again later.';
    }
    if (status === 500) {
      return 'Server error. Please try again later.';
    }
    if (status && status >= 500) {
      return 'Server error. Please try again later.';
    }
    
    // Use the ApiError message if available
    return apiError.message || 'An unexpected error occurred. Please try again.';
  }
  
  // Check if it's an HTTP error with response data (for other HTTP clients)
  if (isHttpErrorResponse(error)) {
    const backendError = error.response?.data;
    
    if (isAuthErrorResponse(backendError)) {
      // Use backend error message if available, otherwise map by code
      return backendError.error || getAuthErrorMessage(backendError.code);
    }
    
    if (isApiErrorResponse(backendError)) {
      return backendError.error;
    }
    
    // Fallback to status-based error mapping
    const status = error.response?.status;
    if (status === 401) {
      return 'Invalid email/username or password';
    }
    if (status === 429) {
      return 'Too many login attempts. Please try again later.';
    }
    if (status === 500) {
      return 'Server error. Please try again later.';
    }
    if (status && status >= 500) {
      return 'Server error. Please try again later.';
    }
  }
  
  // Check for network errors (for other error formats)
  if (error && typeof error === 'object' && 'code' in error) {
    const errorCode = (error as { code: string }).code;
    if (errorCode === 'NETWORK_ERROR' || !navigator.onLine) {
      return 'Network error. Please check your connection.';
    }
  }
  
  // Fallback to error message or generic message
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred. Please try again.';
};