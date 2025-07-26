import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TodoCommandService } from './TodoCommandService';
import { Todo } from '@nx-starter/domain';
import { CreateTodoUseCase } from '../use-cases/commands/CreateTodoUseCase';
import { UpdateTodoUseCase } from '../use-cases/commands/UpdateTodoUseCase';
import { DeleteTodoUseCase } from '../use-cases/commands/DeleteTodoUseCase';
import { ToggleTodoUseCase } from '../use-cases/commands/ToggleTodoUseCase';
import type { CreateTodoData, UpdateTodoData } from '../interfaces/ITodoService';
import { TEST_UUIDS } from '@nx-starter/utils-core';

describe('TodoCommandService', () => {
  let service: TodoCommandService;
  let mockCreateTodoUseCase: CreateTodoUseCase;
  let mockUpdateTodoUseCase: UpdateTodoUseCase;
  let mockDeleteTodoUseCase: DeleteTodoUseCase;
  let mockToggleTodoUseCase: ToggleTodoUseCase;

  beforeEach(() => {
    // Create mock use cases
    mockCreateTodoUseCase = {
      execute: vi.fn(),
    } as unknown as CreateTodoUseCase;

    mockUpdateTodoUseCase = {
      execute: vi.fn(),
    } as unknown as UpdateTodoUseCase;

    mockDeleteTodoUseCase = {
      execute: vi.fn(),
    } as unknown as DeleteTodoUseCase;

    mockToggleTodoUseCase = {
      execute: vi.fn(),
    } as unknown as ToggleTodoUseCase;

    // Create service with mocked dependencies
    service = new TodoCommandService(
      mockCreateTodoUseCase,
      mockUpdateTodoUseCase,
      mockDeleteTodoUseCase,
      mockToggleTodoUseCase
    );
  });

  describe('createTodo', () => {
    it('should create a todo with valid data', async () => {
      // Arrange
      const createData: CreateTodoData = {
        title: 'Test todo',
        priority: 'high',
        dueDate: new Date('2025-12-31'),
      };
      const mockTodo = new Todo('Test todo', 'high', new Date('2025-12-31'));
      vi.mocked(mockCreateTodoUseCase.execute).mockResolvedValue(mockTodo);

      // Act
      const result = await service.createTodo(createData);

      // Assert
      expect(result).toBe(mockTodo);
      expect(mockCreateTodoUseCase.execute).toHaveBeenCalledWith({
        title: 'Test todo',
        priority: 'high',
        dueDate: new Date('2025-12-31'),
      });
      expect(mockCreateTodoUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should create a todo with minimal data', async () => {
      // Arrange
      const createData: CreateTodoData = {
        title: 'Simple todo',
      };
      const mockTodo = new Todo('Simple todo');
      vi.mocked(mockCreateTodoUseCase.execute).mockResolvedValue(mockTodo);

      // Act
      const result = await service.createTodo(createData);

      // Assert
      expect(result).toBe(mockTodo);
      expect(mockCreateTodoUseCase.execute).toHaveBeenCalledWith({
        title: 'Simple todo',
        priority: 'medium',
        dueDate: undefined,
      });
    });

    it('should propagate errors from use case', async () => {
      // Arrange
      const createData: CreateTodoData = {
        title: 'Test todo',
      };
      const error = new Error('Use case error');
      vi.mocked(mockCreateTodoUseCase.execute).mockRejectedValue(error);

      // Act & Assert
      await expect(service.createTodo(createData)).rejects.toThrow('Use case error');
    });
  });

  describe('updateTodo', () => {
    it('should update a todo with valid data', async () => {
      // Arrange
      const id = TEST_UUIDS.TODO_1;
      const updateData: UpdateTodoData = {
        title: 'Updated todo',
        completed: true,
        priority: 'low',
        dueDate: new Date('2025-12-25'),
      };
      const mockTodo = new Todo('Updated todo', 'low', new Date('2025-12-25'));
      vi.mocked(mockUpdateTodoUseCase.execute).mockResolvedValue(mockTodo);

      // Act
      const result = await service.updateTodo(id, updateData);

      // Assert
      expect(result).toBe(mockTodo);
      expect(mockUpdateTodoUseCase.execute).toHaveBeenCalledWith({
        id,
        title: 'Updated todo',
        completed: true,
        priority: 'low',
        dueDate: new Date('2025-12-25'),
      });
    });

    it('should update a todo with partial data', async () => {
      // Arrange
      const id = TEST_UUIDS.TODO_1;
      const updateData: UpdateTodoData = {
        completed: true,
      };
      const mockTodo = new Todo('Existing todo');
      vi.mocked(mockUpdateTodoUseCase.execute).mockResolvedValue(mockTodo);

      // Act
      const result = await service.updateTodo(id, updateData);

      // Assert
      expect(result).toBe(mockTodo);
      expect(mockUpdateTodoUseCase.execute).toHaveBeenCalledWith({
        id,
        title: undefined,
        completed: true,
        priority: undefined,
        dueDate: undefined,
      });
    });

    it('should propagate errors from use case', async () => {
      // Arrange
      const id = TEST_UUIDS.TODO_1;
      const updateData: UpdateTodoData = { title: 'Updated' };
      const error = new Error('Update error');
      vi.mocked(mockUpdateTodoUseCase.execute).mockRejectedValue(error);

      // Act & Assert
      await expect(service.updateTodo(id, updateData)).rejects.toThrow('Update error');
    });
  });

  describe('deleteTodo', () => {
    it('should delete a todo by id', async () => {
      // Arrange
      const id = TEST_UUIDS.TODO_1;
      vi.mocked(mockDeleteTodoUseCase.execute).mockResolvedValue(undefined);

      // Act
      await service.deleteTodo(id);

      // Assert
      expect(mockDeleteTodoUseCase.execute).toHaveBeenCalledWith({ id });
      expect(mockDeleteTodoUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from use case', async () => {
      // Arrange
      const id = TEST_UUIDS.TODO_1;
      const error = new Error('Delete error');
      vi.mocked(mockDeleteTodoUseCase.execute).mockRejectedValue(error);

      // Act & Assert
      await expect(service.deleteTodo(id)).rejects.toThrow('Delete error');
    });
  });

  describe('toggleTodo', () => {
    it('should toggle a todo by id', async () => {
      // Arrange
      const id = TEST_UUIDS.TODO_1;
      const mockTodo = new Todo('Toggled todo');
      vi.mocked(mockToggleTodoUseCase.execute).mockResolvedValue(mockTodo);

      // Act
      const result = await service.toggleTodo(id);

      // Assert
      expect(result).toBe(mockTodo);
      expect(mockToggleTodoUseCase.execute).toHaveBeenCalledWith({ id });
      expect(mockToggleTodoUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from use case', async () => {
      // Arrange
      const id = TEST_UUIDS.TODO_1;
      const error = new Error('Toggle error');
      vi.mocked(mockToggleTodoUseCase.execute).mockRejectedValue(error);

      // Act & Assert
      await expect(service.toggleTodo(id)).rejects.toThrow('Toggle error');
    });
  });
});