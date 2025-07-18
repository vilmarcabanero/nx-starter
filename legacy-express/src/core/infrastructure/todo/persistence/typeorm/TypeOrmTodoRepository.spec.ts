import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';
import { DataSource } from 'typeorm';
import { TypeOrmTodoRepository } from './TypeOrmTodoRepository';
import { TodoEntity } from './TodoEntity';
import { Todo } from '@/core/domain/todo/entities/Todo';

describe('TypeOrmTodoRepository', () => {
  let dataSource: DataSource;
  let repository: TypeOrmTodoRepository;

  beforeEach(async () => {
    // Create in-memory SQLite database for testing
    dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      entities: [TodoEntity],
      synchronize: true,
      logging: false,
    });

    await dataSource.initialize();
    repository = new TypeOrmTodoRepository(dataSource);
  });

  afterEach(async () => {
    // Clean up database after each test
    if (dataSource && dataSource.isInitialized) {
      await dataSource.getRepository(TodoEntity).clear();
    }
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
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
      const todo = await repository.getById('non-existent');

      expect(todo).toBeUndefined();
    });

    it('should return undefined for empty string id', async () => {
      const todo = await repository.getById('');

      expect(todo).toBeUndefined();
    });

    it('should return undefined for null-like id', async () => {
      const todo = await repository.getById('null');

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

    it('should throw error for non-existent todo', async () => {
      await expect(repository.update('non-existent', { title: 'New title' })).rejects.toThrow(
        'Todo with ID non-existent not found'
      );
    });

    it('should throw error for empty string id', async () => {
      await expect(repository.update('', { title: 'New title' })).rejects.toThrow(
        'Todo with ID  not found'
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
      await expect(repository.delete('non-existent')).rejects.toThrow(
        'Todo with ID non-existent not found'
      );
    });

    it('should throw error for empty string id', async () => {
      await expect(repository.delete('')).rejects.toThrow(
        'Empty criteria(s) are not allowed'
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
      await dataSource.getRepository(TodoEntity).clear();
      await repository.create(new Todo('Completed todo 1', true));
      await repository.create(new Todo('Completed todo 2', true));

      const activeTodos = await repository.getActive();
      expect(activeTodos).toHaveLength(0);
    });

    it('should return empty array when no completed todos exist', async () => {
      // Clear the beforeEach data and create only active todos
      await dataSource.getRepository(TodoEntity).clear();
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
