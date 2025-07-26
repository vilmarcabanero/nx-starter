import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateTodoUseCase } from './CreateTodoUseCase';
import { Todo, InvalidTodoTitleException } from '@nx-starter/domain';
import type { ITodoRepository } from '@nx-starter/domain';
import type { CreateTodoCommand } from '../../dto/TodoCommands';
import { TEST_UUIDS } from '@nx-starter/utils-core';

describe('CreateTodoUseCase', () => {
  let useCase: CreateTodoUseCase;
  let mockRepository: ITodoRepository;

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

    useCase = new CreateTodoUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should create a todo with valid command', async () => {
      // Arrange
      const command: CreateTodoCommand = {
        title: 'Valid todo title',
        priority: 'medium',
      };
      const expectedId = TEST_UUIDS.CREATE_TODO;
      vi.mocked(mockRepository.create).mockResolvedValue(expectedId);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result).toBeInstanceOf(Todo);
      expect(result.title.value).toBe('Valid todo title');
      expect(result.completed).toBe(false);
      expect(result.priority.level).toBe('medium');
      expect(result.id?.value).toBe(expectedId);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should create a todo with default priority when not specified', async () => {
      // Arrange
      const command: CreateTodoCommand = {
        title: 'Todo without priority',
      };
      const expectedId = TEST_UUIDS.TODO_1;
      vi.mocked(mockRepository.create).mockResolvedValue(expectedId);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.priority.level).toBe('medium');
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should create a todo with due date when specified', async () => {
      // Arrange
      const dueDate = new Date('2025-12-31');
      const command: CreateTodoCommand = {
        title: 'Todo with due date',
        priority: 'high',
        dueDate,
      };
      const expectedId = TEST_UUIDS.TODO_2;
      vi.mocked(mockRepository.create).mockResolvedValue(expectedId);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.dueDate).toEqual(dueDate);
      expect(result.priority.level).toBe('high');
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw InvalidTodoTitleException when title is invalid', async () => {
      // Arrange
      const command: CreateTodoCommand = {
        title: 'a', // Too short
      };

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(
        InvalidTodoTitleException
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw InvalidTodoTitleException when title is empty', async () => {
      // Arrange
      const command: CreateTodoCommand = {
        title: '',
      };

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(
        InvalidTodoTitleException
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should validate todo before creating', async () => {
      // Arrange
      const command: CreateTodoCommand = {
        title: 'Valid todo title',
        priority: 'high',
      };
      const expectedId = TEST_UUIDS.TODO_3;
      vi.mocked(mockRepository.create).mockResolvedValue(expectedId);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result).toBeInstanceOf(Todo);
      expect(mockRepository.create).toHaveBeenCalledWith(expect.any(Todo));
    });

    it('should handle repository errors', async () => {
      // Arrange
      const command: CreateTodoCommand = {
        title: 'Valid todo title',
      };
      const error = new Error('Repository error');
      vi.mocked(mockRepository.create).mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(
        'Repository error'
      );
    });
  });
});
