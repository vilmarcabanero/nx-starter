/**
 * Environment Variable Mappings and Default Values
 * Maps environment variables to application configuration with enhanced type safety
 * 
 * This module handles the mapping of environment variables to typed configuration objects.
 * It provides robust validation, type conversion, and error handling for all environment
 * variables used by the application.
 * 
 * Features:
 * - Type-safe environment variable parsing
 * - Comprehensive validation with detailed error messages
 * - Support for complex types (arrays, enums, booleans)
 * - Environment-specific configuration overrides
 * - Fallback values for missing variables
 * 
 * @example
 * ```typescript
 * import { getEnvironmentConfig } from './EnvironmentConfig';
 * 
 * try {
 *   const config = getEnvironmentConfig();
 *   console.log('Configuration loaded successfully');
 * } catch (error) {
 *   if (error instanceof ConfigParsingError) {
 *     console.error(`Error parsing ${error.envVar}: ${error.message}`);
 *   }
 * }
 * ```
 */

import { AppConfig } from './AppConfig';

/**
 * Configuration parsing errors
 */
export class ConfigParsingError extends Error {
  constructor(message: string, public envVar: string, public value: string | undefined) {
    super(`Failed to parse environment variable '${envVar}': ${message}. Value: ${value}`);
    this.name = 'ConfigParsingError';
  }
}

/**
 * Maps environment variables to typed configuration values with enhanced validation
 * 
 * This function is the main entry point for loading configuration from environment variables.
 * It uses helper functions to parse, validate, and convert environment variables to their
 * appropriate types while providing comprehensive error handling.
 * 
 * @returns Complete application configuration object
 * @throws {ConfigParsingError} When environment variable parsing fails
 * 
 * @example
 * ```typescript
 * // Set environment variables
 * process.env.PORT = '8080';
 * process.env.NODE_ENV = 'production';
 * process.env.DB_TYPE = 'postgresql';
 * 
 * // Load configuration
 * const config = getEnvironmentConfig();
 * console.log(config.server.port); // 8080
 * console.log(config.server.environment); // 'production'
 * console.log(config.database.type); // 'postgresql'
 * ```
 */
