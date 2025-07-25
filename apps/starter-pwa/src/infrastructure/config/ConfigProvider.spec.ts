import { describe, it, expect, beforeEach } from 'vitest';
import { configProvider, ConfigValidationError } from './ConfigProvider';

describe('ConfigProvider', () => {
  beforeEach(() => {
    configProvider.reset();
  });

  it('should initialize configuration successfully', () => {
    expect(() => configProvider.initialize()).not.toThrow();
    expect(configProvider.config).toBeDefined();
  });

  it('should provide API configuration', () => {
    const apiConfig = configProvider.getApiConfig();
    
    expect(apiConfig).toBeDefined();
    expect(apiConfig.baseUrl).toBeDefined();
    expect(apiConfig.timeout).toBeGreaterThan(0);
    expect(apiConfig.endpoints).toBeDefined();
    expect(apiConfig.endpoints.todos).toBeDefined();
  });

  it('should provide feature flags', () => {
    const features = configProvider.getFeatureFlags();
    
    expect(features).toBeDefined();
    expect(typeof features.useApiBackend).toBe('boolean');
    expect(typeof features.enableAuth).toBe('boolean');
    expect(typeof features.enableOfflineMode).toBe('boolean');
  });

  it('should provide app settings', () => {
    const appSettings = configProvider.getAppSettings();
    
    expect(appSettings).toBeDefined();
    expect(appSettings.appName).toBeDefined();
    expect(appSettings.version).toBeDefined();
    expect(typeof appSettings.debugMode).toBe('boolean');
  });

  it('should provide storage settings', () => {
    const storageSettings = configProvider.getStorageSettings();
    
    expect(storageSettings).toBeDefined();
    expect(storageSettings.localStoragePrefix).toBeDefined();
    expect(storageSettings.cacheTimeout).toBeGreaterThan(0);
    expect(storageSettings.maxCacheSize).toBeGreaterThan(0);
  });

  it('should provide UI settings', () => {
    const uiSettings = configProvider.getUISettings();
    
    expect(uiSettings).toBeDefined();
    expect(uiSettings.defaultTheme).toBeDefined();
    expect(uiSettings.defaultLanguage).toBeDefined();
    expect(typeof uiSettings.animationsEnabled).toBe('boolean');
  });

  it('should check feature flags correctly', () => {
    const isApiBackendEnabled = configProvider.isFeatureEnabled('useApiBackend');
    const isAuthEnabled = configProvider.isFeatureEnabled('enableAuth');
    
    expect(typeof isApiBackendEnabled).toBe('boolean');
    expect(typeof isAuthEnabled).toBe('boolean');
  });

  it('should allow reinitialization', () => {
    configProvider.initialize();
    const config1 = configProvider.config;
    
    configProvider.reset();
    configProvider.initialize();
    const config2 = configProvider.config;
    
    // Check that configuration values are the same after reinitialization
    expect(config2.api.baseUrl).toBe(config1.api.baseUrl);
    expect(config2.features.useApiBackend).toBe(config1.features.useApiBackend);
    expect(config2.app.appName).toBe(config1.app.appName);
  });

  it('should return same config instance after initialization', () => {
    configProvider.initialize();
    const config1 = configProvider.config;
    const config2 = configProvider.config;
    
    expect(config1).toBe(config2);
  });
});