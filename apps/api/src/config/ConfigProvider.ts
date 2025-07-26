/**
 * Configuration Provider with Validation and Environment Management
 * Single source of truth for all application configuration
 * 
 * This module provides a centralized configuration management system with:
 * - Environment variable validation and type conversion
 * - Environment-specific configuration overrides
 * - Graceful error handling with fallback configurations
 * - Configuration health monitoring
 * - Singleton pattern for consistent access
 * 
 * @example
 * ```typescript
 * import { configProvider, getConfig } from './ConfigProvider';
 * 
 * // Initialize configuration
 * configProvider.initialize();
 * 
 * // Get complete configuration
 * const config = getConfig();
 * 
 * // Get specific configuration sections
 * const serverConfig = getServerConfig();
 * const dbConfig = getDatabaseConfig();
 * 
 * // Check configuration health
 * const health = checkConfigHealth();
 * if (!health.healthy) {
 *   console.error('Configuration issues:', health.issues);
 * }
 * ```
 */

import { AppConfig } from './AppConfig';
import { getEnvironmentConfig, environmentOverrides, ConfigParsingError } from './EnvironmentConfig';

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
 * Fallback configuration for critical failures
 */
const getFallbackConfig = (): AppConfig => ({
  server: {
    port: 4000,
    host: '0.0.0.0',
    environment: 'development',
    shutdownTimeout: 10000,
  },
  security: {
    cors: {
      origin: 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
    jwt: {
      secret: 'fallback-secret-change-immediately',
      expiresIn: '7d',
      issuer: 'starter-api',
      audience: 'starter-pwa',
      algorithm: 'HS256',
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 100,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
    },
    requestSizeLimit: '10mb',
  },
  database: {
    type: 'memory',
    orm: 'native',
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 60000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
    },
    ssl: {
      enabled: false,
      rejectUnauthorized: true,
    },
  },
  app: {
    name: 'Task App API Server',
    version: '1.0.0',
    description: 'A modern task management API built with Express.js',
    author: 'Task App Team',
    homepage: 'https://github.com/your-org/task-app',
    repository: 'https://github.com/your-org/task-app.git',
    license: 'MIT',
    startupMessage: '🚀 Task App API Server running on port',
    healthCheckMessage: 'Server is running',
  },
  api: {
    prefix: '/api',
    version: 'v1',
    timeout: 30000,
    endpoints: {
      health: '/health',
      todos: '/todos',
      auth: {
        base: '/auth',
        login: '/auth/login',
        register: '/auth/register',
        logout: '/auth/logout',
        refresh: '/auth/refresh',
        me: '/auth/me',
      },
      documentation: '/docs',
    },
    defaultPagination: {
      limit: 20,
      maxLimit: 100,
    },
  },
  logging: {
    level: 'info',
    format: 'text',
    enableColors: true,
    enableTimestamp: true,
    maxFileSize: '20m',
    maxFiles: 14,
    datePattern: 'YYYY-MM-DD',
    requestLogging: {
      enabled: true,
      format: ':method :url - :status - :response-time ms',
      excludePaths: ['/health'],
    },
  },
  monitoring: {
    metrics: {
      enabled: false,
      endpoint: '/metrics',
      collectDefaultMetrics: true,
    },
    healthCheck: {
      enabled: true,
      endpoint: '/health',
      dependencies: {
        database: true,
        external: false,
      },
    },
    tracing: {
      enabled: false,
      serviceName: 'starter-api',
    },
  },
  cache: {
    enabled: false,
    provider: 'memory',
    ttl: {
      default: 300,
      short: 60,
      medium: 900,
      long: 3600,
    },
  },
});

/**
 * Configuration provider class
 */
class ConfigurationProvider {
  private _config: AppConfig | null = null;
  private _isInitialized = false;
  private _initializationAttempts = 0;
  private _maxInitializationAttempts = 3;

