import axios from 'axios';
import { ApiHelper, expectApiError, expectApiSuccess } from '../utils/api-helpers';
import { todoFixtures } from '../fixtures/todo-fixtures';

describe('Todos API', () => {
  let todoId: string;

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const res = await axios.post('/api/todos', todoFixtures.highPriorityTodo);

      expectApiSuccess(res);
      expect(res.status).toBe(201);
      expect(res.data.data).toMatchObject({
        title: todoFixtures.highPriorityTodo.title,
        completed: false,
        priority: todoFixtures.highPriorityTodo.priority,
        id: expect.any(String),
        createdAt: expect.any(String),
      });

      todoId = res.data.data.id;
    });

    it('should validate required fields', async () => {
      const res = await ApiHelper.safeRequest(() => axios.post('/api/todos', {}));
      expectApiError(res, 400, 'Validation failed');
    });

    it('should validate title length', async () => {
      const res = await ApiHelper.safeRequest(() => 
        axios.post('/api/todos', todoFixtures.invalidTodos.shortTitle)
      );
      expectApiError(res, 400, 'Validation failed');
    });
  });

  describe('GET /api/todos', () => {
    it('should return all todos', async () => {
      const res = await axios.get('/api/todos');

      expect(res.status).toBe(200);
      expect(res.data).toMatchObject({
        success: true,
        data: expect.any(Array),
      });

      expect(res.data.data.length).toBeGreaterThan(0);
      expect(res.data.data[0]).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        completed: expect.any(Boolean),
        priority: expect.any(String),
        createdAt: expect.any(String),
      });
    });
  });

  describe('GET /api/todos/:id', () => {
    it('should return specific todo', async () => {
      const res = await axios.get(`/api/todos/${todoId}`);

      expect(res.status).toBe(200);
      expect(res.data).toMatchObject({
        success: true,
        data: {
          id: todoId,
          title: todoFixtures.highPriorityTodo.title,
          completed: false,
          priority: 'high',
        },
      });
    });

    it('should return 404 for non-existent todo', async () => {
      const res = await ApiHelper.safeRequest(() => axios.get('/api/todos/nonexistent-id'));

      expectApiError(res, 404, 'Todo with ID nonexistent-id not found');
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update todo', async () => {
      const updateData = {
        title: 'Updated E2E Test Todo',
        priority: 'medium',
      };

      const res = await axios.put(`/api/todos/${todoId}`, updateData);

      expect(res.status).toBe(200);
      expect(res.data).toMatchObject({
        success: true,
        message: 'Todo updated successfully',
      });

      // Verify the update
      const getRes = await axios.get(`/api/todos/${todoId}`);
      expect(getRes.data.data).toMatchObject({
        id: todoId,
        title: 'Updated E2E Test Todo',
        priority: 'medium',
      });
    });
  });

  describe('PATCH /api/todos/:id/toggle', () => {
    it('should toggle todo completion', async () => {
      const res = await axios.patch(`/api/todos/${todoId}/toggle`);

      expect(res.status).toBe(200);
      expect(res.data).toMatchObject({
        success: true,
        message: 'Todo toggled successfully',
      });

      // Verify the toggle
      const getRes = await axios.get(`/api/todos/${todoId}`);
      expect(getRes.data.data.completed).toBe(true);
    });
  });

  describe('GET /api/todos/stats', () => {
    it('should return statistics', async () => {
      const res = await axios.get('/api/todos/stats');

      expect(res.status).toBe(200);
      expect(res.data).toMatchObject({
        success: true,
        data: {
          total: expect.any(Number),
          active: expect.any(Number),
          completed: expect.any(Number),
        },
      });

      expect(res.data.data.total).toBeGreaterThan(0);
    });
  });

  describe('GET /api/todos/active', () => {
    it('should return active todos', async () => {
      const res = await axios.get('/api/todos/active');

      expect(res.status).toBe(200);
      expect(res.data).toMatchObject({
        success: true,
        data: expect.any(Array),
      });

      // All returned todos should be active
      res.data.data.forEach((todo: any) => {
        expect(todo.completed).toBe(false);
      });
    });
  });

  describe('GET /api/todos/completed', () => {
    it('should return completed todos', async () => {
      const res = await axios.get('/api/todos/completed');

      expect(res.status).toBe(200);
      expect(res.data).toMatchObject({
        success: true,
        data: expect.any(Array),
      });

      // All returned todos should be completed
      res.data.data.forEach((todo: any) => {
        expect(todo.completed).toBe(true);
      });
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete todo', async () => {
      const res = await axios.delete(`/api/todos/${todoId}`);

      expect(res.status).toBe(200);
      expect(res.data).toMatchObject({
        success: true,
        message: 'Todo deleted successfully',
      });

      // Verify deletion
      const getRes = await ApiHelper.safeRequest(() => axios.get(`/api/todos/${todoId}`));
      expect(getRes.status).toBe(404);
    });
  });
});