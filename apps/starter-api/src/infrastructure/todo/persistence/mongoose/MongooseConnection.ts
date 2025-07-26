import mongoose from 'mongoose';
import { getDatabaseConfig } from '../../../../config';

/**
 * Mongoose connection management
 * For MongoDB connections
 */
export const connectMongoDB = async (): Promise<void> => {
  try {
    const dbConfig = getDatabaseConfig();
    let mongoUrl: string;
    
    if (dbConfig.url) {
      // Use URL if provided
      mongoUrl = dbConfig.url;
    } else {
      // Build URL from individual config properties
      const host = dbConfig.host || 'localhost';
      const port = dbConfig.port || 27017;
      const database = dbConfig.database || 'task_app';
      mongoUrl = `mongodb://${host}:${port}/${database}`;
    }

    await mongoose.connect(mongoUrl, {
      // Modern Mongoose doesn't need these options anymore
      // but keeping them for compatibility if using older versions
    });

    console.log('📦 MongoDB connected successfully');

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📦 MongoDB disconnected');
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

export const disconnectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('📦 MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    throw error;
  }
};

/**
 * Default MongooseConnection object for easier testing and imports
 */
export const MongooseConnection = {
  connect: connectMongoDB,
  disconnect: disconnectMongoDB,
  get connection() {
    return mongoose.connection;
  }
};

// Graceful shutdown handler
process.on('SIGINT', async () => {
  await disconnectMongoDB();
  process.exit(0);
});
