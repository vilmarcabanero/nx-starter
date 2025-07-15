import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryTodoRepository } from '@/core/infrastructure/todo/persistence/InMemoryTodoRepository';
import { Todo } from '@/core/domain/todo/entities/Todo';

describe('InMemoryTodoRepository', () => {
  let repository: InMemoryTodoRepository;

  beforeEach(() => {
    repository = new InMemoryTodoRepository();
  });

  describe('create', () => {
    it('should create a new todo and return an ID', async () => {
      const todo = new Todo('Test Todo', false, new Date(), undefined, 'medium');

      const id = await repository.create(todo);

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe('getAll', () => {
    it('should return empty array when no todos exist', async () => {
      const todos = await repository.getAll();

      expect(todos).toEqual([]);
    });

    it('should return all todos when they exist', async () => {
      const todo1 = new Todo('Todo 1', false, new Date(), undefined, 'medium');
      await repository.create(todo1);

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1));

      const todo2 = new Todo('Todo 2', true, new Date(), undefined, 'high');
      await repository.create(todo2);

      const todos = await repository.getAll();

      expect(todos).toHaveLength(2);
      expect(todos[0].titleValue).toBe('Todo 2'); // Most recent first
      expect(todos[1].titleValue).toBe('Todo 1');
    });
  });

  describe('getById', () => {
    it('should return todo when it exists', async () => {
      const todo = new Todo('Test Todo', false, new Date(), undefined, 'medium');
      const id = await repository.create(todo);

      const foundTodo = await repository.getById(id);

      expect(foundTodo).toBeDefined();
      expect(foundTodo?.titleValue).toBe('Test Todo');
      expect(foundTodo?.stringId).toBe(id);
    });

    it('should return undefined when todo does not exist', async () => {
      const foundTodo = await repository.getById('nonexistent-id');

      expect(foundTodo).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update todo properties', async () => {
      const todo = new Todo('Original Title', false, new Date(), undefined, 'medium');
      const id = await repository.create(todo);

      await repository.update(id, {
        title: 'Updated Title',
        completed: true,
        priority: 'high' as any,
      });

      const updatedTodo = await repository.getById(id);

      expect(updatedTodo?.titleValue).toBe('Updated Title');
      expect(updatedTodo?.completed).toBe(true);
      expect(updatedTodo?.priority.level).toBe('high');
    });

    it('should throw error when todo does not exist', async () => {
      await expect(repository.update('nonexistent-id', { title: 'New Title' })).rejects.toThrow(
        'Todo with ID nonexistent-id not found'
      );
    });
  });

  describe('delete', () => {
    it('should delete existing todo', async () => {
      const todo = new Todo('Test Todo', false, new Date(), undefined, 'medium');
      const id = await repository.create(todo);

      await repository.delete(id);

      const deletedTodo = await repository.getById(id);
      expect(deletedTodo).toBeUndefined();
    });

    it('should throw error when todo does not exist', async () => {
      await expect(repository.delete('nonexistent-id')).rejects.toThrow(
        'Todo with ID nonexistent-id not found'
      );
    });
  });

  describe('getActive', () => {
    it('should return only active todos', async () => {
      const activeTodo = new Todo('Active Todo', false, new Date(), undefined, 'medium');
      const completedTodo = new Todo('Completed Todo', true, new Date(), undefined, 'medium');

      await repository.create(activeTodo);
      await repository.create(completedTodo);

      const activeTodos = await repository.getActive();

      expect(activeTodos).toHaveLength(1);
      expect(activeTodos[0].titleValue).toBe('Active Todo');
      expect(activeTodos[0].completed).toBe(false);
    });
  });

  describe('getCompleted', () => {
    it('should return only completed todos', async () => {
      const activeTodo = new Todo('Active Todo', false, new Date(), undefined, 'medium');
      const completedTodo = new Todo('Completed Todo', true, new Date(), undefined, 'medium');

      await repository.create(activeTodo);
      await repository.create(completedTodo);

      const completedTodos = await repository.getCompleted();

      expect(completedTodos).toHaveLength(1);
      expect(completedTodos[0].titleValue).toBe('Completed Todo');
      expect(completedTodos[0].completed).toBe(true);
    });
  });

  describe('count methods', () => {
    beforeEach(async () => {
      const activeTodo1 = new Todo('Active 1', false, new Date(), undefined, 'medium');
      const activeTodo2 = new Todo('Active 2', false, new Date(), undefined, 'medium');
      const completedTodo = new Todo('Completed', true, new Date(), undefined, 'medium');

      await repository.create(activeTodo1);
      await repository.create(activeTodo2);
      await repository.create(completedTodo);
    });

    it('should count total todos', async () => {
      const count = await repository.count();
      expect(count).toBe(3);
    });

    it('should count active todos', async () => {
      const count = await repository.countActive();
      expect(count).toBe(2);
    });

    it('should count completed todos', async () => {
      const count = await repository.countCompleted();
      expect(count).toBe(1);
    });
  });
});
