/**
 * Centralized Configuration Module
 * Single entry point for all application configuration
 */

// Legacy config for backward compatibility (will be removed in future versions)
export { config } from './config';

// Configuration Types and Interfaces
export type {
  AppConfig,
  ServerConfiguration,
  SecurityConfiguration,
  DatabaseConfiguration,
  ApplicationConfiguration,
  ApiConfiguration,
  LoggingConfiguration,
  MonitoringConfiguration,
  CacheConfiguration,
  EnvironmentConfig
} from './AppConfig';

// Environment Configuration
export { getEnvironmentConfig, environmentOverrides, ConfigParsingError } from './EnvironmentConfig';

// Configuration Provider - Main API
export {
  configProvider,
  getConfig,
  getServerConfig,
  getSecurityConfig,
  getDatabaseConfig,
  getApplicationConfig,
  getApiConfig,
  getLoggingConfig,
  getMonitoringConfig,
  getCacheConfig,
  ConfigValidationError,
  isDevelopment,
  isProduction,
  isTest,
  isStaging,
  checkConfigHealth,
  reinitializeConfig
} from './ConfigProvider';
