/**
 * Application Configuration Types and Interfaces
 * Centralized configuration management following Clean Architecture principles
 * 
 * This module defines all configuration interfaces and types used throughout the application.
 * It provides a type-safe way to access configuration values and ensures consistency
 * across different environments.
 * 
 * @example
 * ```typescript
 * import { AppConfig, ServerConfiguration } from './AppConfig';
 * 
 * function useConfig(config: AppConfig) {
 *   console.log(`Server running on port ${config.server.port}`);
 * }
 * ```
 */

/**
 * Server configuration interface
 * Contains all server-related settings including host, port, and environment
 */
export interface ServerConfiguration {
  /** Server port number (0-65535, 0 for random port in testing) */
  port: number;
  /** Server host address */
  host: string;
  /** Application environment */
  environment: 'development' | 'staging' | 'production' | 'test';
  /** Graceful shutdown timeout in milliseconds */
  shutdownTimeout: number;
}

/**
 * Security configuration interface
 * Contains all security-related settings including CORS, JWT, and rate limiting
 */
export interface SecurityConfiguration {
  /** CORS (Cross-Origin Resource Sharing) configuration */
  cors: {
    /** Allowed origins for CORS requests */
    origin: string | string[];
    /** Whether to include credentials in CORS requests */
    credentials: boolean;
    /** Allowed HTTP methods */
    methods?: string[];
    /** Allowed request headers */
    allowedHeaders?: string[];
  };
  /** JWT (JSON Web Token) configuration */
  jwt: {
    /** Secret key for signing JWTs (must be secure in production) */
    secret: string;
    /** Token expiration time (e.g., '7d', '24h', '30m') */
    expiresIn: string;
    /** JWT issuer claim */
    issuer: string;
    /** JWT audience claim */
    audience: string;
    /** JWT signing algorithm */
    algorithm: 'HS256' | 'HS384' | 'HS512' | 'RS256';
  };
  /** Rate limiting configuration */
  rateLimit: {
    /** Time window for rate limiting in milliseconds */
    windowMs: number;
    /** Maximum number of requests per window */
    maxRequests: number;
    /** Whether to skip counting successful requests */
    skipSuccessfulRequests: boolean;
    /** Whether to skip counting failed requests */
    skipFailedRequests: boolean;
  };
  /** Maximum request body size */
  requestSizeLimit: string;
}

/**
 * Database configuration interface
 * Supports multiple database types and ORMs with connection pooling
 */
export interface DatabaseConfiguration {
  type: 'memory' | 'sqlite' | 'mysql' | 'postgresql' | 'mongodb';
  orm?: 'native' | 'typeorm' | 'sequelize' | 'mongoose';
  url?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  pool: {
    min: number;
    max: number;
    acquireTimeoutMillis: number;
    createTimeoutMillis: number;
    destroyTimeoutMillis: number;
    idleTimeoutMillis: number;
    reapIntervalMillis: number;
  };
  ssl: {
    enabled: boolean;
    rejectUnauthorized: boolean;
  };
}

export interface ApplicationConfiguration {
  name: string;
  version: string;
  description: string;
  author: string;
  homepage: string;
  repository: string;
  license: string;
  startupMessage: string;
  healthCheckMessage: string;
}

export interface ApiConfiguration {
  prefix: string;
  version: string;
  timeout: number;
  endpoints: {
    health: string;
    todos: string;
    auth: {
      base: string;
      login: string;
      register: string;
      logout: string;
      refresh: string;
      me: string;
    };
    documentation: string;
  };
  defaultPagination: {
    limit: number;
    maxLimit: number;
  };
}

export interface LoggingConfiguration {
  level: 'error' | 'warn' | 'info' | 'debug' | 'verbose' | 'silly';
  format: 'json' | 'text' | 'combined';
  enableColors: boolean;
  enableTimestamp: boolean;
  maxFileSize: string;
  maxFiles: number;
  datePattern: string;
  requestLogging: {
    enabled: boolean;
    format: string;
    excludePaths: string[];
  };
}

export interface MonitoringConfiguration {
  metrics: {
    enabled: boolean;
    endpoint: string;
    collectDefaultMetrics: boolean;
  };
  healthCheck: {
    enabled: boolean;
    endpoint: string;
    dependencies: {
      database: boolean;
      external: boolean;
    };
  };
  tracing: {
    enabled: boolean;
    serviceName: string;
    jaegerEndpoint?: string;
  };
}

export interface CacheConfiguration {
  enabled: boolean;
  provider: 'memory' | 'redis';
  redis?: {
    host: string;
    port: number;
    password?: string;
    db: number;
    keyPrefix: string;
  };
  ttl: {
    default: number;
    short: number;
    medium: number;
    long: number;
  };
}

/**
 * Complete application configuration interface
 * 
 * This is the root configuration interface that combines all configuration sections.
 * It provides type-safe access to all application settings and is the main interface
 * used throughout the application.
 * 
 * @example
 * ```typescript
 * import { getConfig } from './ConfigProvider';
 * 
 * const config = getConfig();
 * console.log(`Server: ${config.server.host}:${config.server.port}`);
 * console.log(`Database: ${config.database.type}`);
 * console.log(`Environment: ${config.server.environment}`);
 * ```
 */
export interface AppConfig {
  /** Server configuration (host, port, environment) */
  server: ServerConfiguration;
  /** Security configuration (CORS, JWT, rate limiting) */
  security: SecurityConfiguration;
  /** Database configuration (type, connection, pooling) */
  database: DatabaseConfiguration;
  /** Application metadata and settings */
  app: ApplicationConfiguration;
  /** API configuration (endpoints, timeouts, pagination) */
  api: ApiConfiguration;
  /** Logging configuration (levels, formats, destinations) */
  logging: LoggingConfiguration;
  /** Monitoring configuration (metrics, health checks, tracing) */
  monitoring: MonitoringConfiguration;
  /** Cache configuration (providers, TTL settings) */
  cache: CacheConfiguration;
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