  /**
   * Initialize configuration with validation and fallback mechanisms
   * 
   * This method:
   * 1. Loads base configuration from environment variables
   * 2. Applies environment-specific overrides
   * 3. Validates all configuration values
   * 4. Uses fallback configuration if initialization fails repeatedly
   * 
   * @throws {ConfigParsingError} When environment variable parsing fails
   * @throws {ConfigValidationError} When configuration validation fails
   */
  initialize(): void {
    if (this._isInitialized) {
      return;
    }

    this._initializationAttempts++;

    try {
      // Get base configuration from environment
      const baseConfig = getEnvironmentConfig();
      
      // Apply environment-specific overrides
      const environment = this.getCurrentEnvironment();
      const overrides = environmentOverrides[environment];
      
      // Deep merge configuration with overrides
      this._config = this.deepMerge(baseConfig, overrides || {});
      
      // Validate configuration
      this.validateConfiguration(this._config);
      
      this._isInitialized = true;
      
      // Log successful configuration info in development/debug mode
      if (this._config.logging.level === 'debug' || environment === 'development') {
        console.log('✅ Configuration initialized successfully:', {
          environment,
          serverPort: this._config.server.port,
          databaseType: this._config.database.type,
          logLevel: this._config.logging.level,
          apiPrefix: this._config.api.prefix,
          attempts: this._initializationAttempts,
        });
      }
    } catch (error) {
      console.error(`❌ Configuration initialization failed (attempt ${this._initializationAttempts}/${this._maxInitializationAttempts}):`, error);
      
      // Handle different types of errors
      if (error instanceof ConfigParsingError) {
        console.error(`🔧 Configuration parsing error for ${error.envVar}: ${error.message}`);
      } else if (error instanceof ConfigValidationError) {
        console.error(`🔧 Configuration validation error for ${error.field}: ${error.message}`);
      }
      
      // Use fallback configuration if we've exceeded max attempts
      if (this._initializationAttempts >= this._maxInitializationAttempts) {
        console.warn('⚠️  Using fallback configuration due to repeated initialization failures');
        console.warn('⚠️  Please check your environment variables and configuration');
        
        this._config = getFallbackConfig();
        this._isInitialized = true;
        
        // Log fallback configuration details
        console.log('🔄 Fallback configuration loaded:', {
          serverPort: this._config.server.port,
          databaseType: this._config.database.type,
          logLevel: this._config.logging.level,
          apiPrefix: this._config.api.prefix,
        });
        
        return;
      }
      
      // Rethrow for further attempts
      throw error;
    }
  }

  /**
   * Get current configuration with graceful error handling
   */
  get config(): AppConfig {
    if (!this._isInitialized || !this._config) {
      try {
        this.initialize();
      } catch (error) {
        console.error('⚠️  Failed to initialize configuration, using fallback:', error);
        this._config = getFallbackConfig();
        this._isInitialized = true;
      }
    }
    return this._config!;
  }

  /**
   * Get specific configuration sections
   */
  getServerConfig() {
    return this.config.server;
  }

  getSecurityConfig() {
    return this.config.security;
  }

  getDatabaseConfig() {
    return this.config.database;
  }

  getApplicationConfig() {
    return this.config.app;
  }

  getApiConfig() {
    return this.config.api;
  }

  getLoggingConfig() {
    return this.config.logging;
  }

  getMonitoringConfig() {
    return this.config.monitoring;
  }

  getCacheConfig() {
    return this.config.cache;
  }

  /**
   * Environment checks
   */
  isDevelopment(): boolean {
    return this.config.server.environment === 'development';
  }

  isProduction(): boolean {
    return this.config.server.environment === 'production';
  }

  isTest(): boolean {
    return this.config.server.environment === 'test';
  }

  isStaging(): boolean {
    return this.config.server.environment === 'staging';
  }

  /**
   * Get current environment
   */
  private getCurrentEnvironment(): 'development' | 'staging' | 'production' | 'test' {
    const nodeEnv = process.env.NODE_ENV;
    const environment = process.env.ENVIRONMENT;
    
    if (environment && ['development', 'staging', 'production', 'test'].includes(environment)) {
      return environment as any;
    }
    
    if (nodeEnv === 'production') return 'production';
    if (nodeEnv === 'test') return 'test';
    if (nodeEnv === 'staging') return 'staging';
    
    return 'development';
  }

