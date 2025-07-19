import 'reflect-metadata';
import dotenv from 'dotenv';
import { createApp } from '@/config/app';
import { configureDI } from '@/core/infrastructure/di/container';
import { config } from '@/config/config';

// Load environment variables
dotenv.config();

export async function startServer() {
  try {
    // Configure dependency injection (now async)
    await configureDI();

    // Create Express app
    const app = createApp();

    // Start server
    app.listen(config.port, () => {
      console.log(`🚀 Task App API Server running on port ${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`📖 API documentation available at http://localhost:${config.port}`);
      console.log(`🔍 Health check: http://localhost:${config.port}/api/health`);
      console.log(`📝 Todos API: http://localhost:${config.port}/api/todos`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server only if this module is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
