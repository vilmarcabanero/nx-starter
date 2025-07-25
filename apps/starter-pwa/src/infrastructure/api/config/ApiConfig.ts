/**
 * API Configuration (Legacy)
 * This module now delegates to the centralized configuration system
 * @deprecated Use getApiConfig() from '../config' instead
 */

import { getApiConfig as getCentralizedApiConfig, type ApiConfiguration } from '../../config';

// Re-export types for backward compatibility
export type ApiEndpoints = ApiConfiguration['endpoints'];
export type ApiConfig = ApiConfiguration;

/**
 * Get API configuration from centralized config system
 * @deprecated Use getApiConfig() from '../../config' directly
 */
export function getApiConfig(overrides?: Partial<ApiConfig>): ApiConfig {
  const centralizedConfig = getCentralizedApiConfig();
  
  if (overrides) {
    return {
      ...centralizedConfig,
      ...overrides,
    };
  }
  
  return centralizedConfig;
}

/**
 * Default API configuration (for backward compatibility)
 * @deprecated Use getApiConfig() instead
 */
export const defaultApiConfig: ApiConfig = getApiConfig();