  /**
   * Deep merge two objects
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    if (source && typeof source === 'object') {
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(result[key] || {}, source[key]);
        } else if (source[key] !== undefined) {
          result[key] = source[key];
        }
      }
    }
    
    return result;
  }

  /**
   * Validate configuration values
   */
  private validateConfiguration(config: AppConfig): void {
    // Validate server configuration
    // Allow port 0 for testing (random port assignment)
    if (config.server.port < 0 || config.server.port > 65535) {
      throw new ConfigValidationError('Port must be between 0 and 65535 (0 for random port in testing)', 'server.port');
    }

    if (!config.server.host?.trim()) {
      throw new ConfigValidationError('Host cannot be empty', 'server.host');
    }

    // Validate security configuration
    if (!config.security.cors.origin) {
      throw new ConfigValidationError('CORS origin is required', 'security.cors.origin');
    }

    if (!config.security.jwt.secret?.trim()) {
      throw new ConfigValidationError('JWT secret cannot be empty', 'security.jwt.secret');
    }

    if (!config.security.jwt.issuer?.trim()) {
      throw new ConfigValidationError('JWT issuer cannot be empty', 'security.jwt.issuer');
    }

    if (!config.security.jwt.audience?.trim()) {
      throw new ConfigValidationError('JWT audience cannot be empty', 'security.jwt.audience');
    }

    if (config.security.rateLimit.windowMs <= 0) {
      throw new ConfigValidationError('Rate limit window must be positive', 'security.rateLimit.windowMs');
    }

    if (config.security.rateLimit.maxRequests <= 0) {
      throw new ConfigValidationError('Rate limit max requests must be positive', 'security.rateLimit.maxRequests');
    }

    // Validate application configuration
    if (!config.app.name?.trim()) {
      throw new ConfigValidationError('Application name cannot be empty', 'app.name');
    }

    if (!config.app.version?.trim()) {
      throw new ConfigValidationError('Application version cannot be empty', 'app.version');
    }

    // Validate API configuration
    if (!config.api.prefix?.trim()) {
      throw new ConfigValidationError('API prefix cannot be empty', 'api.prefix');
    }

    if (config.api.timeout <= 0) {
      throw new ConfigValidationError('API timeout must be positive', 'api.timeout');
    }

    if (config.api.defaultPagination.limit <= 0) {
      throw new ConfigValidationError('Default pagination limit must be positive', 'api.defaultPagination.limit');
    }

    if (config.api.defaultPagination.maxLimit <= 0) {
      throw new ConfigValidationError('Max pagination limit must be positive', 'api.defaultPagination.maxLimit');
    }

    // Validate logging configuration
    const validLogLevels = ['error', 'warn', 'info', 'debug', 'verbose', 'silly'];
    if (!validLogLevels.includes(config.logging.level)) {
      throw new ConfigValidationError(
        `Log level must be one of: ${validLogLevels.join(', ')}`,
        'logging.level'
      );
    }

    const validFormats = ['json', 'text', 'combined'];
    if (!validFormats.includes(config.logging.format)) {
      throw new ConfigValidationError(
        `Log format must be one of: ${validFormats.join(', ')}`,
        'logging.format'
      );
    }

    // Validate database configuration
    const validDbTypes = ['memory', 'sqlite', 'mysql', 'postgresql', 'mongodb'];
    if (!validDbTypes.includes(config.database.type)) {
      throw new ConfigValidationError(
        `Database type must be one of: ${validDbTypes.join(', ')}`,
        'database.type'
      );
    }

    if (config.database.pool.min < 0) {
      throw new ConfigValidationError('Database pool min must be non-negative', 'database.pool.min');
    }

    if (config.database.pool.max <= 0) {
      throw new ConfigValidationError('Database pool max must be positive', 'database.pool.max');
    }

    if (config.database.pool.min > config.database.pool.max) {
      throw new ConfigValidationError('Database pool min cannot be greater than max', 'database.pool');
    }

    // Validate cache configuration
    if (config.cache.enabled) {
      const validProviders = ['memory', 'redis'];
      if (!validProviders.includes(config.cache.provider)) {
        throw new ConfigValidationError(
          `Cache provider must be one of: ${validProviders.join(', ')}`,
          'cache.provider'
        );
      }

      if (config.cache.provider === 'redis' && !config.cache.redis) {
        throw new ConfigValidationError('Redis configuration is required when using redis provider', 'cache.redis');
      }
    }
  }

