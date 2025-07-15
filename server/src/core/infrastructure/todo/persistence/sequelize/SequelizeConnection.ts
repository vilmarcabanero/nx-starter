import { Sequelize } from 'sequelize';
import { config } from '@/config/config';
import { initTodoModel } from './TodoModel';

/**
 * Sequelize connection management
 * Supports multiple SQL databases
 */
export const createSequelizeInstance = (): Sequelize => {
  const dbConfig = config.database;
  
  let sequelize: Sequelize;
  
  if (dbConfig.url) {
    // Use connection URL if provided
    sequelize = new Sequelize(dbConfig.url, {
      logging: config.nodeEnv === 'development' ? console.log : false,
      dialectOptions: dbConfig.type === 'sqlite' ? {
        // SQLite specific options
      } : {
        // MySQL/PostgreSQL specific options
        ssl: config.nodeEnv === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      }
    });
  } else {
    // Use individual connection parameters
    const dialectMap = {
      mysql: 'mysql',
      postgresql: 'postgres',
      sqlite: 'sqlite'
    } as const;
    
    const dialect = dialectMap[dbConfig.type as keyof typeof dialectMap] || 'sqlite';
    
    if (dialect === 'sqlite') {
      sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: './data/todos.db',
        logging: config.nodeEnv === 'development' ? console.log : false,
      });
    } else {
      sequelize = new Sequelize({
        dialect: dialect as any,
        host: dbConfig.host || 'localhost',
        port: dbConfig.port || (dialect === 'mysql' ? 3306 : 5432),
        username: dbConfig.username!,
        password: dbConfig.password!,
        database: dbConfig.database || 'task_app',
        logging: config.nodeEnv === 'development' ? console.log : false,
        dialectOptions: config.nodeEnv === 'production' ? {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        } : {}
      });
    }
  }
  
  // Initialize models
  initTodoModel(sequelize);
  
  return sequelize;
};

// Singleton instance
let sequelize: Sequelize | null = null;

export const getSequelizeInstance = async (): Promise<Sequelize> => {
  if (!sequelize) {
    sequelize = createSequelizeInstance();
    
    try {
      await sequelize.authenticate();
      console.log('📦 Sequelize connection established successfully');
      
      // Sync models (create tables if they don't exist)
      if (config.nodeEnv === 'development') {
        await sequelize.sync({ alter: true });
        console.log('📦 Sequelize models synchronized');
      }
    } catch (error) {
      console.error('Unable to connect to database via Sequelize:', error);
      throw error;
    }
  }
  
  return sequelize;
};

export const closeSequelizeConnection = async (): Promise<void> => {
  if (sequelize) {
    await sequelize.close();
    sequelize = null;
    console.log('📦 Sequelize connection closed');
  }
};