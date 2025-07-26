import 'reflect-metadata';
import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseTodoRepository } from './MongooseTodoRepository';
import { TodoModel } from './TodoSchema';
import { Todo } from '@nx-starter/domain';

describe('MongooseTodoRepository', () => {
  let repository: MongooseTodoRepository;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Create in-memory MongoDB instance for testing
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    // Clear any existing data before each test
    await TodoModel.deleteMany({});
    
    repository = new MongooseTodoRepository();
  });

  afterEach(async () => {
    // Clean up database after each test
    if (mongoose.connection.readyState === 1) {
      await TodoModel.deleteMany({});
    }
  });

  afterAll(async () => {
    // Clean up everything after all tests
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  describe('create', () => {
    it('should create a new todo', async () => {
      const todo = new Todo('Test todo');

      const id = await repository.create(todo);

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
    });

    it('should create todo with special characters', async () => {
      const todo = new Todo('Todo with émojis 🚀 and "quotes"');
      
      const id = await repository.create(todo);
      const created = await repository.getById(id);
      
      expect(created?.titleValue).toBe('Todo with émojis 🚀 and "quotes"');
    });

    it('should create todo with all properties', async () => {
      const dueDate = new Date('2024-12-31');
      const todo = new Todo('Complete todo', false, new Date(), undefined, 'high', dueDate);
      
      const id = await repository.create(todo);
      const created = await repository.getById(id);
      
      expect(created?.titleValue).toBe('Complete todo');
      expect(created?.priority.level).toBe('high');
      expect(created?.dueDate).toEqual(dueDate);
    });
  });

  describe('getAll', () => {
    it('should return empty array when no todos exist', async () => {
      const todos = await repository.getAll();

      expect(todos).toEqual([]);
    });

    it('should return all todos ordered by creation date', async () => {
      const now = new Date();
      const earlier = new Date(now.getTime() - 1000); // 1 second earlier

      const todo1 = new Todo('First todo', false, earlier);
      const todo2 = new Todo('Second todo', false, now);

      await repository.create(todo1);
      await repository.create(todo2);

      const todos = await repository.getAll();

      expect(todos).toHaveLength(2);
      expect(todos[0].titleValue).toBe('Second todo'); // Latest first
      expect(todos[1].titleValue).toBe('First todo');
    });
  });

  describe('getById', () => {
    it('should return todo by id', async () => {
      const todo = new Todo('Test todo', false, new Date(), undefined, 'high');
      const id = await repository.create(todo);

      const foundTodo = await repository.getById(id);

      expect(foundTodo).toBeDefined();
      expect(foundTodo!.titleValue).toBe('Test todo');
      expect(foundTodo!.priority.level).toBe('high');
    });

    it('should return undefined for non-existent id', async () => {
      const todo = await repository.getById('507f1f77bcf86cd799439011'); // Valid ObjectId format

      expect(todo).toBeUndefined();
    });

    it('should return undefined for invalid ObjectId', async () => {
      const todo = await repository.getById('invalid-id');

      expect(todo).toBeUndefined();
    });

    it('should return undefined for empty string id', async () => {
      const todo = await repository.getById('');

      expect(todo).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update existing todo', async () => {
      const todo = new Todo('Original title');
      const id = await repository.create(todo);

      await repository.update(id, { title: 'Updated title' });

      const updatedTodo = await repository.getById(id);
      expect(updatedTodo!.titleValue).toBe('Updated title');
    });

    it('should update multiple properties', async () => {
      const todo = new Todo('Original', false, new Date(), undefined, 'low');
      const id = await repository.create(todo);

      await repository.update(id, { 
        title: 'Updated title',
        completed: true,
        priority: 'high'
      });

      const updatedTodo = await repository.getById(id);
      expect(updatedTodo!.titleValue).toBe('Updated title');
      expect(updatedTodo!.completed).toBe(true);
      expect(updatedTodo!.priority.level).toBe('high');
    });

    it('should update with special characters', async () => {
      const todo = new Todo('Original');
      const id = await repository.create(todo);

      await repository.update(id, { title: 'Updated with 🎯 special chars & symbols' });

      const updatedTodo = await repository.getById(id);
      expect(updatedTodo!.titleValue).toBe('Updated with 🎯 special chars & symbols');
    });

    it('should handle title as object with value property', async () => {
      const todo = new Todo('Original');
      const id = await repository.create(todo);

      // Test the case where title is passed as an object with value property
      await repository.update(id, { title: { value: 'Object title' } as any });

      const updatedTodo = await repository.getById(id);
      expect(updatedTodo!.titleValue).toBe('Object title');
    });

    it('should handle priority as object with level property', async () => {
      const todo = new Todo('Test todo', false, new Date(), undefined, 'low');
      const id = await repository.create(todo);

      // Test the case where priority is passed as an object with level property
      await repository.update(id, { priority: { level: 'high' } as any });

      const updatedTodo = await repository.getById(id);
      expect(updatedTodo!.priority.level).toBe('high');
    });

    it('should handle dueDate update', async () => {
      const todo = new Todo('Test todo');
      const id = await repository.create(todo);

      const newDueDate = new Date('2024-12-31T23:59:59.999Z');
      await repository.update(id, { dueDate: newDueDate });

      const updatedTodo = await repository.getById(id);
      expect(updatedTodo!.dueDate).toEqual(newDueDate);
    });

    it('should handle dueDate set to null', async () => {
      const originalDueDate = new Date('2024-12-31T23:59:59.999Z');
      const todo = new Todo('Test todo', false, new Date(), undefined, 'medium', originalDueDate);
      const id = await repository.create(todo);

      // Set dueDate to null
      await repository.update(id, { dueDate: null });

      const updatedTodo = await repository.getById(id);
      expect(updatedTodo!.dueDate).toBeNull();
    });

    it('should throw error for non-existent todo', async () => {
      await expect(repository.update('507f1f77bcf86cd799439011', { title: 'New title' })).rejects.toThrow(
        'Todo with ID 507f1f77bcf86cd799439011 not found'
      );
    });

    it('should throw error for invalid ObjectId', async () => {
      await expect(repository.update('invalid-id', { title: 'New title' })).rejects.toThrow(
        'Todo with ID invalid-id not found'
      );
    });
  });

  describe('delete', () => {
    it('should delete existing todo', async () => {
      const todo = new Todo('To be deleted');
      const id = await repository.create(todo);

      await repository.delete(id);

      const deletedTodo = await repository.getById(id);
      expect(deletedTodo).toBeUndefined();
    });

    it('should update count after deletion', async () => {
      const todo1 = new Todo('First todo');
      const todo2 = new Todo('Second todo');
      
      await repository.create(todo1);
      const id2 = await repository.create(todo2);

      expect(await repository.count()).toBe(2);

      await repository.delete(id2);

      expect(await repository.count()).toBe(1);
    });

    it('should throw error for non-existent todo', async () => {
      await expect(repository.delete('507f1f77bcf86cd799439011')).rejects.toThrow(
        'Todo with ID 507f1f77bcf86cd799439011 not found'
      );
    });

    it('should throw error for invalid ObjectId', async () => {
      await expect(repository.delete('invalid-id')).rejects.toThrow(
        'Todo with ID invalid-id not found'
      );
    });
  });

  describe('filtering', () => {
    beforeEach(async () => {
      await repository.create(new Todo('Active todo 1', false));
      await repository.create(new Todo('Completed todo', true));
      await repository.create(new Todo('Active todo 2', false));
    });

    it('should return only active todos', async () => {
      const activeTodos = await repository.getActive();

      expect(activeTodos).toHaveLength(2);
      activeTodos.forEach(todo => {
        expect(todo.completed).toBe(false);
      });
    });

    it('should return only completed todos', async () => {
      const completedTodos = await repository.getCompleted();

      expect(completedTodos).toHaveLength(1);
      expect(completedTodos[0].completed).toBe(true);
      expect(completedTodos[0].titleValue).toBe('Completed todo');
    });

    it('should return empty array when no active todos exist', async () => {
      // Clear the beforeEach data and create only completed todos
      await TodoModel.deleteMany({});
      await repository.create(new Todo('Completed todo 1', true));
      await repository.create(new Todo('Completed todo 2', true));

      const activeTodos = await repository.getActive();
      expect(activeTodos).toHaveLength(0);
    });

    it('should return empty array when no completed todos exist', async () => {
      // Clear the beforeEach data and create only active todos
      await TodoModel.deleteMany({});
      await repository.create(new Todo('Active todo 1', false));
      await repository.create(new Todo('Active todo 2', false));

      const completedTodos = await repository.getCompleted();
      expect(completedTodos).toHaveLength(0);
    });
  });

  describe('counting', () => {
    beforeEach(async () => {
      await repository.create(new Todo('Active todo 1', false));
      await repository.create(new Todo('Completed todo', true));
      await repository.create(new Todo('Active todo 2', false));
    });

    it('should count all todos', async () => {
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