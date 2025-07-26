import 'reflect-metadata';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SqliteTodoRepository } from './SqliteTodoRepository';
import { Todo } from '@nx-starter/domain';
import { getSqliteDatabase } from '../../../database/connections/SqliteConnection';

describe('SqliteTodoRepository', () => {
  let repository: SqliteTodoRepository;

  beforeEach(() => {
    repository = new SqliteTodoRepository();
  });

  afterEach(() => {
    // Clean up the database by deleting all todos
    const db = getSqliteDatabase();
    db.prepare('DELETE FROM todos').run();
  });

  describe('create', () => {
    it('should create a new todo and return an ID', async () => {
      const todo = new Todo('Test Todo', false, new Date(), undefined, 'medium');

      const id = await repository.create(todo);

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should create todo with emoji title', async () => {
      const todo = new Todo('🚀 Test Todo', false, new Date(), undefined, 'medium');

      const id = await repository.create(todo);
      const foundTodo = await repository.getById(id);

      expect(foundTodo?.titleValue).toBe('🚀 Test Todo');
    });

    it('should create todo with due date', async () => {
      const dueDate = new Date('2024-12-31');
      const todo = new Todo('Test Todo', false, new Date(), undefined, 'high', dueDate);

      const id = await repository.create(todo);
      const foundTodo = await repository.getById(id);

      expect(foundTodo?.dueDate).toEqual(dueDate);
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

    it('should update todo with due date', async () => {
      const todo = new Todo('Test Todo', false, new Date(), undefined, 'medium');
      const id = await repository.create(todo);
      const dueDate = new Date('2024-12-31');

      await repository.update(id, { dueDate });

      const updatedTodo = await repository.getById(id);
      expect(updatedTodo?.dueDate).toEqual(dueDate);
    });

    it('should update todo with Title object', async () => {
      const todo = new Todo('Original Title', false, new Date(), undefined, 'medium');
      const id = await repository.create(todo);
      const newTitle = new Todo('New Title', false, new Date(), undefined, 'medium').title;

      await repository.update(id, { title: newTitle });

      const updatedTodo = await repository.getById(id);
      expect(updatedTodo?.titleValue).toBe('New Title');
    });

    it('should update todo with Priority object', async () => {
      const todo = new Todo('Test Todo', false, new Date(), undefined, 'medium');
      const id = await repository.create(todo);
      const newPriority = new Todo('Test', false, new Date(), undefined, 'high').priority;

      await repository.update(id, { priority: newPriority });

      const updatedTodo = await repository.getById(id);
      expect(updatedTodo?.priority.level).toBe('high');
    });

    it('should not update when no changes provided', async () => {
      const todo = new Todo('Test Todo', false, new Date(), undefined, 'medium');
      const id = await repository.create(todo);

      await repository.update(id, {});

      const updatedTodo = await repository.getById(id);
      expect(updatedTodo?.titleValue).toBe('Test Todo');
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

    it('should return empty array when no active todos exist', async () => {
      const completedTodo = new Todo('Completed Todo', true, new Date(), undefined, 'medium');
      await repository.create(completedTodo);

      const activeTodos = await repository.getActive();

      expect(activeTodos).toHaveLength(0);
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

    it('should return empty array when no completed todos exist', async () => {
      const activeTodo = new Todo('Active Todo', false, new Date(), undefined, 'medium');
      await repository.create(activeTodo);

      const completedTodos = await repository.getCompleted();

      expect(completedTodos).toHaveLength(0);
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

  describe('findBySpecification', () => {
    it('should filter todos by specification', async () => {
      const activeTodo = new Todo('Active Todo', false, new Date(), undefined, 'medium');
      const completedTodo = new Todo('Completed Todo', true, new Date(), undefined, 'medium');

      await repository.create(activeTodo);
      await repository.create(completedTodo);

      // Create a simple specification that matches completed todos
      const completedSpecification = {
        isSatisfiedBy: (todo: Todo) => todo.completed
      };

      const result = await repository.findBySpecification(completedSpecification);

      expect(result).toHaveLength(1);
      expect(result[0].titleValue).toBe('Completed Todo');
      expect(result[0].completed).toBe(true);
    });

    it('should return empty array when no todos match specification', async () => {
      const activeTodo = new Todo('Active Todo', false, new Date(), undefined, 'medium');
      await repository.create(activeTodo);

      const neverMatchSpecification = {
        isSatisfiedBy: () => false
      };

      const result = await repository.findBySpecification(neverMatchSpecification);

      expect(result).toHaveLength(0);
    });

    it('should sort results by creation date (newest first)', async () => {
      const firstTodo = new Todo('First Todo', false, new Date(2024, 0, 1), undefined, 'medium');
      const secondTodo = new Todo('Second Todo', false, new Date(2024, 0, 2), undefined, 'medium');
      
      await repository.create(firstTodo);
      await repository.create(secondTodo);

      const allSpecification = {
        isSatisfiedBy: () => true
      };

      const result = await repository.findBySpecification(allSpecification);

      expect(result).toHaveLength(2);
      // Should be sorted by creation date (newest first)
      expect(result[0].titleValue).toBe('Second Todo');
      expect(result[1].titleValue).toBe('First Todo');
    });
  });

  describe('SQLite specific behavior', () => {
    it('should handle boolean values as integers', async () => {
      const activeTodo = new Todo('Active Todo', false, new Date(), undefined, 'medium');
      const completedTodo = new Todo('Completed Todo', true, new Date(), undefined, 'medium');

      await repository.create(activeTodo);
      await repository.create(completedTodo);

      const allTodos = await repository.getAll();
      const activeTodos = await repository.getActive();
      const completedTodos = await repository.getCompleted();

      expect(allTodos).toHaveLength(2);
      expect(activeTodos).toHaveLength(1);
      expect(completedTodos).toHaveLength(1);
    });

    it('should handle date serialization correctly', async () => {
      const now = new Date();
      const dueDate = new Date('2024-12-31T23:59:59.999Z');
      const todo = new Todo('Test Todo', false, now, undefined, 'medium', dueDate);

      const id = await repository.create(todo);
      const foundTodo = await repository.getById(id);

      expect(foundTodo?.createdAt).toEqual(now);
      expect(foundTodo?.dueDate).toEqual(dueDate);
    });
  });
});