export function getEnvironmentConfig(): AppConfig {
  // Helper function to parse boolean environment variables with validation
  const parseBoolean = (envVar: string, value: string | undefined, defaultValue: boolean): boolean => {
    if (value === undefined) return defaultValue;
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes') return true;
    if (lowerValue === 'false' || lowerValue === '0' || lowerValue === 'no') return false;
    throw new ConfigParsingError(`Expected boolean value (true/false/1/0/yes/no), got: ${value}`, envVar, value);
  };

  // Helper function to parse integer environment variables with validation
  const parseInteger = (envVar: string, value: string | undefined, defaultValue: number, min?: number, max?: number): number => {
    if (value === undefined) return defaultValue;
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      throw new ConfigParsingError(`Expected integer value, got: ${value}`, envVar, value);
    }
    if (min !== undefined && parsed < min) {
      throw new ConfigParsingError(`Value must be >= ${min}, got: ${parsed}`, envVar, value);
    }
    if (max !== undefined && parsed > max) {
      throw new ConfigParsingError(`Value must be <= ${max}, got: ${parsed}`, envVar, value);
    }
    return parsed;
  };

  // Helper function to parse JSON array from environment variables with validation
  const parseArray = (envVar: string, value: string | undefined, defaultValue: string[]): string[] => {
    if (!value) return defaultValue;
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        throw new ConfigParsingError(`Expected array, got: ${typeof parsed}`, envVar, value);
      }
      return parsed.filter(item => typeof item === 'string');
    } catch (error) {
      // Fallback to comma-separated parsing
      return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
  };

  // Helper function to validate required string values
  const parseString = (envVar: string, value: string | undefined, defaultValue: string, required = false): string => {
    if (value === undefined || value.trim() === '') {
      if (required) {
        throw new ConfigParsingError(`Required environment variable is missing or empty`, envVar, value);
      }
      return defaultValue;
    }
    return value.trim();
  };

  // Helper function to validate environment values against allowed options
  const parseEnum = <T extends string>(envVar: string, value: string | undefined, defaultValue: T, allowedValues: T[]): T => {
    const parsedValue = value || defaultValue;
    if (!allowedValues.includes(parsedValue as T)) {
      throw new ConfigParsingError(`Expected one of [${allowedValues.join(', ')}], got: ${parsedValue}`, envVar, value);
    }
    return parsedValue as T;
  };

  return {
    server: {
      port: parseInteger('PORT', process.env.PORT, 4000, 0, 65535),
      host: parseString('HOST', process.env.HOST, '0.0.0.0'),
      environment: parseEnum('NODE_ENV', process.env.NODE_ENV || process.env.ENVIRONMENT, 'development', ['development', 'staging', 'production', 'test']),
      shutdownTimeout: parseInteger('SHUTDOWN_TIMEOUT', process.env.SHUTDOWN_TIMEOUT, 10000, 1000),
    },
    security: {
      cors: {
        origin: parseString('CORS_ORIGIN', process.env.CORS_ORIGIN, 'http://localhost:3000'),
        credentials: parseBoolean('CORS_CREDENTIALS', process.env.CORS_CREDENTIALS, true),
        methods: parseArray('CORS_METHODS', process.env.CORS_METHODS, ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']),
        allowedHeaders: parseArray('CORS_ALLOWED_HEADERS', process.env.CORS_ALLOWED_HEADERS, ['Content-Type', 'Authorization']),
      },
      jwt: {
        secret: parseString('JWT_SECRET', process.env.JWT_SECRET, 'development-secret-change-in-production'),
        expiresIn: parseString('JWT_EXPIRES_IN', process.env.JWT_EXPIRES_IN, '7d'),
        issuer: parseString('JWT_ISSUER', process.env.JWT_ISSUER, 'starter-api'),
        audience: parseString('JWT_AUDIENCE', process.env.JWT_AUDIENCE, 'starter-pwa'),
        algorithm: parseEnum('JWT_ALGORITHM', process.env.JWT_ALGORITHM, 'HS256', ['HS256', 'HS384', 'HS512', 'RS256']),
      },
      rateLimit: {
        windowMs: parseInteger('RATE_LIMIT_WINDOW_MS', process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000, 1000), // 15 minutes
        maxRequests: parseInteger('RATE_LIMIT_MAX_REQUESTS', process.env.RATE_LIMIT_MAX_REQUESTS, 100, 1),
        skipSuccessfulRequests: parseBoolean('RATE_LIMIT_SKIP_SUCCESSFUL', process.env.RATE_LIMIT_SKIP_SUCCESSFUL, false),
        skipFailedRequests: parseBoolean('RATE_LIMIT_SKIP_FAILED', process.env.RATE_LIMIT_SKIP_FAILED, false),
      },
      requestSizeLimit: parseString('REQUEST_SIZE_LIMIT', process.env.REQUEST_SIZE_LIMIT, '10mb'),
    },
    database: {
      type: parseEnum('DB_TYPE', process.env.DB_TYPE, 'memory', ['memory', 'sqlite', 'mysql', 'postgresql', 'mongodb']),
      orm: parseEnum('DB_ORM', process.env.DB_ORM, 'native', ['native', 'typeorm', 'sequelize', 'mongoose']),
      url: process.env.DATABASE_URL,
      host: parseString('DB_HOST', process.env.DB_HOST, 'localhost'),
      port: process.env.DB_PORT ? parseInteger('DB_PORT', process.env.DB_PORT, 5432, 1, 65535) : undefined,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: parseString('DB_NAME', process.env.DB_NAME, 'task_app'),
      pool: {
        min: parseInteger('DB_POOL_MIN', process.env.DB_POOL_MIN, 2, 0),
        max: parseInteger('DB_POOL_MAX', process.env.DB_POOL_MAX, 10, 1),
        acquireTimeoutMillis: parseInteger('DB_POOL_ACQUIRE_TIMEOUT', process.env.DB_POOL_ACQUIRE_TIMEOUT, 60000, 1000),
        createTimeoutMillis: parseInteger('DB_POOL_CREATE_TIMEOUT', process.env.DB_POOL_CREATE_TIMEOUT, 30000, 1000),
        destroyTimeoutMillis: parseInteger('DB_POOL_DESTROY_TIMEOUT', process.env.DB_POOL_DESTROY_TIMEOUT, 5000, 1000),
        idleTimeoutMillis: parseInteger('DB_POOL_IDLE_TIMEOUT', process.env.DB_POOL_IDLE_TIMEOUT, 30000, 1000),
        reapIntervalMillis: parseInteger('DB_POOL_REAP_INTERVAL', process.env.DB_POOL_REAP_INTERVAL, 1000, 100),
      },
      ssl: {
        enabled: parseBoolean('DB_SSL_ENABLED', process.env.DB_SSL_ENABLED, false),
        rejectUnauthorized: parseBoolean('DB_SSL_REJECT_UNAUTHORIZED', process.env.DB_SSL_REJECT_UNAUTHORIZED, true),
      },
    },
    app: {
      name: parseString('APP_NAME', process.env.APP_NAME, 'Task App API Server'),
      version: parseString('APP_VERSION', process.env.APP_VERSION, '1.0.0'),
      description: parseString('APP_DESCRIPTION', process.env.APP_DESCRIPTION, 'A modern task management API built with Express.js'),
      author: parseString('APP_AUTHOR', process.env.APP_AUTHOR, 'Task App Team'),
      homepage: parseString('APP_HOMEPAGE', process.env.APP_HOMEPAGE, 'https://github.com/your-org/task-app'),
      repository: parseString('APP_REPOSITORY', process.env.APP_REPOSITORY, 'https://github.com/your-org/task-app.git'),
      license: parseString('APP_LICENSE', process.env.APP_LICENSE, 'MIT'),
      startupMessage: parseString('APP_STARTUP_MESSAGE', process.env.APP_STARTUP_MESSAGE, '🚀 Task App API Server running on port'),
      healthCheckMessage: parseString('APP_HEALTH_MESSAGE', process.env.APP_HEALTH_MESSAGE, 'Server is running'),
    },
    api: {
      prefix: parseString('API_PREFIX', process.env.API_PREFIX, '/api'),
      version: parseString('API_VERSION', process.env.API_VERSION, 'v1'),
      timeout: parseInteger('API_TIMEOUT', process.env.API_TIMEOUT, 30000, 1000),
      endpoints: {
        health: parseString('API_HEALTH_ENDPOINT', process.env.API_HEALTH_ENDPOINT, '/health'),
        todos: parseString('API_TODOS_ENDPOINT', process.env.API_TODOS_ENDPOINT, '/todos'),
        auth: {
          base: parseString('API_AUTH_BASE', process.env.API_AUTH_BASE, '/auth'),
          login: parseString('API_AUTH_LOGIN', process.env.API_AUTH_LOGIN, '/auth/login'),
          register: parseString('API_AUTH_REGISTER', process.env.API_AUTH_REGISTER, '/auth/register'),
          logout: parseString('API_AUTH_LOGOUT', process.env.API_AUTH_LOGOUT, '/auth/logout'),
          refresh: parseString('API_AUTH_REFRESH', process.env.API_AUTH_REFRESH, '/auth/refresh'),
          me: parseString('API_AUTH_ME', process.env.API_AUTH_ME, '/auth/me'),
        },
        documentation: parseString('API_DOCS_ENDPOINT', process.env.API_DOCS_ENDPOINT, '/docs'),
      },
      defaultPagination: {
        limit: parseInteger('API_DEFAULT_PAGE_SIZE', process.env.API_DEFAULT_PAGE_SIZE, 20, 1, 1000),
        maxLimit: parseInteger('API_MAX_PAGE_SIZE', process.env.API_MAX_PAGE_SIZE, 100, 1, 10000),
      },
    },
    logging: {
      level: parseEnum('LOG_LEVEL', process.env.LOG_LEVEL, 'info', ['error', 'warn', 'info', 'debug', 'verbose', 'silly']),
      format: parseEnum('LOG_FORMAT', process.env.LOG_FORMAT, 'text', ['json', 'text', 'combined']),
      enableColors: parseBoolean('LOG_ENABLE_COLORS', process.env.LOG_ENABLE_COLORS, true),
      enableTimestamp: parseBoolean('LOG_ENABLE_TIMESTAMP', process.env.LOG_ENABLE_TIMESTAMP, true),
      maxFileSize: parseString('LOG_MAX_FILE_SIZE', process.env.LOG_MAX_FILE_SIZE, '20m'),
      maxFiles: parseInteger('LOG_MAX_FILES', process.env.LOG_MAX_FILES, 14, 1),
      datePattern: parseString('LOG_DATE_PATTERN', process.env.LOG_DATE_PATTERN, 'YYYY-MM-DD'),
      requestLogging: {
        enabled: parseBoolean('LOG_REQUESTS_ENABLED', process.env.LOG_REQUESTS_ENABLED, true),
        format: parseString('LOG_REQUESTS_FORMAT', process.env.LOG_REQUESTS_FORMAT, ':method :url - :status - :response-time ms'),
        excludePaths: parseArray('LOG_REQUESTS_EXCLUDE_PATHS', process.env.LOG_REQUESTS_EXCLUDE_PATHS, ['/health']),
      },
    },
    monitoring: {
      metrics: {
        enabled: parseBoolean('METRICS_ENABLED', process.env.METRICS_ENABLED, false),
        endpoint: parseString('METRICS_ENDPOINT', process.env.METRICS_ENDPOINT, '/metrics'),
        collectDefaultMetrics: parseBoolean('METRICS_COLLECT_DEFAULT', process.env.METRICS_COLLECT_DEFAULT, true),
      },
      healthCheck: {
        enabled: parseBoolean('HEALTH_CHECK_ENABLED', process.env.HEALTH_CHECK_ENABLED, true),
        endpoint: parseString('HEALTH_CHECK_ENDPOINT', process.env.HEALTH_CHECK_ENDPOINT, '/health'),
        dependencies: {
          database: parseBoolean('HEALTH_CHECK_DATABASE', process.env.HEALTH_CHECK_DATABASE, true),
          external: parseBoolean('HEALTH_CHECK_EXTERNAL', process.env.HEALTH_CHECK_EXTERNAL, false),
        },
      },
      tracing: {
        enabled: parseBoolean('TRACING_ENABLED', process.env.TRACING_ENABLED, false),
        serviceName: parseString('TRACING_SERVICE_NAME', process.env.TRACING_SERVICE_NAME, 'starter-api'),
        jaegerEndpoint: process.env.JAEGER_ENDPOINT,
      },
    },
    cache: {
      enabled: parseBoolean('CACHE_ENABLED', process.env.CACHE_ENABLED, false),
      provider: parseEnum('CACHE_PROVIDER', process.env.CACHE_PROVIDER, 'memory', ['memory', 'redis']),
      redis: process.env.CACHE_PROVIDER === 'redis' ? {
        host: parseString('REDIS_HOST', process.env.REDIS_HOST, 'localhost'),
        port: parseInteger('REDIS_PORT', process.env.REDIS_PORT, 6379, 1, 65535),
        password: process.env.REDIS_PASSWORD,
        db: parseInteger('REDIS_DB', process.env.REDIS_DB, 0, 0),
        keyPrefix: parseString('REDIS_KEY_PREFIX', process.env.REDIS_KEY_PREFIX, 'starter-api:'),
      } : undefined,
      ttl: {
        default: parseInteger('CACHE_TTL_DEFAULT', process.env.CACHE_TTL_DEFAULT, 300, 1), // 5 minutes
        short: parseInteger('CACHE_TTL_SHORT', process.env.CACHE_TTL_SHORT, 60, 1), // 1 minute
        medium: parseInteger('CACHE_TTL_MEDIUM', process.env.CACHE_TTL_MEDIUM, 900, 1), // 15 minutes
        long: parseInteger('CACHE_TTL_LONG', process.env.CACHE_TTL_LONG, 3600, 1), // 1 hour
      },
    },
  };
}

