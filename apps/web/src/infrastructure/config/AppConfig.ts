/**
 * Application Configuration Types and Interfaces
 * Centralized configuration management following Clean Architecture principles
 */

export interface ApiConfiguration {
  baseUrl: string;
  timeout: number;
  endpoints: {
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
      validate: string;
      me: string;
    };
  };
}

export interface FeatureFlags {
  useApiBackend: boolean;
  enableAuth: boolean;
  enableOfflineMode: boolean;
  enablePWA: boolean;
  enableAnalytics: boolean;
}

export interface ApplicationSettings {
  appName: string;
  version: string;
  debugMode: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

export interface StorageSettings {
  localStoragePrefix: string;
  sessionStoragePrefix: string;
  cacheTimeout: number;
  maxCacheSize: number;
}

export interface UISettings {
  defaultTheme: 'light' | 'dark' | 'system';
  defaultLanguage: string;
  animationsEnabled: boolean;
  compactMode: boolean;
}

/**
 * Complete application configuration interface
 */
export interface AppConfig {
  api: ApiConfiguration;
  features: FeatureFlags;
  app: ApplicationSettings;
  storage: StorageSettings;
  ui: UISettings;
}

/**
 * Environment-specific configuration overrides
 */
export interface EnvironmentConfig {
  development?: Partial<AppConfig>;
  staging?: Partial<AppConfig>;
  production?: Partial<AppConfig>;
  test?: Partial<AppConfig>;
}