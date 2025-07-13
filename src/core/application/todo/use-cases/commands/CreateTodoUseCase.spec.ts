import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateTodoUseCase } from './CreateTodoUseCase';
import { Todo } from '@/core/domain/todo/entities/Todo';
import { InvalidTodoTitleException } from '@/core/domain/todo/exceptions/DomainExceptions';
import type { ITodoRepository } from '@/core/domain/todo/repositories/ITodoRepository';
import type { CreateTodoCommand } from '@/core/application/todo/dto/TodoCommands';

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
        priority: 'medium'
      };
      const expectedId = 123;
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

    it('should create todo with default priority when not specified', async () => {
      // Arrange
      const command: CreateTodoCommand = {
        title: 'Todo without priority'
      };
      const expectedId = 456;
      vi.mocked(mockRepository.create).mockResolvedValue(expectedId);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.priority.level).toBe('medium');
    });

    it('should create todo with due date when specified', async () => {
      // Arrange
      const dueDate = new Date('2025-12-31'); // Future date
      const command: CreateTodoCommand = {
        title: 'Todo with due date',
        priority: 'high',
        dueDate
      };
      const expectedId = 789;
      vi.mocked(mockRepository.create).mockResolvedValue(expectedId);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.dueDate).toEqual(dueDate);
      expect(result.priority.level).toBe('high');
    });

    it('should throw InvalidTodoTitleException for empty title', async () => {
      // Arrange
      const command: CreateTodoCommand = {
        title: ''
      };

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(InvalidTodoTitleException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw InvalidTodoTitleException for whitespace only title', async () => {
      // Arrange
      const command: CreateTodoCommand = {
        title: '   '
      };

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(InvalidTodoTitleException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw InvalidTodoTitleException for title too short', async () => {
      // Arrange
      const command: CreateTodoCommand = {
        title: 'a'
      };

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(InvalidTodoTitleException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw InvalidTodoTitleException for title too long', async () => {
      // Arrange
      const command: CreateTodoCommand = {
        title: 'a'.repeat(256)
      };

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(InvalidTodoTitleException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      // Arrange
      const command: CreateTodoCommand = {
        title: 'Valid todo title'
      };
      const repositoryError = new Error('Database connection failed');
      vi.mocked(mockRepository.create).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow('Database connection failed');
    });

    it('should trim title whitespace before creating todo', async () => {
      // Arrange
      const command: CreateTodoCommand = {
        title: '  Todo with spaces  '
      };
      const expectedId = 999;
      vi.mocked(mockRepository.create).mockResolvedValue(expectedId);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.title.value).toBe('Todo with spaces');
    });

    it('should validate business invariants before persisting', async () => {
      // Arrange
      const command: CreateTodoCommand = {
        title: 'Valid todo title',
        priority: 'high'
      };
      const expectedId = 111;
      vi.mocked(mockRepository.create).mockResolvedValue(expectedId);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.completed).toBe(false); // Business rule: new todos are always incomplete
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should create todo with all priority levels', async () => {
      // Arrange & Act & Assert for each priority level
      const priorities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
      
      for (const priority of priorities) {
        const command: CreateTodoCommand = {
          title: `Todo with ${priority} priority`,
          priority
        };
        const expectedId = Math.floor(Math.random() * 1000);
        vi.mocked(mockRepository.create).mockResolvedValue(expectedId);

        const result = await useCase.execute(command);

        expect(result.priority.level).toBe(priority);
      }
    });
  });
});
