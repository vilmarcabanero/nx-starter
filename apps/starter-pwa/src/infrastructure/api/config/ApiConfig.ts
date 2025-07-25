/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 * Follows Single Responsibility Principle and makes configuration easily extensible
 */

export interface ApiEndpoints {
  todos: {
    base: string;
    all: string;
    byId: (id: string) => string;
    active: string;
    completed: string;
  };
  auth?: {
    login: string;
    register: string;
    logout: string;
    refresh: string;
    me: string;
  };
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  endpoints: ApiEndpoints;
}

/**
 * Default API configuration
 * Can be overridden for different environments or testing
 */
export const defaultApiConfig: ApiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  timeout: 10000,
  endpoints: {
    todos: {
      base: '/api/todos',
      all: '/api/todos',
      byId: (id: string) => `/api/todos/${id}`,
      active: '/api/todos/active',
      completed: '/api/todos/completed',
    },
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      logout: '/api/auth/logout',
      refresh: '/api/auth/refresh',
      me: '/api/auth/me',
    },
  },
};

/**
 * Get API configuration
 * Allows for environment-specific overrides
 */
export function getApiConfig(overrides?: Partial<ApiConfig>): ApiConfig {
  return {
    ...defaultApiConfig,
    ...overrides,
  };
}