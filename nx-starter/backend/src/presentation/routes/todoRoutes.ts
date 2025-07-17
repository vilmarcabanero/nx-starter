import { Router } from 'express';
import { container } from '../../infrastructure/di/container';
import { TodoController } from '../controllers/TodoController';

export const createTodoRoutes = (): Router => {
  const router = Router();
  const todoController = container.resolve(TodoController);

  // Bind controller methods to preserve 'this' context
  const bindMethod = (method: Function) => method.bind(todoController);

  // Todo CRUD routes
  router.get('/', bindMethod(todoController.getAllTodos));
  router.get('/active', bindMethod(todoController.getActiveTodos));
  router.get('/completed', bindMethod(todoController.getCompletedTodos));
  router.get('/stats', bindMethod(todoController.getTodoStats));
  router.get('/:id', bindMethod(todoController.getTodoById));
  router.post('/', bindMethod(todoController.createTodo));
  router.put('/:id', bindMethod(todoController.updateTodo));
  router.patch('/:id/toggle', bindMethod(todoController.toggleTodo));
  router.delete('/:id', bindMethod(todoController.deleteTodo));

  return router;
};