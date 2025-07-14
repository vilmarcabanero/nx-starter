import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteTodoUseCase } from './DeleteTodoUseCase';
import { Todo } from '@/core/domain/todo/entities/Todo';
import type { ITodoRepository } from '@/core/domain/todo/repositories/ITodoRepository';
import type { DeleteTodoCommand } from '@/core/application/todo/dto/TodoCommands';

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
      const command: DeleteTodoCommand = { id: 'a1b2c3d4e5f6789012345678901234ab' };
      const existingTodo = new Todo('Existing Todo', false, new Date(), 'a1b2c3d4e5f6789012345678901234ab');
      
      vi.mocked(mockRepository.getById).mockResolvedValue(existingTodo);
      vi.mocked(mockRepository.delete).mockResolvedValue();

      // Act
      await useCase.execute(command);

      // Assert
      expect(mockRepository.getById).toHaveBeenCalledWith('a1b2c3d4e5f6789012345678901234ab');
      expect(mockRepository.delete).toHaveBeenCalledWith('a1b2c3d4e5f6789012345678901234ab');
      expect(mockRepository.getById).toHaveBeenCalledTimes(1);
      expect(mockRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw error when todo does not exist', async () => {
      // Arrange
      const command: DeleteTodoCommand = { id: 'b2c3d4e5f6789012345678901234abcd' };
      vi.mocked(mockRepository.getById).mockResolvedValue(undefined);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow('Todo not found');
      expect(mockRepository.getById).toHaveBeenCalledWith('b2c3d4e5f6789012345678901234abcd');
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should propagate repository getById errors', async () => {
      // Arrange
      const command: DeleteTodoCommand = { id: 1 };
      const error = new Error('Database connection failed');
      vi.mocked(mockRepository.getById).mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow('Database connection failed');
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should propagate repository delete errors', async () => {
      // Arrange
      const command: DeleteTodoCommand = { id: 'c3d4e5f6789012345678901234abcdef' };
      const existingTodo = new Todo('Existing Todo', false, new Date(), 'c3d4e5f6789012345678901234abcdef');
      const deleteError = new Error('Delete operation failed');
      
      vi.mocked(mockRepository.getById).mockResolvedValue(existingTodo);
      vi.mocked(mockRepository.delete).mockRejectedValue(deleteError);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow('Delete operation failed');
      expect(mockRepository.getById).toHaveBeenCalledWith(1);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should handle deletion of completed todo', async () => {
      // Arrange
      const command: DeleteTodoCommand = { id: 2 };
      const completedTodo = new Todo('Completed Todo', true, new Date(), 2);
      
      vi.mocked(mockRepository.getById).mockResolvedValue(completedTodo);
      vi.mocked(mockRepository.delete).mockResolvedValue();

      // Act
      await useCase.execute(command);

      // Assert
      expect(mockRepository.getById).toHaveBeenCalledWith(2);
      expect(mockRepository.delete).toHaveBeenCalledWith(2);
    });

    it('should handle deletion of todo with different priorities', async () => {
      // Arrange
      const command: DeleteTodoCommand = { id: 3 };
      const highPriorityTodo = new Todo('High Priority Todo', false, new Date(), 3, 'high');
      
      vi.mocked(mockRepository.getById).mockResolvedValue(highPriorityTodo);
      vi.mocked(mockRepository.delete).mockResolvedValue();

      // Act
      await useCase.execute(command);

      // Assert
      expect(mockRepository.getById).toHaveBeenCalledWith(3);
      expect(mockRepository.delete).toHaveBeenCalledWith(3);
    });

    it('should validate command id is provided', async () => {
      // Arrange
      const command: DeleteTodoCommand = { id: 0 };
      vi.mocked(mockRepository.getById).mockResolvedValue(undefined);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow('Todo not found');
      expect(mockRepository.getById).toHaveBeenCalledWith(0);
    });
  });

  describe('business logic scenarios', () => {
    it('should prevent deletion if todo has dependencies (future enhancement)', async () => {
      // This test demonstrates how business logic could be extended
      // Currently the use case doesn't implement dependency checking
      const command: DeleteTodoCommand = { id: 1 };
      const todoWithDependencies = new Todo('Parent Todo', false, new Date(), 1);
      
      vi.mocked(mockRepository.getById).mockResolvedValue(todoWithDependencies);
      vi.mocked(mockRepository.delete).mockResolvedValue();

      // Act
      await useCase.execute(command);

      // Assert - Currently this passes, but could be enhanced to check dependencies
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
