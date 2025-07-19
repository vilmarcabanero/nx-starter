import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateTodoUseCase } from './UpdateTodoUseCase';
import { Todo } from '@/core/domain/todo/entities/Todo';
import type { ITodoRepository } from '@/core/domain/todo/repositories/ITodoRepository';
import type { UpdateTodoCommand } from '@/core/application/todo/dto/TodoCommands';
import { TEST_UUIDS, generateTestUuid } from '@/test/test-helpers';

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

    useCase = new UpdateTodoUseCase(mockRepository);
    
    // Create a test todo
    existingTodo = new Todo(
      'Original title',
      false,
      new Date('2024-01-01'),
      TEST_UUIDS.TODO_1,
      'medium'
    );
  });

  describe('execute', () => {
    it('should update todo title', async () => {
      // Arrange
      const command: UpdateTodoCommand = {
        id: TEST_UUIDS.TODO_1,
        title: 'Updated title'
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(existingTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.title.value).toBe('Updated title');
      expect(result.completed).toBe(false); // unchanged
      expect(result.priority.level).toBe('medium'); // unchanged
      expect(mockRepository.update).toHaveBeenCalledWith(TEST_UUIDS.TODO_1, {
        title: result.title,
        completed: result.completed,
        priority: result.priority,
        dueDate: result.dueDate
      });
    });

    it('should update todo priority', async () => {
      // Arrange
      const command: UpdateTodoCommand = {
        id: TEST_UUIDS.TODO_1,
        priority: 'high'
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(existingTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.priority.level).toBe('high');
      expect(result.title.value).toBe('Original title'); // unchanged
      expect(result.completed).toBe(false); // unchanged
    });

    it('should mark todo as completed', async () => {
      // Arrange
      const command: UpdateTodoCommand = {
        id: TEST_UUIDS.TODO_1,
        completed: true
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(existingTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.completed).toBe(true);
      expect(result.title.value).toBe('Original title'); // unchanged
    });

    it('should mark completed todo as incomplete', async () => {
      // Arrange
      const completedTodoId = TEST_UUIDS.TODO_2;
      const completedTodo = new Todo(
        'Completed todo',
        true,
        new Date('2024-01-01'),
        completedTodoId,
        'medium'
      );
      const command: UpdateTodoCommand = {
        id: completedTodoId,
        completed: false
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(completedTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.completed).toBe(false);
    });

    it('should update due date', async () => {
      // Arrange
      const newDueDate = new Date('2024-12-31');
      const command: UpdateTodoCommand = {
        id: TEST_UUIDS.TODO_1,
        dueDate: newDueDate
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(existingTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.dueDate).toEqual(newDueDate);
    });

    it('should update multiple properties at once', async () => {
      // Arrange
      const newDueDate = new Date('2024-12-31');
      const command: UpdateTodoCommand = {
        id: TEST_UUIDS.TODO_1,
        title: 'Multi-updated title',
        priority: 'high',
        completed: true,
        dueDate: newDueDate
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(existingTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.title.value).toBe('Multi-updated title');
      expect(result.priority.level).toBe('high');
      expect(result.completed).toBe(true);
      expect(result.dueDate).toEqual(newDueDate);
    });

    it('should throw error when todo not found', async () => {
      // Arrange
      const command: UpdateTodoCommand = {
        id: generateTestUuid(999),
        title: 'New title'
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(undefined);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow('Todo not found');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should handle repository getById errors', async () => {
      // Arrange
      const command: UpdateTodoCommand = {
        id: TEST_UUIDS.TODO_1,
        title: 'New title'
      };
      const repositoryError = new Error('Database connection failed');
      vi.mocked(mockRepository.getById).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow('Database connection failed');
    });

    it('should handle repository update errors', async () => {
      // Arrange
      const command: UpdateTodoCommand = {
        id: TEST_UUIDS.TODO_1,
        title: 'New title'
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(existingTodo);
      const updateError = new Error('Update failed');
      vi.mocked(mockRepository.update).mockRejectedValue(updateError);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow('Update failed');
    });

    it('should not change todo when no updates provided', async () => {
      // Arrange
      const command: UpdateTodoCommand = {
        id: TEST_UUIDS.TODO_1
        // No properties to update
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(existingTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.title.value).toBe('Original title');
      expect(result.completed).toBe(false);
      expect(result.priority.level).toBe('medium');
      expect(mockRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should validate business invariants after updates', async () => {
      // Arrange
      const command: UpdateTodoCommand = {
        id: TEST_UUIDS.TODO_1,
        title: 'Valid updated title',
        priority: 'low'
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(existingTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert - if validation passes, the update should succeed
      expect(result.title.value).toBe('Valid updated title');
      expect(result.priority.level).toBe('low');
    });

    it('should handle completion state changes correctly', async () => {
      // Arrange - test setting completed to same value
      const command: UpdateTodoCommand = {
        id: TEST_UUIDS.TODO_1,
        completed: false // same as existing
      };
      vi.mocked(mockRepository.getById).mockResolvedValue(existingTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.completed).toBe(false);
    });
  });
});
