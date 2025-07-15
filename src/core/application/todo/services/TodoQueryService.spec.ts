import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TodoQueryService } from './TodoQueryService';
import { Todo } from '@/core/domain/todo/entities/Todo';
import { TEST_UUIDS, generateTestUuid } from '@/test/test-helpers';

describe('TodoQueryService', () => {
  let service: TodoQueryService;
  let mockGetAllTodosHandler: { handle: ReturnType<typeof vi.fn> };
  let mockGetFilteredTodosHandler: { handle: ReturnType<typeof vi.fn> };
  let mockGetTodoStatsHandler: { handle: ReturnType<typeof vi.fn> };
  let mockGetTodoByIdHandler: { handle: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    // Create mock query handlers
    mockGetAllTodosHandler = {
      handle: vi.fn(),
    };

    mockGetFilteredTodosHandler = {
      handle: vi.fn(),
    };

    mockGetTodoStatsHandler = {
      handle: vi.fn(),
    };

    mockGetTodoByIdHandler = {
      handle: vi.fn(),
    };

    service = new TodoQueryService(
      mockGetAllTodosHandler as never,
      mockGetFilteredTodosHandler as never,
      mockGetTodoStatsHandler as never,
      mockGetTodoByIdHandler as never
    );
  });

  describe('getAllTodos', () => {
    it('should return all todos from handler', async () => {
      // Arrange
      const expectedTodos = [
        new Todo('Todo 1', false, new Date(), TEST_UUIDS.TODO_1),
        new Todo('Todo 2', true, new Date(), TEST_UUIDS.TODO_2),
      ];
      mockGetAllTodosHandler.handle.mockResolvedValue(expectedTodos);

      // Act
      const result = await service.getAllTodos();

      // Assert
      expect(result).toBe(expectedTodos);
      expect(mockGetAllTodosHandler.handle).toHaveBeenCalledTimes(1);
      expect(mockGetAllTodosHandler.handle).toHaveBeenCalledWith();
    });

    it('should propagate errors from handler', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      mockGetAllTodosHandler.handle.mockRejectedValue(error);

      // Act & Assert
      await expect(service.getAllTodos()).rejects.toThrow('Database connection failed');
      expect(mockGetAllTodosHandler.handle).toHaveBeenCalledTimes(1);
    });
  });

  describe('getActiveTodos', () => {
    it('should return active todos from filtered handler', async () => {
      // Arrange
      const activeTodos = [
        new Todo('Active Todo 1', false, new Date(), TEST_UUIDS.TODO_1),
        new Todo('Active Todo 2', false, new Date(), TEST_UUIDS.TODO_3),
      ];
      mockGetFilteredTodosHandler.handle.mockResolvedValue(activeTodos);

      // Act
      const result = await service.getActiveTodos();

      // Assert
      expect(result).toBe(activeTodos);
      expect(mockGetFilteredTodosHandler.handle).toHaveBeenCalledWith({
        filter: 'active',
      });
      expect(mockGetFilteredTodosHandler.handle).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from handler', async () => {
      // Arrange
      const error = new Error('Failed to filter todos');
      mockGetFilteredTodosHandler.handle.mockRejectedValue(error);

      // Act & Assert
      await expect(service.getActiveTodos()).rejects.toThrow('Failed to filter todos');
    });
  });

  describe('getCompletedTodos', () => {
    it('should return completed todos from filtered handler', async () => {
      // Arrange
      const completedTodos = [
        new Todo('Completed Todo 1', true, new Date(), TEST_UUIDS.TODO_2),
        new Todo('Completed Todo 2', true, new Date(), TEST_UUIDS.TODO_4),
      ];
      mockGetFilteredTodosHandler.handle.mockResolvedValue(completedTodos);

      // Act
      const result = await service.getCompletedTodos();

      // Assert
      expect(result).toBe(completedTodos);
      expect(mockGetFilteredTodosHandler.handle).toHaveBeenCalledWith({
        filter: 'completed',
      });
      expect(mockGetFilteredTodosHandler.handle).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTodoById', () => {
    it('should return todo by id from handler', async () => {
      // Arrange
      const todoId = TEST_UUIDS.TODO_1;
      const expectedTodo = new Todo('Todo by ID', false, new Date(), todoId);
      mockGetTodoByIdHandler.handle.mockResolvedValue(expectedTodo);

      // Act
      const result = await service.getTodoById(todoId);

      // Assert
      expect(result).toBe(expectedTodo);
      expect(mockGetTodoByIdHandler.handle).toHaveBeenCalledWith({ id: todoId });
      expect(mockGetTodoByIdHandler.handle).toHaveBeenCalledTimes(1);
    });

    it('should return null when todo not found', async () => {
      // Arrange
      const todoId = generateTestUuid(999);
      mockGetTodoByIdHandler.handle.mockResolvedValue(null);

      // Act
      const result = await service.getTodoById(todoId);

      // Assert
      expect(result).toBeNull();
      expect(mockGetTodoByIdHandler.handle).toHaveBeenCalledWith({ id: todoId });
    });

    it('should propagate errors from handler', async () => {
      // Arrange
      const todoId = TEST_UUIDS.TODO_1;
      const error = new Error('Todo not found');
      mockGetTodoByIdHandler.handle.mockRejectedValue(error);

      // Act & Assert
      await expect(service.getTodoById(todoId)).rejects.toThrow('Todo not found');
    });
  });

  describe('getFilteredTodos', () => {
    it('should return filtered todos with all filter', async () => {
      // Arrange
      const allTodos = [
        new Todo('Active Todo', false, new Date(), TEST_UUIDS.TODO_1),
        new Todo('Completed Todo', true, new Date(), TEST_UUIDS.TODO_2),
      ];
      mockGetFilteredTodosHandler.handle.mockResolvedValue(allTodos);

      // Act
      const result = await service.getFilteredTodos('all');

      // Assert
      expect(result).toBe(allTodos);
      expect(mockGetFilteredTodosHandler.handle).toHaveBeenCalledWith({
        filter: 'all',
      });
    });

    it('should return filtered todos with active filter', async () => {
      // Arrange
      const activeTodos = [new Todo('Active Todo', false, new Date(), TEST_UUIDS.TODO_1)];
      mockGetFilteredTodosHandler.handle.mockResolvedValue(activeTodos);

      // Act
      const result = await service.getFilteredTodos('active');

      // Assert
      expect(result).toBe(activeTodos);
      expect(mockGetFilteredTodosHandler.handle).toHaveBeenCalledWith({
        filter: 'active',
      });
    });

    it('should return filtered todos with completed filter', async () => {
      // Arrange
      const completedTodos = [new Todo('Completed Todo', true, new Date(), TEST_UUIDS.TODO_2)];
      mockGetFilteredTodosHandler.handle.mockResolvedValue(completedTodos);

      // Act
      const result = await service.getFilteredTodos('completed');

      // Assert
      expect(result).toBe(completedTodos);
      expect(mockGetFilteredTodosHandler.handle).toHaveBeenCalledWith({
        filter: 'completed',
      });
    });
  });

  describe('getTodoStats', () => {
    it('should return todo statistics from handler', async () => {
      // Arrange
      const expectedStats = {
        total: 5,
        active: 3,
        completed: 2,
      };
      mockGetTodoStatsHandler.handle.mockResolvedValue(expectedStats);

      // Act
      const result = await service.getTodoStats();

      // Assert
      expect(result).toStrictEqual(expectedStats);
      expect(mockGetTodoStatsHandler.handle).toHaveBeenCalledTimes(1);
      expect(mockGetTodoStatsHandler.handle).toHaveBeenCalledWith();
    });

    it('should propagate errors from handler', async () => {
      // Arrange
      const error = new Error('Failed to calculate stats');
      mockGetTodoStatsHandler.handle.mockRejectedValue(error);

      // Act & Assert
      await expect(service.getTodoStats()).rejects.toThrow('Failed to calculate stats');
    });
  });

  describe('integration scenarios', () => {
    it('should handle multiple query operations', async () => {
      // Arrange
      const allTodos = [
        new Todo('Todo 1', false, new Date(), TEST_UUIDS.TODO_1),
        new Todo('Todo 2', true, new Date(), TEST_UUIDS.TODO_2),
      ];
      const activeTodos = [new Todo('Todo 1', false, new Date(), TEST_UUIDS.TODO_1)];
      const stats = { total: 2, active: 1, completed: 1 };

      mockGetAllTodosHandler.handle.mockResolvedValue(allTodos);
      mockGetFilteredTodosHandler.handle.mockResolvedValue(activeTodos);
      mockGetTodoStatsHandler.handle.mockResolvedValue(stats);

      // Act
      const all = await service.getAllTodos();
      const active = await service.getActiveTodos();
      const statistics = await service.getTodoStats();

      // Assert
      expect(all).toBe(allTodos);
      expect(active).toBe(activeTodos);
      expect(statistics).toStrictEqual(stats);
      expect(mockGetAllTodosHandler.handle).toHaveBeenCalledTimes(1);
      expect(mockGetFilteredTodosHandler.handle).toHaveBeenCalledTimes(1);
      expect(mockGetTodoStatsHandler.handle).toHaveBeenCalledTimes(1);
    });
  });
});
