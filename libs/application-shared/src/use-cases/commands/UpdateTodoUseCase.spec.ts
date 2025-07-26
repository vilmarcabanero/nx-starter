import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateTodoUseCase } from './UpdateTodoUseCase';
import {
  Todo,
  TodoNotFoundException,
  TodoTitle,
  TodoPriority,
} from '@nx-starter/domain';
import type { ITodoRepository } from '@nx-starter/domain';
import type { UpdateTodoCommand } from '../../dto/TodoCommands';
import { TEST_UUIDS } from '@nx-starter/utils-core';

describe('UpdateTodoUseCase', () => {
  let useCase: UpdateTodoUseCase;
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
      TEST_UUIDS.UPDATE_TODO,
      'medium',
      undefined
    );

    useCase = new UpdateTodoUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should update todo title', async () => {
      // Arrange
      const command: UpdateTodoCommand = {
        id: TEST_UUIDS.UPDATE_TODO,
        title: 'Updated title',
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(existingTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.title.value).toBe('Updated title');
      expect(mockRepository.update).toHaveBeenCalledWith(
        TEST_UUIDS.UPDATE_TODO,
        {
          title: expect.any(TodoTitle),
          completed: false,
          priority: expect.any(TodoPriority),
          dueDate: undefined,
        }
      );
    });

    it('should update todo completion status', async () => {
      // Arrange
      const command: UpdateTodoCommand = {
        id: TEST_UUIDS.UPDATE_TODO,
        completed: true,
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(existingTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.completed).toBe(true);
      expect(mockRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should update todo priority', async () => {
      // Arrange
      const command: UpdateTodoCommand = {
        id: TEST_UUIDS.UPDATE_TODO,
        priority: 'high',
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(existingTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.priority.level).toBe('high');
      expect(mockRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should update todo due date', async () => {
      // Arrange
      const dueDate = new Date('2025-12-31');
      const command: UpdateTodoCommand = {
        id: TEST_UUIDS.UPDATE_TODO,
        dueDate,
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(existingTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.dueDate).toEqual(dueDate);
      expect(mockRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should update multiple fields at once', async () => {
      // Arrange
      const command: UpdateTodoCommand = {
        id: TEST_UUIDS.UPDATE_TODO,
        title: 'Updated title',
        completed: true,
        priority: 'high',
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(existingTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.title.value).toBe('Updated title');
      expect(result.completed).toBe(true);
      expect(result.priority.level).toBe('high');
      expect(mockRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should handle toggling completion from false to true', async () => {
      // Arrange
      const command: UpdateTodoCommand = {
        id: TEST_UUIDS.UPDATE_TODO,
        completed: true,
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(existingTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.completed).toBe(true);
    });

    it('should handle toggling completion from true to false', async () => {
      // Arrange
      const completedTodo = new Todo(
        new TodoTitle('Completed todo'),
        true,
        new Date('2025-01-01'),
        TEST_UUIDS.TODO_1,
        'medium',
        undefined
      );
      const command: UpdateTodoCommand = {
        id: TEST_UUIDS.TODO_1,
        completed: false,
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(completedTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.completed).toBe(false);
    });

    it('should throw TodoNotFoundException when todo does not exist', async () => {
      // Arrange
      const command: UpdateTodoCommand = {
        id: TEST_UUIDS.NONEXISTENT_TODO,
        title: 'Updated title',
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(undefined);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(
        TodoNotFoundException
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should validate todo after updates', async () => {
      // Arrange
      const command: UpdateTodoCommand = {
        id: TEST_UUIDS.UPDATE_TODO,
        title: 'Updated title',
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(existingTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result).toBeInstanceOf(Todo);
      expect(mockRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const command: UpdateTodoCommand = {
        id: TEST_UUIDS.UPDATE_TODO,
        title: 'Updated title',
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(existingTodo);
      const error = new Error('Repository error');
      vi.mocked(mockRepository.update).mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(
        'Repository error'
      );
    });
  });
});
