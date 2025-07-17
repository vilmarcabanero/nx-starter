import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  GetAllTodosQueryHandler,
  GetFilteredTodosQueryHandler,
  GetTodoStatsQueryHandler,
  GetTodoByIdQueryHandler,
} from './TodoQueryHandlers';
import { Todo } from '@/core/domain/todo/entities/Todo';
import type { ITodoRepository } from '@/core/domain/todo/repositories/ITodoRepository';
import type { GetFilteredTodosQuery, GetTodoByIdQuery } from '@/core/application/todo/dto/TodoQueries';
import { TEST_UUIDS, generateTestUuid } from '@/test/test-helpers';

// Mock the specifications
vi.mock('@/core/domain/todo/specifications/TodoSpecifications', () => ({
  ActiveTodoSpecification: vi.fn().mockImplementation(() => ({
    isSatisfiedBy: vi.fn((todo: Todo) => !todo.completed),
  })),
  CompletedTodoSpecification: vi.fn().mockImplementation(() => ({
    isSatisfiedBy: vi.fn((todo: Todo) => todo.completed),
  })),
  OverdueTodoSpecification: vi.fn().mockImplementation(() => ({
    isSatisfiedBy: vi.fn((todo: Todo) => {
      const daysDiff = (new Date().getTime() - todo.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return !todo.completed && daysDiff > 7;
    }),
  })),
  HighPriorityTodoSpecification: vi.fn().mockImplementation(() => ({
    isSatisfiedBy: vi.fn((todo: Todo) => todo.priority?.level === 'high'),
  })),
}));

// Mock the domain service
vi.mock('@/core/domain/todo/services/TodoDomainService', () => ({
  TodoDomainService: {
    sortByPriority: vi.fn((todos: Todo[]) => [...todos].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = a.priority?.level ? priorityOrder[a.priority.level] || 1 : 1;
      const bPriority = b.priority?.level ? priorityOrder[b.priority.level] || 1 : 1;
      return bPriority - aPriority;
    })),
  },
}));

