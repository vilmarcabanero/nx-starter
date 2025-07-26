import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ToggleTodoUseCase } from './ToggleTodoUseCase';
import {
  Todo,
  TodoNotFoundException,
  TodoTitle,
} from '@nx-starter/domain';
import type { ITodoRepository } from '@nx-starter/domain';
import type { ToggleTodoCommand } from '../../dto/TodoCommands';
import { TEST_UUIDS } from '@nx-starter/utils-core';

describe('ToggleTodoUseCase', () => {
  let useCase: ToggleTodoUseCase;
  let mockRepository: ITodoRepository;
  let incompleteTodo: Todo;
  let completedTodo: Todo;

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

    // Create sample todos
    incompleteTodo = new Todo(
      new TodoTitle('Incomplete todo'),
      false,
      new Date('2025-01-01'),
      TEST_UUIDS.TOGGLE_TODO,
      'medium',
      undefined
    );

    completedTodo = new Todo(
      new TodoTitle('Completed todo'),
      true,
      new Date('2025-01-01'),
      TEST_UUIDS.TODO_1,
      'high',
      new Date('2025-12-31')
    );

    useCase = new ToggleTodoUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should toggle incomplete todo to completed', async () => {
      // Arrange
      const command: ToggleTodoCommand = {
        id: TEST_UUIDS.TOGGLE_TODO,
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(incompleteTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.completed).toBe(true);
      expect(mockRepository.update).toHaveBeenCalledWith(
        TEST_UUIDS.TOGGLE_TODO,
        {
          completed: true,
        }
      );
    });

    it('should toggle completed todo to incomplete', async () => {
      // Arrange
      const command: ToggleTodoCommand = {
        id: TEST_UUIDS.TODO_1,
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(completedTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.completed).toBe(false);
      expect(mockRepository.update).toHaveBeenCalledWith(
        TEST_UUIDS.TODO_1,
        {
          completed: false,
        }
      );
    });

    it('should throw TodoNotFoundException when todo does not exist', async () => {
      // Arrange
      const command: ToggleTodoCommand = {
        id: TEST_UUIDS.NONEXISTENT_TODO,
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(undefined);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(
        TodoNotFoundException
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should preserve other todo properties when toggling', async () => {
      // Arrange
      const command: ToggleTodoCommand = {
        id: TEST_UUIDS.TOGGLE_TODO,
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(incompleteTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.title.value).toBe('Incomplete todo');
      expect(result.priority.level).toBe('medium');
      expect(result.createdAt).toEqual(incompleteTodo.createdAt);
      expect(result.id?.value).toBe(TEST_UUIDS.TOGGLE_TODO);
    });

    it('should validate todo after toggling', async () => {
      // Arrange
      const command: ToggleTodoCommand = {
        id: TEST_UUIDS.TOGGLE_TODO,
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(incompleteTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result).toBeInstanceOf(Todo);
      expect(mockRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should handle repository errors during getById', async () => {
      // Arrange
      const command: ToggleTodoCommand = {
        id: TEST_UUIDS.TODO_2,
      };
      const error = new Error('Repository error');
      vi.mocked(mockRepository.getById).mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(
        'Repository error'
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should handle repository errors during update', async () => {
      // Arrange
      const command: ToggleTodoCommand = {
        id: TEST_UUIDS.TOGGLE_TODO,
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(incompleteTodo);
      const error = new Error('Update error');
      vi.mocked(mockRepository.update).mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow('Update error');
      expect(mockRepository.getById).toHaveBeenCalledWith(
        TEST_UUIDS.TOGGLE_TODO
      );
      expect(mockRepository.update).toHaveBeenCalledWith(
        TEST_UUIDS.TOGGLE_TODO,
        {
          completed: true,
        }
      );
    });

    it('should check todo existence before toggling', async () => {
      // Arrange
      const command: ToggleTodoCommand = {
        id: TEST_UUIDS.TOGGLE_TODO,
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(incompleteTodo);

      // Act
      await useCase.execute(command);

      // Assert
      expect(mockRepository.getById).toHaveBeenCalledBefore(
        vi.mocked(mockRepository.update)
      );
    });

    it('should work with todos that have due dates', async () => {
      // Arrange
      const command: ToggleTodoCommand = {
        id: TEST_UUIDS.TODO_1,
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(completedTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.completed).toBe(false);
      expect(result.dueDate).toEqual(completedTodo.dueDate);
    });
  });
});
