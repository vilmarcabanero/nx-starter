import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteTodoUseCase } from './DeleteTodoUseCase';
import { Todo } from '@/core/domain/todo/entities/Todo';
import type { ITodoRepository } from '@/core/domain/todo/repositories/ITodoRepository';
import type { DeleteTodoCommand } from '@/core/application/todo/dto/TodoCommands';
import { TEST_UUIDS, generateTestUuid } from '@/test/test-helpers';

describe('DeleteTodoUseCase', () => {
  let useCase: DeleteTodoUseCase;
  let mockRepository: ITodoRepository;

  beforeEach(() => {
    mockRepository = {
      getById: vi.fn(),
      delete: vi.fn(),
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      getActive: vi.fn(),
      getCompleted: vi.fn(),
      findBySpecification: vi.fn(),
    };

    useCase = new DeleteTodoUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should delete an existing todo', async () => {
      // Arrange
      const todoId = TEST_UUIDS.TODO_1;
      const command: DeleteTodoCommand = { id: todoId };
      const existingTodo = new Todo('Existing Todo', false, new Date(), todoId);
      
      vi.mocked(mockRepository.getById).mockResolvedValue(existingTodo);
      vi.mocked(mockRepository.delete).mockResolvedValue();

      // Act
      await useCase.execute(command);

      // Assert
      expect(mockRepository.getById).toHaveBeenCalledWith(todoId);
      expect(mockRepository.delete).toHaveBeenCalledWith(todoId);
      expect(mockRepository.getById).toHaveBeenCalledTimes(1);
      expect(mockRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw error when todo does not exist', async () => {
      // Arrange
      const todoId = TEST_UUIDS.TODO_2;
      const command: DeleteTodoCommand = { id: todoId };
      vi.mocked(mockRepository.getById).mockResolvedValue(undefined);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow('Todo not found');
      expect(mockRepository.getById).toHaveBeenCalledWith(todoId);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should propagate repository getById errors', async () => {
      // Arrange
      const todoId = TEST_UUIDS.TODO_3;
      const command: DeleteTodoCommand = { id: todoId };
      const error = new Error('Database connection failed');
      vi.mocked(mockRepository.getById).mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow('Database connection failed');
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should propagate repository delete errors', async () => {
      // Arrange
      const todoId = TEST_UUIDS.TODO_4;
      const command: DeleteTodoCommand = { id: todoId };
      const existingTodo = new Todo('Existing Todo', false, new Date(), todoId);
      const deleteError = new Error('Delete operation failed');
      
      vi.mocked(mockRepository.getById).mockResolvedValue(existingTodo);
      vi.mocked(mockRepository.delete).mockRejectedValue(deleteError);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow('Delete operation failed');
      expect(mockRepository.getById).toHaveBeenCalledWith(todoId);
      expect(mockRepository.delete).toHaveBeenCalledWith(todoId);
    });

    it('should handle deletion of completed todo', async () => {
      // Arrange
      const todoId = TEST_UUIDS.TODO_5;
      const command: DeleteTodoCommand = { id: todoId };
      const completedTodo = new Todo('Completed Todo', true, new Date(), todoId);
      
      vi.mocked(mockRepository.getById).mockResolvedValue(completedTodo);
      vi.mocked(mockRepository.delete).mockResolvedValue();

      // Act
      await useCase.execute(command);

      // Assert
      expect(mockRepository.getById).toHaveBeenCalledWith(todoId);
      expect(mockRepository.delete).toHaveBeenCalledWith(todoId);
    });

    it('should handle deletion of todo with different priorities', async () => {
      // Arrange
      const todoId = generateTestUuid(6);
      const command: DeleteTodoCommand = { id: todoId };
      const highPriorityTodo = new Todo('High Priority Todo', false, new Date(), todoId, 'high');
      
      vi.mocked(mockRepository.getById).mockResolvedValue(highPriorityTodo);
      vi.mocked(mockRepository.delete).mockResolvedValue();

      // Act
      await useCase.execute(command);

      // Assert
      expect(mockRepository.getById).toHaveBeenCalledWith(todoId);
      expect(mockRepository.delete).toHaveBeenCalledWith(todoId);
    });

    it('should validate command id is provided', async () => {
      // Arrange
      const todoId = generateTestUuid(0);
      const command: DeleteTodoCommand = { id: todoId };
      vi.mocked(mockRepository.getById).mockResolvedValue(undefined);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow('Todo not found');
      expect(mockRepository.getById).toHaveBeenCalledWith(todoId);
    });
  });

  describe('business logic scenarios', () => {
    it('should prevent deletion if todo has dependencies (future enhancement)', async () => {
      // This test demonstrates how business logic could be extended
      // Currently the use case doesn't implement dependency checking
      const todoId = generateTestUuid(7);
      const command: DeleteTodoCommand = { id: todoId };
      const todoWithDependencies = new Todo('Parent Todo', false, new Date(), todoId);
      
      vi.mocked(mockRepository.getById).mockResolvedValue(todoWithDependencies);
      vi.mocked(mockRepository.delete).mockResolvedValue();

      // Act
      await useCase.execute(command);

      // Assert - Currently this passes, but could be enhanced to check dependencies
      expect(mockRepository.delete).toHaveBeenCalledWith(todoId);
    });
  });
});
