import { Router } from 'express';
import { createTodoRoutes } from './todoRoutes';

export const createApiRoutes = (): Router => {
  const router = Router();

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString()
    });
  });

  // API routes
  router.use('/todos', createTodoRoutes());

  return router;
};