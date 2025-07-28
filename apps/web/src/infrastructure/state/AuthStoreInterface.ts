import { LoginUserResponseDto } from '@nx-starter/application-shared';

/**
 * Authentication Store Interface
 * Defines the contract for authentication state management
 */
export interface AuthStore {
  // State
  isAuthenticated: boolean;
  user: LoginUserResponseDto['user'] | null;
  token: string | null;
  loginStatus: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;

  // Computed values
  getAuthHeaders(): Record<string, string>;
  
  // Actions
  login(credentials: { identifier: string; password: string }, rememberMe?: boolean): Promise<void>;
  logout(): void;
  clearError(): void;
  setToken(token: string): void;
  checkAuthState(): void;
  
  // Remember me functionality
  getRememberedCredentials(): { identifier: string; rememberMe: boolean } | null;
  clearRememberedCredentials(): void;
}