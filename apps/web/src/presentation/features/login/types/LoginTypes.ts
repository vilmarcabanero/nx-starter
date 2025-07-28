/**
 * Login Feature Types
 * Type definitions for login-related components and data structures
 */

/**
 * Login form data structure
 * Maps to react-hook-form structure for the login form
 */
export interface LoginFormData {
  identifier: string; // Can be email or username
  password: string;
  rememberMe?: boolean;
}

/**
 * Login validation errors
 * Maps to form field error structure
 */
export interface LoginFormErrors {
  identifier?: string;
  password?: string;
  form?: string; // For general form errors
}

/**
 * Login form state
 * Represents the current state of the login form
 */
export interface LoginFormState {
  isSubmitting: boolean;
  hasErrors: boolean;
  isValid: boolean;
}

/**
 * Authentication state
 * Represents the current authentication status
 */
export interface AuthenticationState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
  } | null;
}