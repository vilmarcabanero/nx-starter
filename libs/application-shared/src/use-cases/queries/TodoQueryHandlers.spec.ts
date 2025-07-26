import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  GetAllTodosQueryHandler,
  GetFilteredTodosQueryHandler,
  GetActiveTodosQueryHandler,
  GetCompletedTodosQueryHandler,
  GetTodoByIdQueryHandler,
  GetTodoStatsQueryHandler,
} from './TodoQueryHandlers';
import { Todo, TodoTitle, TodoDomainService } from '@nx-starter/domain';
import type { ITodoRepository } from '@nx-starter/domain';
import type {
  GetFilteredTodosQuery,
  GetTodoByIdQuery,
} from '../../dto/TodoQueries';
import { TEST_UUIDS } from '@nx-starter/utils-core';

describe('TodoQueryHandlers', () => {
  let mockRepository: ITodoRepository;
  let sampleTodos: Todo[];

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      getById: vi.fn(),
      getAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getActive: vi.fn(),
      getCompleted: vi.fn(),
      findBySpecification: vi.fn(),
    };

    // Create sample todos for testing
    sampleTodos = [
      new Todo(
        new TodoTitle('Active todo 1'),
        false,
        new Date('2025-01-01'),
        TEST_UUIDS.QUERY_TODO_1,
        'high',
        undefined
      ),
      new Todo(
        new TodoTitle('Completed todo 1'),
        true,
        new Date('2025-01-02'),
        TEST_UUIDS.QUERY_TODO_2,
        'medium',
        undefined
      ),
      new Todo(
        new TodoTitle('Active todo 2'),
        false,
        new Date('2025-01-03'),
        TEST_UUIDS.QUERY_TODO_3,
        'low',
        new Date('2025-12-31')
      ),
    ];
  });

  describe('GetAllTodosQueryHandler', () => {
    it('should return all todos', async () => {
      // Arrange
      const handler = new GetAllTodosQueryHandler(mockRepository);
      vi.mocked(mockRepository.getAll).mockResolvedValue(sampleTodos);

      // Act
      const result = await handler.execute();

      // Assert
      expect(result).toEqual(sampleTodos);
      expect(mockRepository.getAll).toHaveBeenCalledTimes(1);
    });

    it('should handle empty result', async () => {
      // Arrange
      const handler = new GetAllTodosQueryHandler(mockRepository);
      vi.mocked(mockRepository.getAll).mockResolvedValue([]);

      // Act
      const result = await handler.execute();

      // Assert
      expect(result).toEqual([]);
      expect(mockRepository.getAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('GetFilteredTodosQueryHandler', () => {
    it('should return all todos when filter is "all"', async () => {
      // Arrange
      const handler = new GetFilteredTodosQueryHandler(mockRepository);
      vi.mocked(mockRepository.getAll).mockResolvedValue(sampleTodos);
      const query: GetFilteredTodosQuery = { filter: 'all' };

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toEqual(sampleTodos);
      expect(mockRepository.getAll).toHaveBeenCalledTimes(1);
    });

    it('should return only active todos when filter is "active"', async () => {
      // Arrange
      const handler = new GetFilteredTodosQueryHandler(mockRepository);
      vi.mocked(mockRepository.getAll).mockResolvedValue(sampleTodos);
      const query: GetFilteredTodosQuery = { filter: 'active' };

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every((todo) => !todo.completed)).toBe(true);
      expect(mockRepository.getAll).toHaveBeenCalledTimes(1);
    });

    it('should return only completed todos when filter is "completed"', async () => {
      // Arrange
      const handler = new GetFilteredTodosQueryHandler(mockRepository);
      vi.mocked(mockRepository.getAll).mockResolvedValue(sampleTodos);
      const query: GetFilteredTodosQuery = { filter: 'completed' };

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toHaveLength(1);
      expect(result.every((todo) => todo.completed)).toBe(true);
      expect(mockRepository.getAll).toHaveBeenCalledTimes(1);
    });

    it('should sort by priority when sortBy is "priority"', async () => {
      // Arrange
      const handler = new GetFilteredTodosQueryHandler(mockRepository);
      vi.mocked(mockRepository.getAll).mockResolvedValue(sampleTodos);
      const query: GetFilteredTodosQuery = {
        filter: 'all',
        sortBy: 'priority',
        sortOrder: 'asc',
      };

      // Mock the domain service
      const sortedTodos = [...sampleTodos].sort((a, b) =>
        a.priority.level.localeCompare(b.priority.level)
      );
      vi.spyOn(TodoDomainService, 'sortByPriority').mockReturnValue(
        sortedTodos
      );

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(TodoDomainService.sortByPriority).toHaveBeenCalledWith(
        sampleTodos
      );
      expect(result).toEqual(sortedTodos);
    });

    it('should sort by priority in descending order when sortOrder is "desc"', async () => {
      // Arrange
      const handler = new GetFilteredTodosQueryHandler(mockRepository);
      vi.mocked(mockRepository.getAll).mockResolvedValue(sampleTodos);
      const query: GetFilteredTodosQuery = {
        filter: 'all',
        sortBy: 'priority',
        sortOrder: 'desc',
      };

      const sortedTodos = [...sampleTodos].sort((a, b) =>
        a.priority.level.localeCompare(b.priority.level)
      );
      vi.spyOn(TodoDomainService, 'sortByPriority').mockReturnValue(
        sortedTodos
      );

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(TodoDomainService.sortByPriority).toHaveBeenCalledWith(
        sampleTodos
      );
      expect(result).toEqual(sortedTodos.reverse());
    });

    it('should sort by createdAt when sortBy is "createdAt"', async () => {
      // Arrange
      const handler = new GetFilteredTodosQueryHandler(mockRepository);
      vi.mocked(mockRepository.getAll).mockResolvedValue(sampleTodos);
      const query: GetFilteredTodosQuery = {
        filter: 'all',
        sortBy: 'createdAt',
        sortOrder: 'asc',
      };

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result[0].createdAt.getTime()).toBeLessThanOrEqual(
        result[1].createdAt.getTime()
      );
      expect(result[1].createdAt.getTime()).toBeLessThanOrEqual(
        result[2].createdAt.getTime()
      );
    });

    it('should sort by createdAt in descending order when sortOrder is "desc"', async () => {
      // Arrange
      const handler = new GetFilteredTodosQueryHandler(mockRepository);
      vi.mocked(mockRepository.getAll).mockResolvedValue(sampleTodos);
      const query: GetFilteredTodosQuery = {
        filter: 'all',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result[0].createdAt.getTime()).toBeGreaterThanOrEqual(
        result[1].createdAt.getTime()
      );
      expect(result[1].createdAt.getTime()).toBeGreaterThanOrEqual(
        result[2].createdAt.getTime()
      );
    });
  });

  describe('GetActiveTodosQueryHandler', () => {
    it('should return active todos', async () => {
      // Arrange
      const handler = new GetActiveTodosQueryHandler(mockRepository);
      const activeTodos = sampleTodos.filter((todo) => !todo.completed);
      vi.mocked(mockRepository.getActive).mockResolvedValue(activeTodos);

      // Act
      const result = await handler.execute();

      // Assert
      expect(result).toEqual(activeTodos);
      expect(mockRepository.getActive).toHaveBeenCalledTimes(1);
    });
  });

  describe('GetCompletedTodosQueryHandler', () => {
    it('should return completed todos', async () => {
      // Arrange
      const handler = new GetCompletedTodosQueryHandler(mockRepository);
      const completedTodos = sampleTodos.filter((todo) => todo.completed);
      vi.mocked(mockRepository.getCompleted).mockResolvedValue(completedTodos);

      // Act
      const result = await handler.execute();

      // Assert
      expect(result).toEqual(completedTodos);
      expect(mockRepository.getCompleted).toHaveBeenCalledTimes(1);
    });
  });

  describe('GetTodoByIdQueryHandler', () => {
    it('should return todo when found', async () => {
      // Arrange
      const handler = new GetTodoByIdQueryHandler(mockRepository);
      const expectedTodo = sampleTodos[0];
      vi.mocked(mockRepository.getById).mockResolvedValue(expectedTodo);
      const query: GetTodoByIdQuery = {
        id: TEST_UUIDS.QUERY_TODO_1,
      };

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toEqual(expectedTodo);
      expect(mockRepository.getById).toHaveBeenCalledWith(
        TEST_UUIDS.QUERY_TODO_1
      );
    });

    it('should throw TodoNotFoundException when todo not found', async () => {
      // Arrange
      const handler = new GetTodoByIdQueryHandler(mockRepository);
      vi.mocked(mockRepository.getById).mockResolvedValue(undefined);
      const query: GetTodoByIdQuery = {
        id: TEST_UUIDS.NONEXISTENT_TODO,
      };

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow(
        `Todo with ID ${TEST_UUIDS.NONEXISTENT_TODO} not found`
      );
      expect(mockRepository.getById).toHaveBeenCalledWith(
        TEST_UUIDS.NONEXISTENT_TODO
      );
    });
  });

  describe('GetTodoStatsQueryHandler', () => {
    it('should return correct statistics', async () => {
      // Arrange
      const handler = new GetTodoStatsQueryHandler(mockRepository);
      vi.mocked(mockRepository.getAll).mockResolvedValue(sampleTodos);

      // Act
      const result = await handler.execute();

      // Assert
      expect(result).toEqual({
        total: 3,
        active: 2,
        completed: 1,
        overdue: 2,
        highPriority: 1,
      });
      expect(mockRepository.getAll).toHaveBeenCalledTimes(1);
    });

    it('should handle empty todos list', async () => {
      // Arrange
      const handler = new GetTodoStatsQueryHandler(mockRepository);
      vi.mocked(mockRepository.getAll).mockResolvedValue([]);

      // Act
      const result = await handler.execute();

      // Assert
      expect(result).toEqual({
        total: 0,
        active: 0,
        completed: 0,
        overdue: 0,
        highPriority: 0,
      });
      expect(mockRepository.getAll).toHaveBeenCalledTimes(1);
    });
  });
});