/**
 * Environment-specific configuration overrides
 */
export const environmentOverrides = {
  development: {
    server: {
      host: 'localhost',
    },
    security: {
      cors: {
        origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173'],
      },
      jwt: {
        secret: 'development-secret-do-not-use-in-production',
      },
      rateLimit: {
        maxRequests: 1000, // More lenient in development
      },
    },
    logging: {
      level: 'debug' as const,
      format: 'text' as const,
      enableColors: true,
    },
    monitoring: {
      metrics: {
        enabled: false,
      },
      tracing: {
        enabled: false,
      },
    },
  },
  staging: {
    security: {
      cors: {
        origin: process.env.STAGING_CORS_ORIGIN || 'https://staging.yourapp.com',
      },
      rateLimit: {
        maxRequests: 200,
      },
    },
    logging: {
      level: 'info' as const,
      format: 'json' as const,
      enableColors: false,
    },
    monitoring: {
      metrics: {
        enabled: true,
      },
      tracing: {
        enabled: true,
      },
    },
  },
  production: {
    server: {
      shutdownTimeout: 30000, // Longer graceful shutdown
    },
    security: {
      cors: {
        origin: process.env.PRODUCTION_CORS_ORIGIN || 'https://yourapp.com',
      },
      jwt: {
        expiresIn: '24h', // Shorter token expiration in production
      },
      rateLimit: {
        maxRequests: 100,
        windowMs: 15 * 60 * 1000, // 15 minutes
      },
    },
    api: {
      timeout: 60000, // Longer timeout for production
    },
    logging: {
      level: 'warn' as const,
      format: 'json' as const,
      enableColors: false,
      requestLogging: {
        excludePaths: ['/health', '/metrics'],
      },
    },
    monitoring: {
      metrics: {
        enabled: true,
      },
      healthCheck: {
        dependencies: {
          database: true,
          external: true,
        },
      },
      tracing: {
        enabled: true,
      },
    },
    cache: {
      enabled: true,
    },
  },
  test: {
    server: {
      port: 0, // Random port for testing
    },
    security: {
      cors: {
        origin: '*',
      },
      jwt: {
        secret: 'test-secret',
        expiresIn: '1h',
      },
      rateLimit: {
        maxRequests: 10000, // No rate limiting in tests
      },
    },
    database: {
      type: 'memory' as const,
    },
    api: {
      timeout: 5000, // Shorter timeout for tests
    },
    logging: {
      level: 'error' as const,
      requestLogging: {
        enabled: false,
      },
    },
    monitoring: {
      metrics: {
        enabled: false,
      },
      healthCheck: {
        enabled: false,
      },
      tracing: {
        enabled: false,
      },
    },
    cache: {
      enabled: false,
    },
  },
};