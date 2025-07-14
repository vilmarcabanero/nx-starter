import 'reflect-metadata';
import dotenv from 'dotenv';
import { createApp } from '@/config/app';
import { configureDI } from '@/core/infrastructure/di/container';

// Load environment variables
dotenv.config();

// Configure dependency injection
configureDI();

// Create Express app
const app = createApp();

// Start server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Task App API Server running on port ${PORT}`);
  console.log(`📖 API documentation available at http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Todos API: http://localhost:${PORT}/api/todos`);
});