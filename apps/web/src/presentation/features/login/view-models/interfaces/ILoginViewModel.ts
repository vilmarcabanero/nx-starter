import { LoginFormData } from '../../types';

/**
 * Login View Model Interface
 * Defines the contract for login business logic and form management
 */
export interface ILoginViewModel {
  // Form state
  isSubmitting: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Authentication state
  isAuthenticated: boolean;
  
  // Form actions
  handleLogin(formData: LoginFormData): Promise<boolean>;
  clearError(): void;
  
  // Navigation state
  shouldRedirect: boolean;
  redirectPath: string;
}

/**
 * Login Form View Model Interface
 * Specific interface for login form component logic
 */
export interface ILoginFormViewModel {
  // Form state
  isSubmitting: boolean;
  error: string | null;
  
  // Form actions
  handleFormSubmit(identifier: string, password: string, rememberMe?: boolean): Promise<boolean>;
  clearError(): void;
  
  // Validation helpers
  validateEmail(email: string): boolean;
  getFieldError(field: string): string | null;
  
  // Remember me functionality
  getRememberedCredentials(): { identifier: string; rememberMe: boolean } | null;
}