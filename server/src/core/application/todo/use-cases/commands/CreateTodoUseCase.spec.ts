import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateTodoUseCase } from './CreateTodoUseCase';
import { Todo } from '@/core/domain/todo/entities/Todo';
import { TodoTitle } from '@/core/domain/todo/value-objects/TodoTitle';
import type { ITodoRepository } from '@/core/domain/todo/repositories/ITodoRepository';
import type { CreateTodoCommand } from '@/core/application/todo/dto/TodoCommands';

describe('CreateTodoUseCase', () => {
  let useCase: CreateTodoUseCase;
  let mockRepository: ITodoRepository;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      getAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getById: vi.fn(),
      getActive: vi.fn(),
      getCompleted: vi.fn(),
      count: vi.fn(),
      countActive: vi.fn(),
      countCompleted: vi.fn(),
      findBySpecification: vi.fn(),
    };

    useCase = new CreateTodoUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should create a todo with required fields only', async () => {
      const command: CreateTodoCommand = {
        title: 'Test Todo'
      };

      vi.mocked(mockRepository.create).mockResolvedValue('created-id');

      const result = await useCase.execute(command);

      expect(result).toBeInstanceOf(Todo);
      expect(result.title.value).toBe('Test Todo');
      expect(result.completed).toBe(false);
      expect(result.priority.level).toBe('medium'); // default priority
      expect(result.dueDate).toBeUndefined();
      expect(result.id?.value).toBe('created-id');
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should create a todo with all fields provided', async () => {
      const dueDate = new Date('2025-12-31');
      const command: CreateTodoCommand = {
        title: 'Complete Todo',
        priority: 'high',
        dueDate
      };

      vi.mocked(mockRepository.create).mockResolvedValue('created-id-2');

      const result = await useCase.execute(command);

      expect(result).toBeInstanceOf(Todo);
      expect(result.title.value).toBe('Complete Todo');
      expect(result.completed).toBe(false);
      expect(result.priority.level).toBe('high');
      expect(result.dueDate).toBe(dueDate);
      expect(result.id?.value).toBe('created-id-2');
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should handle low priority', async () => {
      const command: CreateTodoCommand = {
        title: 'Low Priority Todo',
        priority: 'low'
      };

      vi.mocked(mockRepository.create).mockResolvedValue('low-priority-id');

      const result = await useCase.execute(command);

      expect(result.priority.level).toBe('low');
    });

    it('should throw error for invalid title', async () => {
      const command: CreateTodoCommand = {
        title: '' // invalid empty title
      };

      await expect(useCase.execute(command)).rejects.toThrow();
    });

    it('should throw error for title that is too short', async () => {
      const command: CreateTodoCommand = {
        title: 'a' // too short (less than 2 characters)
      };

      await expect(useCase.execute(command)).rejects.toThrow();
    });

    it('should call repository.create with correct todo', async () => {
      const command: CreateTodoCommand = {
        title: 'Repository Test Todo',
        priority: 'high'
      };

      vi.mocked(mockRepository.create).mockResolvedValue('repo-test-id');

      await useCase.execute(command);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.any(Todo)
      );

      const createdTodo = vi.mocked(mockRepository.create).mock.calls[0][0];
      expect(createdTodo.title.value).toBe('Repository Test Todo');
      expect(createdTodo.completed).toBe(false);
      expect(createdTodo.priority.level).toBe('high');
      expect(createdTodo.createdAt).toBeInstanceOf(Date);
    });

    it('should validate todo before creating', async () => {
      const command: CreateTodoCommand = {
        title: 'Valid Todo'
      };

      vi.mocked(mockRepository.create).mockResolvedValue('validated-id');

      // Mock validate method to ensure it's called
      const validateSpy = vi.spyOn(Todo.prototype, 'validate');

      await useCase.execute(command);

      expect(validateSpy).toHaveBeenCalledTimes(1);
      
      validateSpy.mockRestore();
    });

    it('should propagate repository errors', async () => {
      const command: CreateTodoCommand = {
        title: 'Error Test Todo'
      };

      const repositoryError = new Error('Repository connection failed');
      vi.mocked(mockRepository.create).mockRejectedValue(repositoryError);

      await expect(useCase.execute(command)).rejects.toThrow('Repository connection failed');
    });

    it('should create todo with current date', async () => {
      const beforeExecution = Date.now();
      
      const command: CreateTodoCommand = {
        title: 'Date Test Todo'
      };

      vi.mocked(mockRepository.create).mockResolvedValue('date-test-id');

      const result = await useCase.execute(command);
      
      const afterExecution = Date.now();

      expect(result.createdAt.getTime()).toBeGreaterThanOrEqual(beforeExecution);
      expect(result.createdAt.getTime()).toBeLessThanOrEqual(afterExecution);
    });

    it('should return new todo instance with assigned ID', async () => {
      const command: CreateTodoCommand = {
        title: 'ID Assignment Test'
      };

      const assignedId = 'assigned-test-id';
      vi.mocked(mockRepository.create).mockResolvedValue(assignedId);

      const result = await useCase.execute(command);

      expect(result.id?.value).toBe(assignedId);
      // Ensure it's a new instance with the assigned ID
      expect(result).toBeInstanceOf(Todo);
    });
  });
});