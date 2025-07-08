import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TodoService } from '../core/application/services/TodoService';
import { Todo } from '../core/domain/entities/Todo';
import type { ITodoRepository } from '../core/domain/repositories/ITodoRepository';
import { createMockRepository, createMockTodos } from './test-utils';

describe('TodoService', () => {
  let todoService: TodoService;
  let mockRepository: ITodoRepository;

  beforeEach(() => {
    // Create fresh mock instance for each test (CC Version best practice)
    mockRepository = createMockRepository();
    todoService = new TodoService(mockRepository);
  });

  describe('getAllTodos', () => {
    it('should return all todos from repository', async () => {
      const mockTodos = createMockTodos(2, [
        { title: 'Todo 1', completed: false, id: 1 },
        { title: 'Todo 2', completed: true, id: 2 }
      ]);
      vi.mocked(mockRepository.getAll).mockResolvedValue(mockTodos);

      const result = await todoService.getAllTodos();

      expect(result).toEqual(mockTodos);
      expect(mockRepository.getAll).toHaveBeenCalledOnce();
    });
  });

  describe('createTodo', () => {
    it('should create a new todo with valid title', async () => {
      const title = 'New Todo';
      const mockId = 1;
      vi.mocked(mockRepository.create).mockResolvedValue(mockId);

      const result = await todoService.createTodo(title);

      expect(result.title).toBe(title);
      expect(result.completed).toBe(false);
      expect(result.id).toBe(mockId);
      expect(mockRepository.create).toHaveBeenCalledOnce();
    });

    it('should trim whitespace from title', async () => {
      const title = '  New Todo  ';
      const mockId = 1;
      vi.mocked(mockRepository.create).mockResolvedValue(mockId);

      const result = await todoService.createTodo(title);

      expect(result.title).toBe('New Todo');
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'New Todo' })
      );
    });

    it('should throw error for empty title', async () => {
      await expect(todoService.createTodo('')).rejects.toThrow('Todo title cannot be empty');
      await expect(todoService.createTodo('   ')).rejects.toThrow('Todo title cannot be empty');
    });
  });

  describe('updateTodo', () => {
    it('should update existing todo', async () => {
      const todoId = 1;
      const existingTodo = new Todo('Original', false, new Date(), todoId);
      const updatedTodo = new Todo('Updated', false, new Date(), todoId);
      const changes = { title: 'Updated' };

      vi.mocked(mockRepository.getById).mockResolvedValueOnce(existingTodo);
      vi.mocked(mockRepository.getById).mockResolvedValueOnce(updatedTodo);

      const result = await todoService.updateTodo(todoId, changes);

      expect(result).toEqual(updatedTodo);
      expect(mockRepository.update).toHaveBeenCalledWith(todoId, changes);
    });

    it('should throw error for non-existent todo', async () => {
      const todoId = 1;
      vi.mocked(mockRepository.getById).mockResolvedValue(undefined);

      await expect(todoService.updateTodo(todoId, { title: 'Updated' }))
        .rejects.toThrow('Todo not found');
    });

    it('should throw error for empty title update', async () => {
      const todoId = 1;
      const existingTodo = new Todo('Original', false, new Date(), todoId);
      vi.mocked(mockRepository.getById).mockResolvedValue(existingTodo);

      await expect(todoService.updateTodo(todoId, { title: '' }))
        .rejects.toThrow('Todo title cannot be empty');
      await expect(todoService.updateTodo(todoId, { title: '   ' }))
        .rejects.toThrow('Todo title cannot be empty');
    });

    it('should throw error if todo not found after update', async () => {
      const todoId = 1;
      const existingTodo = new Todo('Original', false, new Date(), todoId);

      vi.mocked(mockRepository.getById).mockResolvedValueOnce(existingTodo);
      vi.mocked(mockRepository.update).mockResolvedValue(undefined);
      vi.mocked(mockRepository.getById).mockResolvedValueOnce(undefined);

      await expect(todoService.updateTodo(todoId, { title: 'Updated' }))
        .rejects.toThrow('Todo not found after update');
    });
  });

  describe('deleteTodo', () => {
    it('should delete existing todo', async () => {
      const todoId = 1;
      const existingTodo = new Todo('Todo to delete', false, new Date(), todoId);
      vi.mocked(mockRepository.getById).mockResolvedValue(existingTodo);
      vi.mocked(mockRepository.delete).mockResolvedValue(undefined);

      await todoService.deleteTodo(todoId);

      expect(mockRepository.getById).toHaveBeenCalledWith(todoId);
      expect(mockRepository.delete).toHaveBeenCalledWith(todoId);
    });

    it('should throw error for non-existent todo', async () => {
      const todoId = 999;
      vi.mocked(mockRepository.getById).mockResolvedValue(undefined);

      await expect(todoService.deleteTodo(todoId)).rejects.toThrow('Todo not found');
    });
  });

  describe('toggleTodo', () => {
    it('should toggle todo completion status', async () => {
      const todoId = 1;
      const todo = new Todo('Todo to toggle', false, new Date(), todoId);
      vi.mocked(mockRepository.getById).mockResolvedValue(todo);
      vi.mocked(mockRepository.update).mockResolvedValue(undefined);

      const result = await todoService.toggleTodo(todoId);

      expect(result.completed).toBe(true);
      expect(result.title).toBe(todo.title);
      expect(result.id).toBe(todoId);
      expect(mockRepository.update).toHaveBeenCalledWith(todoId, { completed: true });
    });

    it('should throw error for non-existent todo', async () => {
      const todoId = 999;
      vi.mocked(mockRepository.getById).mockResolvedValue(undefined);

      await expect(todoService.toggleTodo(todoId)).rejects.toThrow('Todo not found');
    });
  });

  describe('getActiveTodos', () => {
    it('should return active todos from repository', async () => {
      const activeTodos = [new Todo('Active 1', false), new Todo('Active 2', false)];
      vi.mocked(mockRepository.getActive).mockResolvedValue(activeTodos);

      const result = await todoService.getActiveTodos();

      expect(result).toEqual(activeTodos);
      expect(mockRepository.getActive).toHaveBeenCalledOnce();
    });
  });

  describe('getCompletedTodos', () => {
    it('should return completed todos from repository', async () => {
      const completedTodos = [new Todo('Completed 1', true), new Todo('Completed 2', true)];
      vi.mocked(mockRepository.getCompleted).mockResolvedValue(completedTodos);

      const result = await todoService.getCompletedTodos();

      expect(result).toEqual(completedTodos);
      expect(mockRepository.getCompleted).toHaveBeenCalledOnce();
    });
  });

  describe('getTodoStats', () => {
    it('should return correct statistics', async () => {
      const allTodos = [
        new Todo('Todo 1', false),
        new Todo('Todo 2', true),
        new Todo('Todo 3', false)
      ];
      const activeTodos = [new Todo('Todo 1', false), new Todo('Todo 3', false)];
      const completedTodos = [new Todo('Todo 2', true)];

      vi.mocked(mockRepository.getAll).mockResolvedValue(allTodos);
      vi.mocked(mockRepository.getActive).mockResolvedValue(activeTodos);
      vi.mocked(mockRepository.getCompleted).mockResolvedValue(completedTodos);

      const result = await todoService.getTodoStats();

      expect(result).toEqual({
        total: 3,
        active: 2,
        completed: 1
      });
    });
  });
});
