import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteTodoUseCase } from './DeleteTodoUseCase';
import {
  Todo,
  TodoNotFoundException,
  TodoTitle,
} from '@nx-starter/domain';
import type { ITodoRepository } from '@nx-starter/domain';
import type { DeleteTodoCommand } from '../../dto/TodoCommands';
import { TEST_UUIDS } from '@nx-starter/utils-core';

describe('DeleteTodoUseCase', () => {
  let useCase: DeleteTodoUseCase;
  let mockRepository: ITodoRepository;
  let existingTodo: Todo;

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

    // Create a sample existing todo
    existingTodo = new Todo(
      new TodoTitle('Existing todo'),
      false,
      new Date('2025-01-01'),
      TEST_UUIDS.DELETE_TODO,
      'medium',
      undefined
    );

    useCase = new DeleteTodoUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should delete existing todo', async () => {
      // Arrange
      const command: DeleteTodoCommand = {
        id: TEST_UUIDS.DELETE_TODO,
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(existingTodo);

      // Act
      await useCase.execute(command);

      // Assert
      expect(mockRepository.getById).toHaveBeenCalledWith(
        TEST_UUIDS.DELETE_TODO
      );
      expect(mockRepository.delete).toHaveBeenCalledWith(
        TEST_UUIDS.DELETE_TODO
      );
    });

    it('should throw TodoNotFoundException when todo does not exist', async () => {
      // Arrange
      const command: DeleteTodoCommand = {
        id: TEST_UUIDS.NONEXISTENT_TODO,
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(undefined);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(
        TodoNotFoundException
      );
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle repository errors during getById', async () => {
      // Arrange
      const command: DeleteTodoCommand = {
        id: TEST_UUIDS.DELETE_TODO,
      };
      const error = new Error('Repository error');
      vi.mocked(mockRepository.getById).mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(
        'Repository error'
      );
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle repository errors during delete', async () => {
      // Arrange
      const command: DeleteTodoCommand = {
        id: TEST_UUIDS.DELETE_TODO,
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(existingTodo);
      const error = new Error('Delete error');
      vi.mocked(mockRepository.delete).mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow('Delete error');
      expect(mockRepository.getById).toHaveBeenCalledWith(
        TEST_UUIDS.DELETE_TODO
      );
      expect(mockRepository.delete).toHaveBeenCalledWith(
        TEST_UUIDS.DELETE_TODO
      );
    });

    it('should check todo existence before deletion', async () => {
      // Arrange
      const command: DeleteTodoCommand = {
        id: TEST_UUIDS.DELETE_TODO,
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(existingTodo);

      // Act
      await useCase.execute(command);

      // Assert
      expect(mockRepository.getById).toHaveBeenCalledBefore(
        vi.mocked(mockRepository.delete)
      );
    });

    it('should handle different todo states consistently', async () => {
      // Arrange
      const completedTodo = new Todo(
        new TodoTitle('Completed todo'),
        true,
        new Date('2025-01-01'),
        TEST_UUIDS.TODO_1,
        'high',
        new Date('2025-12-31')
      );
      const command: DeleteTodoCommand = {
        id: TEST_UUIDS.TODO_1,
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(completedTodo);

      // Act
      await useCase.execute(command);

      // Assert
      expect(mockRepository.delete).toHaveBeenCalledWith(
        TEST_UUIDS.TODO_1
      );
    });
  });
});
