/**
 * Configuration Module Exports
 * Clean exports for centralized configuration management
 */

// Types and interfaces
export type { AppConfig, ApiConfiguration, FeatureFlags, ApplicationSettings, StorageSettings, UISettings } from './AppConfig';

// Configuration provider and utilities
export { 
  configProvider, 
  getConfig, 
  getApiConfig, 
  getFeatureFlags, 
  getAppSettings, 
  getStorageSettings, 
  getUISettings, 
  isFeatureEnabled,
  ConfigValidationError 
} from './ConfigProvider';

// Environment configuration (for testing or advanced usage)
export { getEnvironmentConfig } from './EnvironmentConfig';