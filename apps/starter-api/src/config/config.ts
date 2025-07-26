import dotenv from 'dotenv';
import { 
  getServerConfig, 
  getDatabaseConfig, 
  getSecurityConfig,
  isDevelopment as newIsDevelopment,
  isProduction as newIsProduction,
  isTest as newIsTest
} from './ConfigProvider';

// Load environment variables
dotenv.config();

interface DatabaseConfig {
  type: 'memory' | 'sqlite' | 'mysql' | 'postgresql' | 'mongodb';
  orm?: 'native' | 'typeorm' | 'sequelize' | 'mongoose';
  url?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
}

interface AppConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
  database: DatabaseConfig;
}

/**
 * @deprecated Use the new centralized configuration system instead.
 * Import from './ConfigProvider' for the new system:
 * - getServerConfig()
 * - getDatabaseConfig()
 * - getSecurityConfig()
 * - etc.
 */
export const config: AppConfig = {
  get port() {
    console.warn('⚠️  DEPRECATED: config.port is deprecated. Use getServerConfig().port instead.');
    return getServerConfig().port;
  },
  get nodeEnv() {
    console.warn('⚠️  DEPRECATED: config.nodeEnv is deprecated. Use getServerConfig().environment instead.');
    return getServerConfig().environment;
  },
  get corsOrigin() {
    console.warn('⚠️  DEPRECATED: config.corsOrigin is deprecated. Use getSecurityConfig().cors.origin instead.');
    return getSecurityConfig().cors.origin as string;
  },
  get database() {
    console.warn('⚠️  DEPRECATED: config.database is deprecated. Use getDatabaseConfig() instead.');
    const dbConfig = getDatabaseConfig();
    return {
      type: dbConfig.type,
      orm: dbConfig.orm,
      url: dbConfig.url,
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
    };
  },
};

/**
 * @deprecated Use isDevelopment() from './ConfigProvider' instead.
 */
export const isDevelopment = () => {
  console.warn('⚠️  DEPRECATED: isDevelopment() from config.ts is deprecated. Use isDevelopment() from ConfigProvider instead.');
  return newIsDevelopment();
};

/**
 * @deprecated Use isProduction() from './ConfigProvider' instead.
 */
export const isProduction = () => {
  console.warn('⚠️  DEPRECATED: isProduction() from config.ts is deprecated. Use isProduction() from ConfigProvider instead.');
  return newIsProduction();
};

/**
 * @deprecated Use isTest() from './ConfigProvider' instead.
 */
export const isTest = () => {
  console.warn('⚠️  DEPRECATED: isTest() from config.ts is deprecated. Use isTest() from ConfigProvider instead.');
  return newIsTest();
};
