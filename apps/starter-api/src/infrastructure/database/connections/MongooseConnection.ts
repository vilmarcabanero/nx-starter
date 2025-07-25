import mongoose from 'mongoose';
import { config } from '../../../config/config';

/**
 * Shared Mongoose connection management
 * For MongoDB connections across all features
 */
export const connectMongoDB = async (): Promise<void> => {
  try {
    let mongoUrl: string;
    
    if (config.database.url) {
      // Use URL if provided
      mongoUrl = config.database.url;
    } else {
      // Build URL from individual config properties
      const host = config.database.host || 'localhost';
      const port = config.database.port || 27017;
      const database = config.database.database || 'task_app';
      mongoUrl = `mongodb://${host}:${port}/${database}`;
    }

    await mongoose.connect(mongoUrl, {
      // Modern Mongoose doesn't need these options anymore
      // but keeping them for compatibility if using older versions
    });

    console.log('📦 Shared MongoDB connected successfully');

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📦 Shared MongoDB disconnected');
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

export const disconnectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('📦 Shared MongoDB connection closed');
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