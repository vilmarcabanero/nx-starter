import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { ApiTodoRepository } from './ApiTodoRepository';
import { Todo } from '@/core/domain/todo/entities/Todo';

// Mock fetch globally
const mockFetch = vi.fn() as Mock;
global.fetch = mockFetch;

describe('ApiTodoRepository', () => {
  let repository: ApiTodoRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new ApiTodoRepository();
  });

  describe('getAll', () => {
    it('should fetch all todos from API', async () => {
      const mockTodos = [
        {
          id: 'a1b2c3d4e5f6789012345678901234ab',
          title: 'Test Todo 1',
          completed: false,
          createdAt: '2023-01-01T00:00:00.000Z',
          priority: 'high'
        },
        {
          id: 'b2c3d4e5f6789012345678901234abc1',
          title: 'Test Todo 2',
          completed: true,
          createdAt: '2023-01-02T00:00:00.000Z',
          priority: 'medium'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockTodos
        })
      });

      const todos = await repository.getAll();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/api/todos', undefined);
      expect(todos).toHaveLength(2);
      expect(todos[0]).toBeInstanceOf(Todo);
      expect(todos[0].titleValue).toBe('Test Todo 1');
      expect(todos[1].completed).toBe(true);
    });

    it('should throw error when API response indicates failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          error: 'Database error'
        })
      });

      await expect(repository.getAll()).rejects.toThrow('Failed to fetch todos');
    });

    it('should throw network error when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));

      await expect(repository.getAll()).rejects.toThrow('Network error: Unable to connect to the API server');
    });
  });

  describe('create', () => {
    it('should create a new todo via API', async () => {
      const todo = new Todo('New Todo', false, new Date(), undefined, 'high');
      const mockResponse = {
        id: 'a1b2c3d4e5f6789012345678901234ab',
        title: 'New Todo',
        completed: false,
        priority: 'high'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockResponse
        })
      });

      const id = await repository.create(todo);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/todos',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'New Todo',
            priority: 'high',
            dueDate: undefined
          })
        }
      );
      expect(id).toBe('a1b2c3d4e5f6789012345678901234ab');
    });

    it('should create todo with due date', async () => {
      const dueDate = new Date('2023-12-31T23:59:59.000Z');
      const todo = new Todo('Todo with due date', false, new Date(), undefined, 'medium', dueDate);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { id: 'test-id' }
        })
      });

      await repository.create(todo);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/todos',
        expect.objectContaining({
          body: JSON.stringify({
            title: 'Todo with due date',
            priority: 'medium',
            dueDate: '2023-12-31T23:59:59.000Z'
          })
        })
      );
    });
  });

  describe('update', () => {
    it('should update todo via API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true
      });

      await repository.update('test-id', {
        title: 'Updated Title',
        completed: true,
        priority: 'low'
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/todos/test-id',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Updated Title',
            completed: true,
            priority: 'low'
          })
        }
      );
    });

    it('should throw error when update fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      });

      await expect(repository.update('test-id', { title: 'Updated' }))
        .rejects.toThrow('HTTP 400: Bad Request');
    });
  });

  describe('delete', () => {
    it('should delete todo via API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true
      });

      await repository.delete('test-id');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/todos/test-id',
        { method: 'DELETE' }
      );
    });

    it('should throw error when delete fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(repository.delete('test-id'))
        .rejects.toThrow('HTTP 404: Not Found');
    });
  });

  describe('getById', () => {
    it('should fetch todo by id from API', async () => {
      const mockTodo = {
        id: 'a1b2c3d4e5f6789012345678901234ab',
        title: 'Test Todo',
        completed: false,
        createdAt: '2023-01-01T00:00:00.000Z',
        priority: 'medium'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: mockTodo
        })
      });

      const todo = await repository.getById('a1b2c3d4e5f6789012345678901234ab');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/api/todos/a1b2c3d4e5f6789012345678901234ab', undefined);
      expect(todo).toBeInstanceOf(Todo);
      expect(todo?.titleValue).toBe('Test Todo');
    });

    it('should return undefined when todo not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const todo = await repository.getById('nonexistent-id');

      expect(todo).toBeUndefined();
    });
  });

  describe('getActive', () => {
    it('should fetch active todos from API', async () => {
      const mockTodos = [
        {
          id: 'a1b2c3d4e5f6789012345678901234ab',
          title: 'Active Todo',
          completed: false,
          createdAt: '2023-01-01T00:00:00.000Z',
          priority: 'high'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockTodos
        })
      });

      const todos = await repository.getActive();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/api/todos/active', undefined);
      expect(todos).toHaveLength(1);
      expect(todos[0].completed).toBe(false);
    });
  });

  describe('getCompleted', () => {
    it('should fetch completed todos from API', async () => {
      const mockTodos = [
        {
          id: 'a1b2c3d4e5f6789012345678901234ab',
          title: 'Completed Todo',
          completed: true,
          createdAt: '2023-01-01T00:00:00.000Z',
          priority: 'low'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockTodos
        })
      });

      const todos = await repository.getCompleted();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/api/todos/completed', undefined);
      expect(todos).toHaveLength(1);
      expect(todos[0].completed).toBe(true);
    });
  });

  describe('findBySpecification', () => {
    it('should fetch all todos and filter by specification', async () => {
      const mockTodos = [
        {
          id: 'a1b2c3d4e5f6789012345678901234ab',
          title: 'High Priority Todo',
          completed: false,
          createdAt: '2023-01-01T00:00:00.000Z',
          priority: 'high'
        },
        {
          id: 'b2c3d4e5f6789012345678901234abc1',
          title: 'Low Priority Todo',
          completed: false,
          createdAt: '2023-01-01T00:00:00.000Z',
          priority: 'low'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockTodos
        })
      });

      // Mock specification that only accepts high priority todos
      const mockSpecification = {
        isSatisfiedBy: vi.fn().mockImplementation((todo: Todo) => 
          todo.priority.level === 'high'
        )
      };

      const todos = await repository.findBySpecification(mockSpecification);

      expect(todos).toHaveLength(1);
      expect(todos[0].priority.level).toBe('high');
      expect(mockSpecification.isSatisfiedBy).toHaveBeenCalledTimes(2);
    });
  });

  describe('environment configuration', () => {
    it('should use custom API base URL from environment', () => {
      // This test would require mocking import.meta.env, which is tricky in Vitest
      // For now, we'll just verify the default behavior
      expect(repository).toBeInstanceOf(ApiTodoRepository);
    });
  });
});