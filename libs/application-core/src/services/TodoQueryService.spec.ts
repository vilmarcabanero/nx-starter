import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TodoQueryService } from './TodoQueryService';
import { Todo } from '@nx-starter/domain';
import {
  GetAllTodosQueryHandler,
  GetFilteredTodosQueryHandler,
  GetActiveTodosQueryHandler,
  GetCompletedTodosQueryHandler,
  GetTodoStatsQueryHandler,
  GetTodoByIdQueryHandler,
} from '../use-cases/queries/TodoQueryHandlers';
import { TEST_UUIDS } from '@nx-starter/utils-core';

describe('TodoQueryService', () => {
  let service: TodoQueryService;
  let mockGetAllTodosHandler: GetAllTodosQueryHandler;
  let mockGetFilteredTodosHandler: GetFilteredTodosQueryHandler;
  let mockGetActiveTodosHandler: GetActiveTodosQueryHandler;
  let mockGetCompletedTodosHandler: GetCompletedTodosQueryHandler;
  let mockGetTodoStatsHandler: GetTodoStatsQueryHandler;
  let mockGetTodoByIdHandler: GetTodoByIdQueryHandler;

  beforeEach(() => {
    // Create mock query handlers
    mockGetAllTodosHandler = {
      execute: vi.fn(),
    } as unknown as GetAllTodosQueryHandler;

    mockGetFilteredTodosHandler = {
      execute: vi.fn(),
    } as unknown as GetFilteredTodosQueryHandler;

    mockGetActiveTodosHandler = {
      execute: vi.fn(),
    } as unknown as GetActiveTodosQueryHandler;

    mockGetCompletedTodosHandler = {
      execute: vi.fn(),
    } as unknown as GetCompletedTodosQueryHandler;

    mockGetTodoStatsHandler = {
      execute: vi.fn(),
    } as unknown as GetTodoStatsQueryHandler;

    mockGetTodoByIdHandler = {
      execute: vi.fn(),
    } as unknown as GetTodoByIdQueryHandler;

    // Create service with mocked dependencies
    service = new TodoQueryService(
      mockGetAllTodosHandler,
      mockGetFilteredTodosHandler,
      mockGetActiveTodosHandler,
      mockGetCompletedTodosHandler,
      mockGetTodoStatsHandler,
      mockGetTodoByIdHandler
    );
  });

  describe('getAllTodos', () => {
    it('should return all todos', async () => {
      // Arrange
      const mockTodos = [
        new Todo('Todo 1'),
        new Todo('Todo 2'),
      ];
      vi.mocked(mockGetAllTodosHandler.execute).mockResolvedValue(mockTodos);

      // Act
      const result = await service.getAllTodos();

      // Assert
      expect(result).toBe(mockTodos);
      expect(mockGetAllTodosHandler.execute).toHaveBeenCalledTimes(1);
      expect(mockGetAllTodosHandler.execute).toHaveBeenCalledWith();
    });

    it('should propagate errors from handler', async () => {
      // Arrange
      const error = new Error('Handler error');
      vi.mocked(mockGetAllTodosHandler.execute).mockRejectedValue(error);

      // Act & Assert
      await expect(service.getAllTodos()).rejects.toThrow('Handler error');
    });
  });

  describe('getActiveTodos', () => {
    it('should return active todos', async () => {
      // Arrange
      const mockActiveTodos = [new Todo('Active todo')];
      vi.mocked(mockGetActiveTodosHandler.execute).mockResolvedValue(mockActiveTodos);

      // Act
      const result = await service.getActiveTodos();

      // Assert
      expect(result).toBe(mockActiveTodos);
      expect(mockGetActiveTodosHandler.execute).toHaveBeenCalledTimes(1);
      expect(mockGetActiveTodosHandler.execute).toHaveBeenCalledWith();
    });
  });

  describe('getCompletedTodos', () => {
    it('should return completed todos', async () => {
      // Arrange
      const mockCompletedTodos = [new Todo('Completed todo')];
      vi.mocked(mockGetCompletedTodosHandler.execute).mockResolvedValue(mockCompletedTodos);

      // Act
      const result = await service.getCompletedTodos();

      // Assert
      expect(result).toBe(mockCompletedTodos);
      expect(mockGetCompletedTodosHandler.execute).toHaveBeenCalledTimes(1);
      expect(mockGetCompletedTodosHandler.execute).toHaveBeenCalledWith();
    });
  });

  describe('getTodoById', () => {
    it('should return todo by id', async () => {
      // Arrange
      const id = TEST_UUIDS.TODO_1;
      const mockTodo = new Todo('Found todo');
      vi.mocked(mockGetTodoByIdHandler.execute).mockResolvedValue(mockTodo);

      // Act
      const result = await service.getTodoById(id);

      // Assert
      expect(result).toBe(mockTodo);
      expect(mockGetTodoByIdHandler.execute).toHaveBeenCalledWith({ id });
      expect(mockGetTodoByIdHandler.execute).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from handler', async () => {
      // Arrange
      const id = TEST_UUIDS.TODO_1;
      const error = new Error('Todo not found');
      vi.mocked(mockGetTodoByIdHandler.execute).mockRejectedValue(error);

      // Act & Assert
      await expect(service.getTodoById(id)).rejects.toThrow('Todo not found');
    });
  });

  describe('getFilteredTodos', () => {
    it('should return filtered todos with all parameters', async () => {
      // Arrange
      const mockFilteredTodos = [new Todo('Filtered todo')];
      vi.mocked(mockGetFilteredTodosHandler.execute).mockResolvedValue(mockFilteredTodos);

      // Act
      const result = await service.getFilteredTodos('active', 'priority');

      // Assert
      expect(result).toBe(mockFilteredTodos);
      expect(mockGetFilteredTodosHandler.execute).toHaveBeenCalledWith({
        filter: 'active',
        sortBy: 'priority',
      });
    });

    it('should return filtered todos with only filter parameter', async () => {
      // Arrange
      const mockFilteredTodos = [new Todo('All todos')];
      vi.mocked(mockGetFilteredTodosHandler.execute).mockResolvedValue(mockFilteredTodos);

      // Act
      const result = await service.getFilteredTodos('all');

      // Assert
      expect(result).toBe(mockFilteredTodos);
      expect(mockGetFilteredTodosHandler.execute).toHaveBeenCalledWith({
        filter: 'all',
        sortBy: undefined,
      });
    });

    it('should handle completed filter with urgency sort', async () => {
      // Arrange
      const mockFilteredTodos = [new Todo('Completed urgent todo')];
      vi.mocked(mockGetFilteredTodosHandler.execute).mockResolvedValue(mockFilteredTodos);

      // Act
      const result = await service.getFilteredTodos('completed', 'urgency');

      // Assert
      expect(result).toBe(mockFilteredTodos);
      expect(mockGetFilteredTodosHandler.execute).toHaveBeenCalledWith({
        filter: 'completed',
        sortBy: 'urgency',
      });
    });

    it('should handle createdAt sort option', async () => {
      // Arrange
      const mockFilteredTodos = [new Todo('Recent todo')];
      vi.mocked(mockGetFilteredTodosHandler.execute).mockResolvedValue(mockFilteredTodos);

      // Act
      const result = await service.getFilteredTodos('active', 'createdAt');

      // Assert
      expect(result).toBe(mockFilteredTodos);
      expect(mockGetFilteredTodosHandler.execute).toHaveBeenCalledWith({
        filter: 'active',
        sortBy: 'createdAt',
      });
    });
  });

  describe('getTodoStats', () => {
    it('should return complete todo statistics', async () => {
      // Arrange
      const mockStats = {
        total: 10,
        active: 6,
        completed: 4,
        overdue: 2,
        highPriority: 3,
      };
      vi.mocked(mockGetTodoStatsHandler.execute).mockResolvedValue(mockStats);

      // Act
      const result = await service.getTodoStats();

      // Assert
      expect(result).toEqual({
        total: 10,
        active: 6,
        completed: 4,
        overdue: 2,
        highPriority: 3,
      });
      expect(mockGetTodoStatsHandler.execute).toHaveBeenCalledTimes(1);
      expect(mockGetTodoStatsHandler.execute).toHaveBeenCalledWith();
    });

    it('should handle stats without optional fields', async () => {
      // Arrange
      const mockStats = {
        total: 5,
        active: 3,
        completed: 2,
        overdue: undefined,
        highPriority: undefined,
      };
      vi.mocked(mockGetTodoStatsHandler.execute).mockResolvedValue(mockStats);

      // Act
      const result = await service.getTodoStats();

      // Assert
      expect(result).toEqual({
        total: 5,
        active: 3,
        completed: 2,
        overdue: undefined,
        highPriority: undefined,
      });
    });

    it('should propagate errors from handler', async () => {
      // Arrange
      const error = new Error('Stats error');
      vi.mocked(mockGetTodoStatsHandler.execute).mockRejectedValue(error);

      // Act & Assert
      await expect(service.getTodoStats()).rejects.toThrow('Stats error');
    });
  });
});