  /**
   * Check configuration health and integrity
   * 
   * Performs a comprehensive health check of the current configuration,
   * identifying potential issues and warnings that may affect application
   * security or functionality.
   * 
   * @returns Object containing health status, issues, and warnings
   * @example
   * ```typescript
   * const health = configProvider.checkHealth();
   * if (!health.healthy) {
   *   console.error('Configuration issues found:', health.issues);
   * }
   * if (health.warnings.length > 0) {
   *   console.warn('Configuration warnings:', health.warnings);
   * }
   * ```
   */
  checkHealth(): { healthy: boolean; issues: string[]; warnings: string[] } {
    const issues: string[] = [];
    const warnings: string[] = [];

    try {
      const config = this.config;

      // Check for fallback configuration usage
      if (this._initializationAttempts >= this._maxInitializationAttempts) {
        warnings.push('Configuration initialized with fallback values due to environment variable issues');
      }

      // Check for insecure JWT secret in production
      if (config.server.environment === 'production' && 
          (config.security.jwt.secret === 'development-secret-change-in-production' ||
           config.security.jwt.secret === 'fallback-secret-change-immediately')) {
        issues.push('Insecure JWT secret detected in production environment');
      }

      // Check for development settings in production
      if (config.server.environment === 'production') {
        if (config.logging.level === 'debug' || config.logging.level === 'verbose') {
          warnings.push('Debug logging enabled in production environment');
        }
        if (config.security.cors.origin === 'http://localhost:3000') {
          issues.push('Development CORS origin configured in production');
        }
      }

      // Check database configuration
      if (config.database.type !== 'memory' && !config.database.url && !config.database.host) {
        issues.push('Database configuration incomplete - missing URL or host');
      }

      return {
        healthy: issues.length === 0,
        issues,
        warnings
      };
    } catch (error) {
      return {
        healthy: false,
        issues: [`Configuration health check failed: ${error}`],
        warnings: []
      };
    }
  }

  /**
   * Force configuration reinitialization
   */
  reinitialize(): void {
    this._config = null;
    this._isInitialized = false;
    this._initializationAttempts = 0;
    this.initialize();
  }

  /**
   * Reset configuration (mainly for testing)
   */
  reset(): void {
    this._config = null;
    this._isInitialized = false;
    this._initializationAttempts = 0;
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
export const getServerConfig = () => configProvider.getServerConfig();
export const getSecurityConfig = () => configProvider.getSecurityConfig();
export const getDatabaseConfig = () => configProvider.getDatabaseConfig();
export const getApplicationConfig = () => configProvider.getApplicationConfig();
export const getApiConfig = () => configProvider.getApiConfig();
export const getLoggingConfig = () => configProvider.getLoggingConfig();
export const getMonitoringConfig = () => configProvider.getMonitoringConfig();
export const getCacheConfig = () => configProvider.getCacheConfig();

/**
 * Environment check functions
 */
export const isDevelopment = () => configProvider.isDevelopment();
export const isProduction = () => configProvider.isProduction();
export const isTest = () => configProvider.isTest();
export const isStaging = () => configProvider.isStaging();

/**
 * Configuration health and management functions
 */
export const checkConfigHealth = () => configProvider.checkHealth();
export const reinitializeConfig = () => configProvider.reinitialize();