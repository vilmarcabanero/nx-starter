import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ToggleTodoUseCase } from './ToggleTodoUseCase';
import { Todo } from '@/core/domain/todo/entities/Todo';
import type { ITodoRepository } from '@/core/domain/todo/repositories/ITodoRepository';
import type { UpdateTodoUseCase } from './UpdateTodoUseCase';
import type { ToggleTodoCommand } from '@/core/application/todo/dto/TodoCommands';

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
      const command: ToggleTodoCommand = { id: 1 };
      const activeTodo = new Todo('Active Todo', false, new Date(), 1);
      const completedTodo = new Todo('Active Todo', true, new Date(), 1);
      
      vi.mocked(mockRepository.getById).mockResolvedValue(activeTodo);
      vi.mocked(mockUpdateUseCase.execute).mockResolvedValue(completedTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result).toBe(completedTodo);
      expect(mockRepository.getById).toHaveBeenCalledWith(1);
      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({
        id: 1,
        completed: true,
      });
      expect(mockRepository.getById).toHaveBeenCalledTimes(1);
      expect(mockUpdateUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should toggle completed todo to active', async () => {
      // Arrange
      const command: ToggleTodoCommand = { id: 2 };
      const completedTodo = new Todo('Completed Todo', true, new Date(), 2);
      const activeTodo = new Todo('Completed Todo', false, new Date(), 2);
      
      vi.mocked(mockRepository.getById).mockResolvedValue(completedTodo);
      vi.mocked(mockUpdateUseCase.execute).mockResolvedValue(activeTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result).toBe(activeTodo);
      expect(mockRepository.getById).toHaveBeenCalledWith(2);
      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({
        id: 2,
        completed: false,
      });
    });

    it('should throw error when todo does not exist', async () => {
      // Arrange
      const command: ToggleTodoCommand = { id: 999 };
      vi.mocked(mockRepository.getById).mockResolvedValue(undefined);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow('Todo not found');
      expect(mockRepository.getById).toHaveBeenCalledWith(999);
      expect(mockUpdateUseCase.execute).not.toHaveBeenCalled();
    });

    it('should propagate repository getById errors', async () => {
      // Arrange
      const command: ToggleTodoCommand = { id: 1 };
      const error = new Error('Database connection failed');
      vi.mocked(mockRepository.getById).mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow('Database connection failed');
      expect(mockUpdateUseCase.execute).not.toHaveBeenCalled();
    });

    it('should propagate update use case errors', async () => {
      // Arrange
      const command: ToggleTodoCommand = { id: 1 };
      const existingTodo = new Todo('Existing Todo', false, new Date(), 1);
      const updateError = new Error('Update operation failed');
      
      vi.mocked(mockRepository.getById).mockResolvedValue(existingTodo);
      vi.mocked(mockUpdateUseCase.execute).mockRejectedValue(updateError);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow('Update operation failed');
      expect(mockRepository.getById).toHaveBeenCalledWith(1);
      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({
        id: 1,
        completed: true,
      });
    });

    it('should handle toggle of todo with different priorities', async () => {
      // Arrange
      const command: ToggleTodoCommand = { id: 3 };
      const highPriorityTodo = new Todo('High Priority Todo', false, new Date(), 3, 'high');
      const toggledTodo = new Todo('High Priority Todo', true, new Date(), 3, 'high');
      
      vi.mocked(mockRepository.getById).mockResolvedValue(highPriorityTodo);
      vi.mocked(mockUpdateUseCase.execute).mockResolvedValue(toggledTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result).toBe(toggledTodo);
      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({
        id: 3,
        completed: true,
      });
    });

    it('should handle toggle of todo with due date', async () => {
      // Arrange
      const command: ToggleTodoCommand = { id: 4 };
      const dueDate = new Date('2024-12-31');
      const todoWithDueDate = new Todo('Todo with due date', false, new Date(), 4, 'medium', dueDate);
      const toggledTodo = new Todo('Todo with due date', true, new Date(), 4, 'medium');
      
      vi.mocked(mockRepository.getById).mockResolvedValue(todoWithDueDate);
      vi.mocked(mockUpdateUseCase.execute).mockResolvedValue(toggledTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result).toBe(toggledTodo);
      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({
        id: 4,
        completed: true,
      });
    });

    it('should validate command id is provided', async () => {
      // Arrange
      const command: ToggleTodoCommand = { id: 0 };
      vi.mocked(mockRepository.getById).mockResolvedValue(undefined);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow('Todo not found');
      expect(mockRepository.getById).toHaveBeenCalledWith(0);
    });
  });

  describe('business logic scenarios', () => {
    it('should handle completion of overdue todo', async () => {
      // Arrange
      const command: ToggleTodoCommand = { id: 5 };
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 30); // 30 days ago
      const overdueTodo = new Todo('Overdue Todo', false, oldDate, 5);
      const completedTodo = new Todo('Overdue Todo', true, oldDate, 5);
      
      vi.mocked(mockRepository.getById).mockResolvedValue(overdueTodo);
      vi.mocked(mockUpdateUseCase.execute).mockResolvedValue(completedTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result).toBe(completedTodo);
      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({
        id: 5,
        completed: true,
      });
    });

    it('should handle reactivation of recently completed todo', async () => {
      // Arrange
      const command: ToggleTodoCommand = { id: 6 };
      const recentDate = new Date();
      recentDate.setHours(recentDate.getHours() - 1); // 1 hour ago
      const recentlyCompletedTodo = new Todo('Recently Completed', true, recentDate, 6);
      const reactivatedTodo = new Todo('Recently Completed', false, recentDate, 6);
      
      vi.mocked(mockRepository.getById).mockResolvedValue(recentlyCompletedTodo);
      vi.mocked(mockUpdateUseCase.execute).mockResolvedValue(reactivatedTodo);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result).toBe(reactivatedTodo);
      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({
        id: 6,
        completed: false,
      });
    });

    it('should demonstrate delegation to UpdateTodoUseCase for consistency', async () => {
      // This test shows that ToggleTodoUseCase properly delegates to UpdateTodoUseCase
      // ensuring consistent update logic across all update operations
      const command: ToggleTodoCommand = { id: 7 };
      const todo = new Todo('Test Delegation', false, new Date(), 7);
      const updatedTodo = new Todo('Test Delegation', true, new Date(), 7);
      
      vi.mocked(mockRepository.getById).mockResolvedValue(todo);
      vi.mocked(mockUpdateUseCase.execute).mockResolvedValue(updatedTodo);

      // Act
      await useCase.execute(command);

      // Assert - Verify delegation pattern
      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({
        id: 7,
        completed: true,
      });
      // The use case doesn't directly call repository.update, it delegates to UpdateTodoUseCase
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });
});
