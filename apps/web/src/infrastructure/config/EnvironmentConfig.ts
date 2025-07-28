/**
 * Environment Variable Mappings and Default Values
 * Maps environment variables to application configuration
 */

import { AppConfig } from './AppConfig';

/**
 * Maps environment variables to typed configuration values
 */
export function getEnvironmentConfig(): AppConfig {
  // Helper function to parse boolean environment variables
  const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true';
  };

  // Helper function to parse integer environment variables
  const parseInt = (value: string | undefined, defaultValue: number): number => {
    if (value === undefined) return defaultValue;
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  };

  return {
    api: {
      baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT, 10000),
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
          validate: '/api/auth/validate',
          me: '/api/auth/me',
        },
      },
    },
    features: {
      // Make this configurable via settings. Note that there are only selected repositories that can use the local DB.
      // Other repositories will always use the API backend like authentication.
      useApiBackend: parseBoolean(import.meta.env.VITE_USE_API_BACKEND, true),
      enableAuth: parseBoolean(import.meta.env.VITE_ENABLE_AUTH, true),
      enableOfflineMode: parseBoolean(import.meta.env.VITE_ENABLE_OFFLINE_MODE, true),
      enablePWA: parseBoolean(import.meta.env.VITE_ENABLE_PWA, true),
      enableAnalytics: parseBoolean(import.meta.env.VITE_ENABLE_ANALYTICS, true),
    },
    app: {
      appName: import.meta.env.VITE_APP_NAME || 'Nx Starter',
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      debugMode: parseBoolean(import.meta.env.VITE_DEBUG_MODE, import.meta.env.DEV),
      logLevel: (import.meta.env.VITE_LOG_LEVEL as any) || 'info',
    },
    storage: {
      localStoragePrefix: import.meta.env.VITE_STORAGE_PREFIX || 'nx-starter',
      sessionStoragePrefix: import.meta.env.VITE_SESSION_PREFIX || 'nx-starter-session',
      cacheTimeout: parseInt(import.meta.env.VITE_CACHE_TIMEOUT, 300000), // 5 minutes
      maxCacheSize: parseInt(import.meta.env.VITE_MAX_CACHE_SIZE, 50), // 50 items
    },
    ui: {
      defaultTheme: (import.meta.env.VITE_DEFAULT_THEME as any) || 'system',
      defaultLanguage: import.meta.env.VITE_DEFAULT_LANGUAGE || 'en',
      animationsEnabled: parseBoolean(import.meta.env.VITE_ANIMATIONS_ENABLED, true),
      compactMode: parseBoolean(import.meta.env.VITE_COMPACT_MODE, false),
    },
  };
}

/**
 * Environment-specific configuration overrides
 */
export const environmentOverrides = {
  development: {
    app: {
      debugMode: true,
      logLevel: 'debug' as const,
    },
    features: {
      useApiBackend: true,
      enableAuth: true,
      enableOfflineMode: true,
      enablePWA: true,
      enableAnalytics: false,
    },
  },
  staging: {
    app: {
      debugMode: false,
      logLevel: 'warn' as const,
    },
    features: {
      useApiBackend: true,
      enableAuth: true,
      enableOfflineMode: true,
      enablePWA: true,
      enableAnalytics: true,
    },
  },
  production: {
    app: {
      debugMode: false,
      logLevel: 'error' as const,
    },
    features: {
      useApiBackend: true,
      enableAuth: true,
      enableOfflineMode: true,
      enablePWA: true,
      enableAnalytics: true,
    },
    api: {
      timeout: 15000, // Longer timeout for production
    },
  },
  test: {
    app: {
      debugMode: false,
      logLevel: 'error' as const,
    },
    features: {
      useApiBackend: false,
      enableAuth: false,
      enableOfflineMode: false,
      enablePWA: false,
      enableAnalytics: false,
    },
    api: {
      timeout: 5000, // Shorter timeout for tests
    },
  },
};