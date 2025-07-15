import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TodoCommandService } from './TodoCommandService';
import { Todo } from '@/core/domain/todo/entities/Todo';
import type { CreateTodoData, UpdateTodoData } from '@/core/application/shared/interfaces/ITodoService';
import { TEST_UUIDS, generateTestUuid } from '@/test/test-helpers';

describe('TodoCommandService', () => {
  let service: TodoCommandService;
  let mockCreateUseCase: { execute: ReturnType<typeof vi.fn> };
  let mockUpdateUseCase: { execute: ReturnType<typeof vi.fn> };
  let mockDeleteUseCase: { execute: ReturnType<typeof vi.fn> };
  let mockToggleUseCase: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    // Create mock use cases
    mockCreateUseCase = {
      execute: vi.fn(),
    };

    mockUpdateUseCase = {
      execute: vi.fn(),
    };

    mockDeleteUseCase = {
      execute: vi.fn(),
    };

    mockToggleUseCase = {
      execute: vi.fn(),
    };

    service = new TodoCommandService(
      mockCreateUseCase as never,
      mockUpdateUseCase as never,
      mockDeleteUseCase as never,
      mockToggleUseCase as never
    );
  });

  describe('createTodo', () => {
    it('should create a todo with valid data', async () => {
      // Arrange
      const data: CreateTodoData = {
        title: 'New Todo',
        priority: 'high',
        dueDate: new Date('2024-12-31'),
      };
      
      const expectedTodo = new Todo('New Todo', false, new Date(), TEST_UUIDS.TODO_1, 'high');
      vi.mocked(mockCreateUseCase.execute).mockResolvedValue(expectedTodo);

      // Act
      const result = await service.createTodo(data);

      // Assert
      expect(result).toBe(expectedTodo);
      expect(mockCreateUseCase.execute).toHaveBeenCalledWith({
        title: 'New Todo',
        priority: 'high',
        dueDate: new Date('2024-12-31'),
      });
      expect(mockCreateUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should create a todo with minimal data', async () => {
      // Arrange
      const data: CreateTodoData = {
        title: 'Simple Todo',
      };
      
      const expectedTodo = new Todo('Simple Todo', false, new Date(), 'b2c3d4e5f6789012345678901234abcd');
      vi.mocked(mockCreateUseCase.execute).mockResolvedValue(expectedTodo);

      // Act
      const result = await service.createTodo(data);

      // Assert
      expect(result).toBe(expectedTodo);
      expect(mockCreateUseCase.execute).toHaveBeenCalledWith({
        title: 'Simple Todo',
        priority: undefined,
        dueDate: undefined,
      });
    });

    it('should propagate errors from use case', async () => {
      // Arrange
      const data: CreateTodoData = {
        title: '',
      };
      
      const error = new Error('Title cannot be empty');
      vi.mocked(mockCreateUseCase.execute).mockRejectedValue(error);

      // Act & Assert
      await expect(service.createTodo(data)).rejects.toThrow('Title cannot be empty');
      expect(mockCreateUseCase.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateTodo', () => {
    it('should update a todo with complete data', async () => {
      // Arrange
      const id = 'c3d4e5f6789012345678901234abcdef';
      const updates: UpdateTodoData = {
        title: 'Updated Todo',
        completed: true,
        priority: 'low',
        dueDate: new Date('2024-12-25'),
      };
      
      const expectedTodo = new Todo('Updated Todo', true, new Date(), id, 'low');
      vi.mocked(mockUpdateUseCase.execute).mockResolvedValue(expectedTodo);

      // Act
      const result = await service.updateTodo(id, updates);

      // Assert
      expect(result).toBe(expectedTodo);
      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({
        id: 'c3d4e5f6789012345678901234abcdef',
        title: 'Updated Todo',
        completed: true,
        priority: 'low',
        dueDate: new Date('2024-12-25'),
      });
      expect(mockUpdateUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should update a todo with partial data', async () => {
      // Arrange
      const id = 'd4e5f6789012345678901234abcdef01';
      const updates: UpdateTodoData = {
        completed: true,
      };
      
      const expectedTodo = new Todo('Original Todo', true, new Date(), id);
      vi.mocked(mockUpdateUseCase.execute).mockResolvedValue(expectedTodo);

      // Act
      const result = await service.updateTodo(id, updates);

      // Assert
      expect(result).toBe(expectedTodo);
      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({
        id: 'd4e5f6789012345678901234abcdef01',
        title: undefined,
        completed: true,
        priority: undefined,
        dueDate: undefined,
      });
    });

    it('should propagate errors from use case', async () => {
      // Arrange
      const id = 'e5f6789012345678901234abcdef0123';
      const updates: UpdateTodoData = { title: 'New Title' };
      
      const error = new Error('Todo not found');
      vi.mocked(mockUpdateUseCase.execute).mockRejectedValue(error);

      // Act & Assert
      await expect(service.updateTodo(id, updates)).rejects.toThrow('Todo not found');
      expect(mockUpdateUseCase.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteTodo', () => {
    it('should delete a todo by id', async () => {
      // Arrange
      const id = 'f6789012345678901234abcdef0123456';
      vi.mocked(mockDeleteUseCase.execute).mockResolvedValue(undefined);

      // Act
      await service.deleteTodo(id);

      // Assert
      expect(mockDeleteUseCase.execute).toHaveBeenCalledWith({ id: 'f6789012345678901234abcdef0123456' });
      expect(mockDeleteUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from use case', async () => {
      // Arrange
      const id = '789012345678901234abcdef01234567';
      const error = new Error('Todo not found');
      vi.mocked(mockDeleteUseCase.execute).mockRejectedValue(error);

      // Act & Assert
      await expect(service.deleteTodo(id)).rejects.toThrow('Todo not found');
      expect(mockDeleteUseCase.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('toggleTodo', () => {
    it('should toggle a todo by id', async () => {
      // Arrange
      const id = TEST_UUIDS.TODO_2;
      const expectedTodo = new Todo('Toggled Todo', true, new Date(), id);
      vi.mocked(mockToggleUseCase.execute).mockResolvedValue(expectedTodo);

      // Act
      const result = await service.toggleTodo(id);

      // Assert
      expect(result).toBe(expectedTodo);
      expect(mockToggleUseCase.execute).toHaveBeenCalledWith({ id });
      expect(mockToggleUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from use case', async () => {
      // Arrange
      const id = '9012345678901234abcdef0123456789a';
      const error = new Error('Todo not found');
      vi.mocked(mockToggleUseCase.execute).mockRejectedValue(error);

      // Act & Assert
      await expect(service.toggleTodo(id)).rejects.toThrow('Todo not found');
      expect(mockToggleUseCase.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('integration scenarios', () => {
    it('should handle multiple operations in sequence', async () => {
      // Arrange
      const createData: CreateTodoData = { title: 'Test Todo' };
      const updateData: UpdateTodoData = { completed: true };
      
      const todoId = TEST_UUIDS.TODO_3;
      const createdTodo = new Todo('Test Todo', false, new Date(), todoId);
      const updatedTodo = new Todo('Test Todo', true, new Date(), todoId);
      
      vi.mocked(mockCreateUseCase.execute).mockResolvedValue(createdTodo);
      vi.mocked(mockUpdateUseCase.execute).mockResolvedValue(updatedTodo);
      vi.mocked(mockDeleteUseCase.execute).mockResolvedValue(undefined);

      // Act
      const created = await service.createTodo(createData);
      const updated = await service.updateTodo(todoId, updateData);
      await service.deleteTodo(todoId);

      // Assert
      expect(created).toBe(createdTodo);
      expect(updated).toBe(updatedTodo);
      expect(mockCreateUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockUpdateUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockDeleteUseCase.execute).toHaveBeenCalledTimes(1);
    });
  });
});
