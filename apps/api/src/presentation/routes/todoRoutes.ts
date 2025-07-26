import { Router } from 'express';

// NOTE: Todo routes are now handled by routing-controllers decorators
// in TodoController.ts. This file is kept for backwards compatibility
// but could be removed in a future version.
export const createTodoRoutes = (): Router => {
  const router = Router();
  
  // All routes are now handled by routing-controllers
  // See TodoController.ts for the decorator-based routing implementation
  
  return router;
};
