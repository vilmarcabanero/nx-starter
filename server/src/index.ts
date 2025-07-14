import 'reflect-metadata';
import dotenv from 'dotenv';
import { createApp } from '@/config/app';
import { configureDI } from '@/core/infrastructure/di/container';
import { config } from '@/config/config';

// Load environment variables
dotenv.config();

// Configure dependency injection
configureDI();

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