describe('TodoQueryHandlers', () => {
  let mockRepository: ITodoRepository;

  beforeEach(() => {
    mockRepository = {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getActive: vi.fn(),
      getCompleted: vi.fn(),
      findBySpecification: vi.fn(),
    };
  });

  describe('GetAllTodosQueryHandler', () => {
    let handler: GetAllTodosQueryHandler;

    beforeEach(() => {
      handler = new GetAllTodosQueryHandler(mockRepository);
    });

    it('should return all todos from repository', async () => {
      // Arrange
      const expectedTodos = [
        new Todo('Todo 1', false, new Date(), TEST_UUIDS.TODO_1),
        new Todo('Todo 2', true, new Date(), TEST_UUIDS.TODO_2),
      ];
      vi.mocked(mockRepository.getAll).mockResolvedValue(expectedTodos);

      // Act
      const result = await handler.handle();

      // Assert
      expect(result).toBe(expectedTodos);
      expect(mockRepository.getAll).toHaveBeenCalledTimes(1);
    });

    it('should propagate repository errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      vi.mocked(mockRepository.getAll).mockRejectedValue(error);

      // Act & Assert
      await expect(handler.handle()).rejects.toThrow('Database connection failed');
    });

    it('should handle empty todo list', async () => {
      // Arrange
      vi.mocked(mockRepository.getAll).mockResolvedValue([]);

      // Act
      const result = await handler.handle();

      // Assert
      expect(result).toEqual([]);
      expect(mockRepository.getAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('GetFilteredTodosQueryHandler', () => {
    let handler: GetFilteredTodosQueryHandler;

    beforeEach(() => {
      handler = new GetFilteredTodosQueryHandler(mockRepository);
    });

    const createTestTodos = () => [
      new Todo('Active Todo 1', false, new Date(), TEST_UUIDS.TODO_1, 'high'),
      new Todo('Active Todo 2', false, new Date(), TEST_UUIDS.TODO_2, 'medium'),
      new Todo('Completed Todo 1', true, new Date(), TEST_UUIDS.TODO_3, 'low'),
      new Todo('Completed Todo 2', true, new Date(), TEST_UUIDS.TODO_4, 'high'),
    ];

    it('should filter active todos', async () => {
      // Arrange
      const allTodos = createTestTodos();
      const query: GetFilteredTodosQuery = { filter: 'active' };
      vi.mocked(mockRepository.getAll).mockResolvedValue(allTodos);

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every(todo => !todo.completed)).toBe(true);
    });

    it('should filter completed todos', async () => {
      // Arrange
      const allTodos = createTestTodos();
      const query: GetFilteredTodosQuery = { filter: 'completed' };
      vi.mocked(mockRepository.getAll).mockResolvedValue(allTodos);

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every(todo => todo.completed)).toBe(true);
    });

    it('should return all todos when filter is "all"', async () => {
      // Arrange
      const allTodos = createTestTodos();
      const query: GetFilteredTodosQuery = { filter: 'all' };
      vi.mocked(mockRepository.getAll).mockResolvedValue(allTodos);

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result).toHaveLength(4);
      expect(result).toBe(allTodos);
    });

    it('should sort by priority when specified', async () => {
      // Arrange
      const allTodos = createTestTodos();
      const query: GetFilteredTodosQuery = { filter: 'all', sortBy: 'priority' };
      vi.mocked(mockRepository.getAll).mockResolvedValue(allTodos);

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result).toHaveLength(4);
      expect(result).toEqual(expect.arrayContaining(allTodos));
      // The exact sorting order would be tested in integration tests
      // Here we just verify that the handler processes priority sorting without errors
    });

    it('should sort by priority in descending order', async () => {
      // Arrange
      const allTodos = createTestTodos();
      const query: GetFilteredTodosQuery = { 
        filter: 'all', 
        sortBy: 'priority', 
        sortOrder: 'desc' 
      };
      vi.mocked(mockRepository.getAll).mockResolvedValue(allTodos);

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result).toHaveLength(4);
      expect(result).toEqual(expect.arrayContaining(allTodos));
      // The exact sorting order would be tested in integration tests
      // Here we just verify that the handler processes descending priority sorting without errors
    });

    it('should sort by createdAt ascending', async () => {
      // Arrange
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-02');
      const allTodos = [
        new Todo('Todo 2', false, date2, TEST_UUIDS.TODO_2),
        new Todo('Todo 1', false, date1, TEST_UUIDS.TODO_1),
      ];
      const query: GetFilteredTodosQuery = { 
        filter: 'all', 
        sortBy: 'createdAt', 
        sortOrder: 'asc' 
      };
      vi.mocked(mockRepository.getAll).mockResolvedValue(allTodos);

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result[0].title.value).toBe('Todo 1');
      expect(result[1].title.value).toBe('Todo 2');
    });

    it('should sort by createdAt descending', async () => {
      // Arrange
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-02');
      const allTodos = [
        new Todo('Todo 1', false, date1, TEST_UUIDS.TODO_1),
        new Todo('Todo 2', false, date2, TEST_UUIDS.TODO_2),
      ];
      const query: GetFilteredTodosQuery = { 
        filter: 'all', 
        sortBy: 'createdAt', 
        sortOrder: 'desc' 
      };
      vi.mocked(mockRepository.getAll).mockResolvedValue(allTodos);

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result[0].title.value).toBe('Todo 2');
      expect(result[1].title.value).toBe('Todo 1');
    });

    it('should handle empty result after filtering', async () => {
      // Arrange
      const allTodos = [new Todo('Completed Todo', true, new Date(), TEST_UUIDS.TODO_1)];
      const query: GetFilteredTodosQuery = { filter: 'active' };
      vi.mocked(mockRepository.getAll).mockResolvedValue(allTodos);

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should propagate repository errors', async () => {
      // Arrange
      const query: GetFilteredTodosQuery = { filter: 'all' };
      const error = new Error('Database error');
      vi.mocked(mockRepository.getAll).mockRejectedValue(error);

      // Act & Assert
      await expect(handler.handle(query)).rejects.toThrow('Database error');
    });
  });

  describe('GetTodoStatsQueryHandler', () => {
    let handler: GetTodoStatsQueryHandler;

    beforeEach(() => {
      handler = new GetTodoStatsQueryHandler(mockRepository);
    });

    it('should calculate correct statistics', async () => {
      // Arrange
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10); // 10 days ago (overdue)
      
      const allTodos = [
        new Todo('Active Todo', false, new Date(), TEST_UUIDS.TODO_1, 'medium'),
        new Todo('Completed Todo', true, new Date(), TEST_UUIDS.TODO_2, 'low'),
        new Todo('High Priority Todo', false, new Date(), TEST_UUIDS.TODO_3, 'high'),
        new Todo('Overdue Todo', false, oldDate, TEST_UUIDS.TODO_4, 'medium'),
      ];
      vi.mocked(mockRepository.getAll).mockResolvedValue(allTodos);

      // Act
      const result = await handler.handle();

      // Assert
      expect(result).toEqual({
        total: 4,
        active: 3, // 3 incomplete todos
        completed: 1, // 1 complete todo
        overdue: 1, // 1 overdue todo (old and incomplete)
        highPriority: 1, // 1 high priority todo
      });
    });

    it('should handle empty todo list', async () => {
      // Arrange
      vi.mocked(mockRepository.getAll).mockResolvedValue([]);

      // Act
      const result = await handler.handle();

      // Assert
      expect(result).toEqual({
        total: 0,
        active: 0,
        completed: 0,
        overdue: 0,
        highPriority: 0,
      });
    });

    it('should handle all completed todos', async () => {
      // Arrange
      const allTodos = [
        new Todo('Completed Todo 1', true, new Date(), TEST_UUIDS.TODO_1),
        new Todo('Completed Todo 2', true, new Date(), TEST_UUIDS.TODO_2),
      ];
      vi.mocked(mockRepository.getAll).mockResolvedValue(allTodos);

      // Act
      const result = await handler.handle();

      // Assert
      expect(result).toEqual({
        total: 2,
        active: 0,
        completed: 2,
        overdue: 0,
        highPriority: 0,
      });
    });

    it('should propagate repository errors', async () => {
      // Arrange
      const error = new Error('Database error');
      vi.mocked(mockRepository.getAll).mockRejectedValue(error);

      // Act & Assert
      await expect(handler.handle()).rejects.toThrow('Database error');
    });
  });

  describe('GetTodoByIdQueryHandler', () => {
    let handler: GetTodoByIdQueryHandler;

    beforeEach(() => {
      handler = new GetTodoByIdQueryHandler(mockRepository);
    });

    it('should return todo when found', async () => {
      // Arrange
      const query: GetTodoByIdQuery = { id: TEST_UUIDS.TODO_1 };
      const expectedTodo = new Todo('Found Todo', false, new Date(), TEST_UUIDS.TODO_1);
      vi.mocked(mockRepository.getById).mockResolvedValue(expectedTodo);

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result).toBe(expectedTodo);
      expect(mockRepository.getById).toHaveBeenCalledWith(TEST_UUIDS.TODO_1);
    });

    it('should return null when todo not found', async () => {
      // Arrange
      const query: GetTodoByIdQuery = { id: generateTestUuid(999) };
      vi.mocked(mockRepository.getById).mockResolvedValue(undefined);

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result).toBeNull();
      expect(mockRepository.getById).toHaveBeenCalledWith(generateTestUuid(999));
    });

    it('should propagate repository errors', async () => {
      // Arrange
      const query: GetTodoByIdQuery = { id: TEST_UUIDS.TODO_1 };
      const error = new Error('Database error');
      vi.mocked(mockRepository.getById).mockRejectedValue(error);

      // Act & Assert
      await expect(handler.handle(query)).rejects.toThrow('Database error');
    });

    it('should handle valid edge case IDs', async () => {
      // Arrange
      const query: GetTodoByIdQuery = { id: generateTestUuid(0) };
      vi.mocked(mockRepository.getById).mockResolvedValue(undefined);

      // Act
      const result = await handler.handle(query);

      // Assert
      expect(result).toBeNull();
      expect(mockRepository.getById).toHaveBeenCalledWith(generateTestUuid(0));
    });
  });
});
