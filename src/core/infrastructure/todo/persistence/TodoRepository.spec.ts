import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Todo } from '../../../domain/todo/entities/Todo';
import { TodoRepository } from './TodoRepository';
import { db } from './TodoDB';

describe('TodoRepository', () => {
  let repository: TodoRepository;

  beforeEach(async () => {
    repository = new TodoRepository();
    // Clear the database before each test
    await db.todos.clear();
  });

  afterEach(async () => {
    // Clean up after each test
    await db.todos.clear();
  });

  describe('getAll', () => {
    it('should return all todos ordered by createdAt descending', async () => {
      // Add test data directly to the fake database
      const todo1 = new Todo('Todo 1', false, new Date('2023-01-01'), undefined, 'medium');
      const todo2 = new Todo('Todo 2', true, new Date('2023-01-02'), undefined, 'medium');
      
      await repository.create(todo1);
      await repository.create(todo2);

      const result = await repository.getAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Todo);
      // Results should be ordered by createdAt descending (newest first)
      expect(result[0].titleValue).toBe('Todo 2');
      expect(result[1].titleValue).toBe('Todo 1');
    });
  });

  describe('create', () => {
    it('should create a new todo and return its id', async () => {
      const todo = new Todo('New Todo');

      const result = await repository.create(todo);

      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
      
      // Verify the todo was actually saved
      const savedTodo = await repository.getById(result);
      expect(savedTodo).toBeDefined();
      expect(savedTodo!.titleValue).toBe('New Todo');
      expect(savedTodo!.completed).toBe(false);
    });
  });

  describe('update', () => {
    it('should update a todo with given changes', async () => {
      // First create a todo
      const todo = new Todo('Original Todo');
      const id = await repository.create(todo);
      
      const changes = { title: 'Updated Todo', completed: true };
      await repository.update(id, changes);

      // Verify the update
      const updatedTodo = await repository.getById(id);
      expect(updatedTodo).toBeDefined();
      expect(updatedTodo!.titleValue).toBe('Updated Todo');
      expect(updatedTodo!.completed).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete a todo by id', async () => {
      // First create a todo
      const todo = new Todo('Todo to delete');
      const id = await repository.create(todo);
      
      // Verify it exists
      let existingTodo = await repository.getById(id);
      expect(existingTodo).toBeDefined();
      
      // Delete it
      await repository.delete(id);
      
      // Verify it's gone
      const deletedTodo = await repository.getById(id);
      expect(deletedTodo).toBeUndefined();
    });
  });

  describe('getById', () => {
    it('should return a todo by id', async () => {
      // Create a todo first
      const todo = new Todo('Todo 1', false, new Date(), undefined, 'medium');
      const id = await repository.create(todo);

      const result = await repository.getById(id);

      expect(result).toBeInstanceOf(Todo);
      expect(result?.titleValue).toBe('Todo 1');
      expect(result?.completed).toBe(false);
      expect(result?.numericId).toBe(id);
    });

    it('should return undefined for non-existent todo', async () => {
      const id = 999;

      const result = await repository.getById(id);

      expect(result).toBeUndefined();
    });
  });

  describe('getActive', () => {
    it('should return only active (uncompleted) todos', async () => {
      // Create mixed todos
      const activeTodo1 = new Todo('Active Todo 1', false);
      const activeTodo2 = new Todo('Active Todo 2', false);
      const completedTodo = new Todo('Completed Todo', true);
      
      await repository.create(activeTodo1);
      await repository.create(activeTodo2);
      await repository.create(completedTodo);

      const result = await repository.getActive();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Todo);
      expect(result[0].titleValue).toBe('Active Todo 1');
      expect(result[0].completed).toBe(false);
      expect(result[1].titleValue).toBe('Active Todo 2');
      expect(result[1].completed).toBe(false);
    });
  });

  describe('getCompleted', () => {
    it('should return only completed todos', async () => {
      // Create mixed todos
      const activeTodo = new Todo('Active Todo', false);
      const completedTodo1 = new Todo('Completed Todo 1', true);
      const completedTodo2 = new Todo('Completed Todo 2', true);
      
      await repository.create(activeTodo);
      await repository.create(completedTodo1);
      await repository.create(completedTodo2);

      const result = await repository.getCompleted();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Todo);
      expect(result[0].titleValue).toBe('Completed Todo 1');
      expect(result[0].completed).toBe(true);
      expect(result[1].titleValue).toBe('Completed Todo 2');
      expect(result[1].completed).toBe(true);
    });
  });
});