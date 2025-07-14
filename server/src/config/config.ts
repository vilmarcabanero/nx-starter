interface DatabaseConfig {
  type: 'memory' | 'sqlite' | 'mysql' | 'postgresql' | 'mongodb';
  url?: string;
}

interface AppConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
  database: DatabaseConfig;
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  database: {
    type: (process.env.DB_TYPE as any) || 'memory',
    url: process.env.DATABASE_URL
  }
};

export const isDevelopment = () => config.nodeEnv === 'development';
export const isProduction = () => config.nodeEnv === 'production';
export const isTest = () => config.nodeEnv === 'test';