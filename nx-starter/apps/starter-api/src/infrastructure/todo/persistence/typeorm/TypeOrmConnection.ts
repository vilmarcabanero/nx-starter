import { DataSource } from 'typeorm';
import { TodoEntity } from './TodoEntity';
import { config } from '../../../../config/config';

/**
 * TypeORM DataSource configuration
 * Supports multiple database types
 */
export const createTypeOrmDataSource = (): DataSource => {
  // Base configuration
  const baseConfig = {
    entities: [TodoEntity],
    synchronize: config.nodeEnv === 'development',
    logging: config.nodeEnv === 'development',
  };

  // Database-specific configuration
  const dbType = config.database.type || 'sqlite';

  switch (dbType) {
    case 'postgresql':
      return new DataSource({
        type: 'postgres',
        url: config.database.url,
        host: config.database.host || 'localhost',
        port: config.database.port || 5432,
        username: config.database.username,
        password: config.database.password,
        database: config.database.database || 'task_app',
        ...baseConfig,
      });

    case 'mysql':
      return new DataSource({
        type: 'mysql',
        url: config.database.url,
        host: config.database.host || 'localhost',
        port: config.database.port || 3306,
        username: config.database.username,
        password: config.database.password,
        database: config.database.database || 'task_app',
        ...baseConfig,
      });

    case 'sqlite':
    default:
      return new DataSource({
        type: 'sqlite',
        database: config.database.url || './data/todos.db',
        ...baseConfig,
      });
  }
};

// Singleton instance
let dataSource: DataSource | null = null;

export const getTypeOrmDataSource = async (): Promise<DataSource> => {
  if (!dataSource) {
    dataSource = createTypeOrmDataSource();

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
      console.log('📦 TypeORM DataSource initialized');
    }
  }

  return dataSource;
};

export const closeTypeOrmConnection = async (): Promise<void> => {
  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
    dataSource = null;
    console.log('📦 TypeORM DataSource closed');
  }
};
