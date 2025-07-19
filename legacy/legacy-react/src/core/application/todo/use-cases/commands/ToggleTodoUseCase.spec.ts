import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ToggleTodoUseCase } from './ToggleTodoUseCase';
import { Todo } from '@/core/domain/todo/entities/Todo';
import type { ITodoRepository } from '@/core/domain/todo/repositories/ITodoRepository';
import type { UpdateTodoUseCase } from './UpdateTodoUseCase';
import type { ToggleTodoCommand } from '@/core/application/todo/dto/TodoCommands';
import { TEST_UUIDS, generateTestUuid } from '@/test/test-helpers';

describe('ToggleTodoUseCase', () => {
  let useCase: ToggleTodoUseCase;
  let mockRepository: ITodoRepository;
  let mockUpdateUseCase: UpdateTodoUseCase;

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

    mockUpdateUseCase = {
      execute: vi.fn(),
    } as never;

    useCase = new ToggleTodoUseCase(mockRepository, mockUpdateUseCase);
  });

  describe('execute', () => {
    it('should toggle active todo to completed', async () => {
      // Arrange
      const todoId = TEST_UUIDS.TODO_1;
      const command: ToggleTodoCommand = { id: todoId };
      const activeTodo = new Todo('Active Todo', false, new Date(), todoId);
      const completedTodo = new Todo('Active Todo', true, new Date(), todoId);
      
      vi.mocked(mockRepository.getById).mockResolvedValue(activeTodo);
      vi.mocked(mockUpdateUseCase.execute).mockResolvedValue(completedTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result).toBe(completedTodo);
      expect(mockRepository.getById).toHaveBeenCalledWith(todoId);
      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({
        id: todoId,
        completed: true,
      });
      expect(mockRepository.getById).toHaveBeenCalledTimes(1);
      expect(mockUpdateUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should toggle completed todo to active', async () => {
      // Arrange
      const todoId = TEST_UUIDS.TODO_2;
      const command: ToggleTodoCommand = { id: todoId };
      const completedTodo = new Todo('Completed Todo', true, new Date(), todoId);
      const activeTodo = new Todo('Completed Todo', false, new Date(), todoId);
      
      vi.mocked(mockRepository.getById).mockResolvedValue(completedTodo);
      vi.mocked(mockUpdateUseCase.execute).mockResolvedValue(activeTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result).toBe(activeTodo);
      expect(mockRepository.getById).toHaveBeenCalledWith(todoId);
      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({
        id: todoId,
        completed: false,
      });
    });

    it('should throw error when todo does not exist', async () => {
      // Arrange
      const todoId = generateTestUuid(999);
      const command: ToggleTodoCommand = { id: todoId };
      vi.mocked(mockRepository.getById).mockResolvedValue(undefined);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow('Todo not found');
      expect(mockRepository.getById).toHaveBeenCalledWith(todoId);
      expect(mockUpdateUseCase.execute).not.toHaveBeenCalled();
    });

    it('should propagate repository getById errors', async () => {
      // Arrange
      const todoId = TEST_UUIDS.TODO_3;
      const command: ToggleTodoCommand = { id: todoId };
      const error = new Error('Database connection failed');
      vi.mocked(mockRepository.getById).mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow('Database connection failed');
      expect(mockUpdateUseCase.execute).not.toHaveBeenCalled();
    });

    it('should propagate update use case errors', async () => {
      // Arrange
      const todoId = TEST_UUIDS.TODO_4;
      const command: ToggleTodoCommand = { id: todoId };
      const existingTodo = new Todo('Existing Todo', false, new Date(), todoId);
      const updateError = new Error('Update operation failed');
      
      vi.mocked(mockRepository.getById).mockResolvedValue(existingTodo);
      vi.mocked(mockUpdateUseCase.execute).mockRejectedValue(updateError);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow('Update operation failed');
      expect(mockRepository.getById).toHaveBeenCalledWith(todoId);
      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({
        id: todoId,
        completed: true,
      });
    });

    it('should handle toggle of todo with different priorities', async () => {
      // Arrange
      const todoId = TEST_UUIDS.TODO_5;
      const command: ToggleTodoCommand = { id: todoId };
      const highPriorityTodo = new Todo('High Priority Todo', false, new Date(), todoId, 'high');
      const toggledTodo = new Todo('High Priority Todo', true, new Date(), todoId, 'high');
      
      vi.mocked(mockRepository.getById).mockResolvedValue(highPriorityTodo);
      vi.mocked(mockUpdateUseCase.execute).mockResolvedValue(toggledTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result).toBe(toggledTodo);
      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({
        id: todoId,
        completed: true,
      });
    });

    it('should handle toggle of todo with due date', async () => {
      // Arrange
      const todoId = generateTestUuid(4);
      const command: ToggleTodoCommand = { id: todoId };
      const dueDate = new Date('2024-12-31');
      const todoWithDueDate = new Todo('Todo with due date', false, new Date(), todoId, 'medium', dueDate);
      const toggledTodo = new Todo('Todo with due date', true, new Date(), todoId, 'medium');
      
      vi.mocked(mockRepository.getById).mockResolvedValue(todoWithDueDate);
      vi.mocked(mockUpdateUseCase.execute).mockResolvedValue(toggledTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result).toBe(toggledTodo);
      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({
        id: todoId,
        completed: true,
      });
    });

    it('should validate command id is provided', async () => {
      // Arrange
      const todoId = generateTestUuid(0);
      const command: ToggleTodoCommand = { id: todoId };
      vi.mocked(mockRepository.getById).mockResolvedValue(undefined);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow('Todo not found');
      expect(mockRepository.getById).toHaveBeenCalledWith(todoId);
    });
  });

  describe('business logic scenarios', () => {
    it('should handle completion of overdue todo', async () => {
      // Arrange
      const todoId = generateTestUuid(5);
      const command: ToggleTodoCommand = { id: todoId };
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 30); // 30 days ago
      const overdueTodo = new Todo('Overdue Todo', false, oldDate, todoId);
      const completedTodo = new Todo('Overdue Todo', true, oldDate, todoId);
      
      vi.mocked(mockRepository.getById).mockResolvedValue(overdueTodo);
      vi.mocked(mockUpdateUseCase.execute).mockResolvedValue(completedTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result).toBe(completedTodo);
      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({
        id: todoId,
        completed: true,
      });
    });

    it('should handle reactivation of recently completed todo', async () => {
      // Arrange
      const todoId = generateTestUuid(6);
      const command: ToggleTodoCommand = { id: todoId };
      const recentDate = new Date();
      recentDate.setHours(recentDate.getHours() - 1); // 1 hour ago
      const recentlyCompletedTodo = new Todo('Recently Completed', true, recentDate, todoId);
      const reactivatedTodo = new Todo('Recently Completed', false, recentDate, todoId);
      
      vi.mocked(mockRepository.getById).mockResolvedValue(recentlyCompletedTodo);
      vi.mocked(mockUpdateUseCase.execute).mockResolvedValue(reactivatedTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result).toBe(reactivatedTodo);
      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({
        id: todoId,
        completed: false,
      });
    });

    it('should demonstrate delegation to UpdateTodoUseCase for consistency', async () => {
      // This test shows that ToggleTodoUseCase properly delegates to UpdateTodoUseCase
      // ensuring consistent update logic across all update operations
      const todoId = generateTestUuid(7);
      const command: ToggleTodoCommand = { id: todoId };
      const todo = new Todo('Test Delegation', false, new Date(), todoId);
      const updatedTodo = new Todo('Test Delegation', true, new Date(), todoId);
      
      vi.mocked(mockRepository.getById).mockResolvedValue(todo);
      vi.mocked(mockUpdateUseCase.execute).mockResolvedValue(updatedTodo);

      // Act
      await useCase.execute(command);

      // Assert - Verify delegation pattern
      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({
        id: todoId,
        completed: true,
      });
      // The use case doesn't directly call repository.update, it delegates to UpdateTodoUseCase
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });
});
