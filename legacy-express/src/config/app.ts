import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createApiRoutes } from '@/presentation/routes';
import { errorMiddleware } from '@/shared/middleware/ErrorHandler';
import { notFoundHandler, requestLogger } from '@/presentation/middleware/errorHandler';
import { config } from '@/config/config';

/**
 * Creates and configures the Express application
 */
export const createApp = (): express.Application => {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    })
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later.',
    },
  });
  app.use('/api', limiter);

  // Body parsing and compression
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  app.use(requestLogger);

  // API routes
  app.use('/api', createApiRoutes());

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

  // Error handling
  app.use(notFoundHandler);
  app.use(errorMiddleware);

  return app;
};
