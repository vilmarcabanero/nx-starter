/**
 * Configuration Provider with Validation and Environment Management
 * Single source of truth for all application configuration
 */

import { AppConfig } from './AppConfig';
import { getEnvironmentConfig, environmentOverrides } from './EnvironmentConfig';

/**
 * Configuration validation errors
 */
export class ConfigValidationError extends Error {
  constructor(message: string, public field: string) {
    super(`Configuration validation failed for field '${field}': ${message}`);
    this.name = 'ConfigValidationError';
  }
}

/**
 * Configuration provider class
 */
class ConfigurationProvider {
  private _config: AppConfig | null = null;
  private _isInitialized = false;

  /**
   * Initialize configuration with validation
   */
  initialize(): void {
    if (this._isInitialized) {
      return;
    }

    try {
      // Get base configuration from environment
      const baseConfig = getEnvironmentConfig();
      
      // Apply environment-specific overrides
      const environment = this.getCurrentEnvironment();
      const overrides = environmentOverrides[environment];
      
      // Deep merge configuration with overrides
      this._config = this.deepMerge(baseConfig, (overrides || {}) as Partial<AppConfig>);
      
      // Validate configuration
      this.validateConfiguration(this._config);
      
      this._isInitialized = true;
      
      // Log configuration info in development
      if (this._config.app.debugMode) {
        console.log('🔧 Configuration initialized:', {
          environment,
          apiBackend: this._config.features.useApiBackend,
          apiBaseUrl: this._config.api.baseUrl,
          features: this._config.features,
        });
      }
    } catch (error) {
      console.error('❌ Configuration initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get current configuration
   */
  get config(): AppConfig {
    if (!this._isInitialized || !this._config) {
      this.initialize();
    }
    return this._config!;
  }

  /**
   * Get a specific configuration section
   */
  getApiConfig() {
    return this.config.api;
  }

  getFeatureFlags() {
    return this.config.features;
  }

  getAppSettings() {
    return this.config.app;
  }

  getStorageSettings() {
    return this.config.storage;
  }

  getUISettings() {
    return this.config.ui;
  }

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    return this.config.features[feature];
  }

  /**
   * Get current environment
   */
  private getCurrentEnvironment(): 'development' | 'staging' | 'production' | 'test' {
    if (import.meta.env.VITE_ENVIRONMENT) {
      return import.meta.env.VITE_ENVIRONMENT as any;
    }
    
    if (import.meta.env.DEV) return 'development';
    if (import.meta.env.PROD) return 'production';
    if (import.meta.env.MODE === 'test') return 'test';
    
    return 'development';
  }

  /**
   * Deep merge two objects
   */
  private deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {} as any, source[key] as any);
      } else if (source[key] !== undefined) {
        result[key] = source[key] as any;
      }
    }
    
    return result;
  }

  /**
   * Validate configuration values
   */
  private validateConfiguration(config: AppConfig): void {
    // Validate API configuration
    if (!config.api.baseUrl) {
      throw new ConfigValidationError('API base URL is required', 'api.baseUrl');
    }

    if (config.api.timeout <= 0) {
      throw new ConfigValidationError('API timeout must be positive', 'api.timeout');
    }

    // Validate app settings
    if (!config.app.appName.trim()) {
      throw new ConfigValidationError('App name cannot be empty', 'app.appName');
    }

    if (!config.app.version.trim()) {
      throw new ConfigValidationError('App version cannot be empty', 'app.version');
    }

    // Validate storage settings
    if (!config.storage.localStoragePrefix.trim()) {
      throw new ConfigValidationError('Local storage prefix cannot be empty', 'storage.localStoragePrefix');
    }

    if (config.storage.cacheTimeout <= 0) {
      throw new ConfigValidationError('Cache timeout must be positive', 'storage.cacheTimeout');
    }

    // Validate UI settings
    const validThemes = ['light', 'dark', 'system'];
    if (!validThemes.includes(config.ui.defaultTheme)) {
      throw new ConfigValidationError(
        `Default theme must be one of: ${validThemes.join(', ')}`,
        'ui.defaultTheme'
      );
    }

    const validLogLevels = ['error', 'warn', 'info', 'debug'];
    if (!validLogLevels.includes(config.app.logLevel)) {
      throw new ConfigValidationError(
        `Log level must be one of: ${validLogLevels.join(', ')}`,
        'app.logLevel'
      );
    }
  }

  /**
   * Reset configuration (mainly for testing)
   */
  reset(): void {
    this._config = null;
    this._isInitialized = false;
  }
}

/**
 * Singleton configuration provider instance
 */
export const configProvider = new ConfigurationProvider();

/**
 * Convenience function to get configuration
 */
export const getConfig = () => configProvider.config;

/**
 * Convenience functions for specific config sections
 */
export const getApiConfig = () => configProvider.getApiConfig();
export const getFeatureFlags = () => configProvider.getFeatureFlags();
export const getAppSettings = () => configProvider.getAppSettings();
export const getStorageSettings = () => configProvider.getStorageSettings();
export const getUISettings = () => configProvider.getUISettings();
export const isFeatureEnabled = (feature: keyof AppConfig['features']) => 
  configProvider.isFeatureEnabled(feature);