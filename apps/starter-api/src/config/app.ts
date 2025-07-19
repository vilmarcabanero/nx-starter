import express from 'express';
import cors from 'cors';
import { useExpressServer, useContainer } from 'routing-controllers';
import { container } from '../infrastructure/di/container';
import { TodoController } from '../presentation/controllers/TodoController';
import { RoutingControllersErrorHandler } from '../shared/middleware/RoutingControllersErrorHandler';
import { requestLogger } from '../presentation/middleware/errorHandler';
import { config } from './config';

/**
 * Creates and configures the Express application
 */
export const createApp = (): express.Application => {
  const app = express();

  // CORS configuration
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    })
  );

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  app.use(requestLogger);

  // Health check endpoint (before routing-controllers)
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
    });
  });

  // Configure routing-controllers to use our tsyringe container
  useContainer({
    get: (someClass: any) => container.resolve(someClass),
  });

  // Configure routing-controllers
  useExpressServer(app, {
    routePrefix: '/api',
    controllers: [TodoController],
    middlewares: [RoutingControllersErrorHandler],
    defaultErrorHandler: false, // We'll use our custom error handler
  });

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Task App API Server',
      version: '1.0.0',
      environment: config.nodeEnv,
      database: config.database.type,
      endpoints: {
        health: '/api/health',
        todos: '/api/todos',
        documentation: 'See README.md for API documentation',
      },
    });
  });

  // 404 handler for API routes not handled by routing-controllers  
  app.use('/api', (req, res, next) => {
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
