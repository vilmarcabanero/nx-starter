import express from 'express';
import cors from 'cors';
import { useExpressServer, useContainer } from 'routing-controllers';
import { container } from '../infrastructure/di/container';
import { TodoController } from '../presentation/controllers/TodoController';
import { AuthController } from '../presentation/controllers/AuthController';
import { TestController } from '../presentation/controllers/TestController';
import { RoutingControllersErrorHandler } from '../shared/middleware/RoutingControllersErrorHandler';
import { requestLogger } from '../presentation/middleware/errorHandler';
import { 
  getSecurityConfig, 
  getApplicationConfig, 
  getApiConfig,
  getDatabaseConfig,
  getServerConfig,
  isProduction 
} from './';

/**
 * Creates and configures the Express application
 */
export const createApp = (): express.Application => {
  const app = express();
  
  // Get configuration sections
  const securityConfig = getSecurityConfig();
  const appConfig = getApplicationConfig();
  const apiConfig = getApiConfig();
  const dbConfig = getDatabaseConfig();

  // CORS configuration
  app.use(
    cors({
      origin: securityConfig.cors.origin,
      credentials: securityConfig.cors.credentials,
      methods: securityConfig.cors.methods,
      allowedHeaders: securityConfig.cors.allowedHeaders,
    })
  );

  // Body parsing
  app.use(express.json({ limit: securityConfig.requestSizeLimit }));
  app.use(express.urlencoded({ extended: true, limit: securityConfig.requestSizeLimit }));

  // Request logging
  app.use(requestLogger);

  // Health check endpoint (before routing-controllers)
  app.get(`${apiConfig.prefix}${apiConfig.endpoints.health}`, (req, res) => {
    res.json({
      success: true,
      message: appConfig.healthCheckMessage,
      timestamp: new Date().toISOString(),
    });
  });

  // Configure routing-controllers to use our tsyringe container
  useContainer({
    get: (someClass: any) => container.resolve(someClass),
  });

  // Configure controllers based on environment
  const controllers: any[] = [TodoController, AuthController];
  
  // Only add TestController in non-production environments
  if (!isProduction()) {
    controllers.push(TestController);
  }

  // Configure routing-controllers
  useExpressServer(app, {
    routePrefix: apiConfig.prefix,
    controllers,
    middlewares: [RoutingControllersErrorHandler],
    defaultErrorHandler: false, // We'll use our custom error handler
  });

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: appConfig.name,
      version: appConfig.version,
      description: appConfig.description,
      author: appConfig.author,
      license: appConfig.license,
      homepage: appConfig.homepage,
      repository: appConfig.repository,
      environment: getServerConfig().environment,
      database: dbConfig.type,
      endpoints: {
        health: `${apiConfig.prefix}${apiConfig.endpoints.health}`,
        todos: `${apiConfig.prefix}${apiConfig.endpoints.todos}`,
        auth: `${apiConfig.prefix}${apiConfig.endpoints.auth.base}`,
        register: `${apiConfig.prefix}${apiConfig.endpoints.auth.register}`,
        documentation: `${apiConfig.prefix}${apiConfig.endpoints.documentation}`,
      },
    });
  });

  // 404 handler for API routes not handled by routing-controllers  
  app.use(apiConfig.prefix, (req, res, next) => {
    // Only handle 404 if no response was sent yet
    if (!res.headersSent) {
      res.status(404).json({
        success: false,
        error: 'Not found',
        message: `Route ${req.method} ${req.path} not found`,
      });
    } else {
      next();
    }
  });

  return app;
};
