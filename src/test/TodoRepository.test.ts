import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TodoRepository } from '../core/infrastructure/db/TodoRepository';
import { Todo } from '../core/domain/entities/Todo';

// Mock the TodoDB
vi.mock('../core/infrastructure/db/TodoDB', () => {
  const mockTodos = {
    orderBy: vi.fn().mockReturnThis(),
    reverse: vi.fn().mockReturnThis(),
    toArray: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
    where: vi.fn().mockReturnThis(),
    equals: vi.fn().mockReturnThis(),
  };

  return {
    db: {
      todos: mockTodos
    }
  };
});

import { db } from '../core/infrastructure/db/TodoDB';

describe('TodoRepository', () => {
  let repository: TodoRepository;

  beforeEach(() => {
    repository = new TodoRepository();
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all todos ordered by createdAt descending', async () => {
      const mockTodos = [
        new Todo('Todo 1', false, new Date(), 1),
        new Todo('Todo 2', true, new Date(), 2)
      ];
      
      vi.mocked(db.todos.toArray).mockResolvedValue(mockTodos);

      const result = await repository.getAll();

      expect(result).toEqual(mockTodos);
      expect(db.todos.orderBy).toHaveBeenCalledWith('createdAt');
      expect(db.todos.reverse).toHaveBeenCalled();
      expect(db.todos.toArray).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new todo and return its id', async () => {
      const todo = new Todo('New Todo');
      const expectedId = 1;
      vi.mocked(db.todos.add).mockResolvedValue(expectedId);

      const result = await repository.create(todo);

      expect(result).toBe(expectedId);
      expect(db.todos.add).toHaveBeenCalledWith(todo);
    });
  });

  describe('update', () => {
    it('should update a todo with given changes', async () => {
      const id = 1;
      const changes = { title: 'Updated Todo', completed: true };
      vi.mocked(db.todos.update).mockResolvedValue(1);

      await repository.update(id, changes);

      expect(db.todos.update).toHaveBeenCalledWith(id, changes);
    });
  });

  describe('delete', () => {
    it('should delete a todo by id', async () => {
      const id = 1;
      vi.mocked(db.todos.delete).mockResolvedValue(undefined);

      await repository.delete(id);

      expect(db.todos.delete).toHaveBeenCalledWith(id);
    });
  });

  describe('getById', () => {
    it('should return a todo by id', async () => {
      const id = 1;
      const mockTodo = new Todo('Todo 1', false, new Date(), id);
      vi.mocked(db.todos.get).mockResolvedValue(mockTodo);

      const result = await repository.getById(id);

      expect(result).toEqual(mockTodo);
      expect(db.todos.get).toHaveBeenCalledWith(id);
    });

    it('should return undefined for non-existent todo', async () => {
      const id = 999;
      vi.mocked(db.todos.get).mockResolvedValue(undefined);

      const result = await repository.getById(id);

      expect(result).toBeUndefined();
      expect(db.todos.get).toHaveBeenCalledWith(id);
    });
  });

  describe('getActive', () => {
    it('should return only active (uncompleted) todos', async () => {
      const mockActiveTodos = [
        new Todo('Active Todo 1', false, new Date(), 1),
        new Todo('Active Todo 2', false, new Date(), 2)
      ];
      
      vi.mocked(db.todos.toArray).mockResolvedValue(mockActiveTodos);

      const result = await repository.getActive();

      expect(result).toEqual(mockActiveTodos);
      expect(db.todos.where).toHaveBeenCalledWith('completed');
      expect(db.todos.where('completed').equals).toHaveBeenCalledWith(0);
      expect(db.todos.toArray).toHaveBeenCalled();
    });
  });

  describe('getCompleted', () => {
    it('should return only completed todos', async () => {
      const mockCompletedTodos = [
        new Todo('Completed Todo 1', true, new Date(), 1),
        new Todo('Completed Todo 2', true, new Date(), 2)
      ];
      
      vi.mocked(db.todos.toArray).mockResolvedValue(mockCompletedTodos);

      const result = await repository.getCompleted();

      expect(result).toEqual(mockCompletedTodos);
      expect(db.todos.where).toHaveBeenCalledWith('completed');
      expect(db.todos.where('completed').equals).toHaveBeenCalledWith(1);
      expect(db.todos.toArray).toHaveBeenCalled();
    });
  });
});
