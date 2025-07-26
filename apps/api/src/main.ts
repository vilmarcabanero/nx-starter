import 'reflect-metadata';
import dotenv from 'dotenv';
import { createApp } from './config/app';
import { configureDI } from './infrastructure/di/container';
import { 
  getServerConfig, 
  getApplicationConfig, 
  getApiConfig,
  configProvider 
} from './config';

// Load environment variables
dotenv.config();

export async function startServer() {
  try {
    // Initialize configuration first
    configProvider.initialize();
    
    // Get configuration sections
    const serverConfig = getServerConfig();
    const appConfig = getApplicationConfig();
    const apiConfig = getApiConfig();

    // Configure dependency injection (now async)
    await configureDI();

    // Create Express app
    const app = createApp();

    // Start server
    app.listen(serverConfig.port, serverConfig.host, () => {
      console.log(`${appConfig.startupMessage} ${serverConfig.port}`);
      console.log(`🌍 Environment: ${serverConfig.environment}`);
      console.log(`📖 API documentation available at http://${serverConfig.host === '0.0.0.0' ? 'localhost' : serverConfig.host}:${serverConfig.port}`);
      console.log(`🔍 Health check: http://${serverConfig.host === '0.0.0.0' ? 'localhost' : serverConfig.host}:${serverConfig.port}${apiConfig.prefix}${apiConfig.endpoints.health}`);
      console.log(`📝 Todos API: http://${serverConfig.host === '0.0.0.0' ? 'localhost' : serverConfig.host}:${serverConfig.port}${apiConfig.prefix}${apiConfig.endpoints.todos}`);
    });

    // Graceful shutdown
    const gracefulShutdown = () => {
      console.log('🛑 Received shutdown signal, starting graceful shutdown...');
      setTimeout(() => {
        console.log('💥 Forcing shutdown due to timeout');
        process.exit(1);
      }, serverConfig.shutdownTimeout);
      
      process.exit(0);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server only if this module is being run directly
if (require.main === module) {
  startServer();
}
