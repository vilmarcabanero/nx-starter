import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Todo } from '../../../domain/todo/entities/Todo';
import { TodoPriority } from '../../../domain/todo/value-objects/TodoPriority';
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

    it('should update todo with string title (not value object)', async () => {
      // Create a todo first
      const todo = new Todo('Original Title');
      const id = await repository.create(todo);

      // Update with plain string title (tests the 'else' branch in title handling)
      await repository.update(id, { title: 'Updated Title' as unknown as Todo['title'] });

      const updatedTodo = await repository.getById(id);
      expect(updatedTodo?.titleValue).toBe('Updated Title');
    });

    it('should update todo with title value object containing value property', async () => {
      // Create a todo first
      const todo = new Todo('Original Title');
      const id = await repository.create(todo);

      // Update with title value object (tests the 'if' branch for value object with value property)
      const titleValueObject = { value: 'Updated via Value Object' };
      await repository.update(id, { title: titleValueObject as unknown as Todo['title'] });

      const updatedTodo = await repository.getById(id);
      expect(updatedTodo?.titleValue).toBe('Updated via Value Object');
    });

    it('should update todo with TodoPriority value object', async () => {
      // Create a todo first
      const todo = new Todo('Test Todo');
      const id = await repository.create(todo);

      // Update with TodoPriority value object (tests the first branch in priority handling)
      const priorityValueObject = new TodoPriority('high');
      await repository.update(id, { priority: priorityValueObject });

      const updatedTodo = await repository.getById(id);
      expect(updatedTodo?.priority.level).toBe('high');
    });

    it('should update todo with string priority (not value object)', async () => {
      // Create a todo first
      const todo = new Todo('Test Todo');
      const id = await repository.create(todo);

      // Update with plain string priority (tests the 'else' branch in priority handling)
      await repository.update(id, { priority: 'high' as any });

      const updatedTodo = await repository.getById(id);
      expect(updatedTodo?.priority.level).toBe('high');
    });

    it('should update todo with dueDate set to null/undefined', async () => {
      // Create a todo first with a dueDate
      const todo = new Todo('Test Todo', false, new Date(), undefined, 'medium', new Date());
      const id = await repository.create(todo);

      // Verify it has a dueDate initially
      const initialTodo = await repository.getById(id);
      expect(initialTodo?.dueDate).toBeDefined();

      // Update with undefined dueDate (tests the dueDate branch)
      await repository.update(id, { dueDate: undefined });

      const updatedTodo = await repository.getById(id);
      // The repository should store undefined as null or undefined in the database
      expect(updatedTodo?.dueDate).toBeUndefined();
    });

    it('should handle completed status update correctly', async () => {
      // Create an uncompleted todo first
      const todo = new Todo('Test Todo', false);
      const id = await repository.create(todo);

      // Update completed status (tests the completed branch)
      await repository.update(id, { completed: true });

      const updatedTodo = await repository.getById(id);
      expect(updatedTodo?.completed).toBe(true);
    });

    it('should handle false completed status update', async () => {
      // Create a completed todo first
      const todo = new Todo('Test Todo', true);
      const id = await repository.create(todo);

      // Update completed status to false (tests the false branch)
      await repository.update(id, { completed: false });

      const updatedTodo = await repository.getById(id);
      expect(updatedTodo?.completed).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete a todo by id', async () => {
      // First create a todo
      const todo = new Todo('Todo to delete');
      const id = await repository.create(todo);
      
      // Verify it exists
      const existingTodo = await repository.getById(id);
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

  describe('findBySpecification', () => {
    it('should return todos that satisfy the specification', async () => {
      // Create test todos
      const todo1 = new Todo('High Priority Todo', false, new Date(), undefined, 'high');
      const todo2 = new Todo('Medium Priority Todo', false, new Date(), undefined, 'medium');
      const todo3 = new Todo('Another High Priority Todo', true, new Date(), undefined, 'high');
      
      await repository.create(todo1);
      await repository.create(todo2);
      await repository.create(todo3);

      // Create a specification that finds todos with high priority
      const highPrioritySpec = {
        isSatisfiedBy: (todo: Todo) => todo.priority.level === 'high'
      };

      const result = await repository.findBySpecification(highPrioritySpec);

      expect(result).toHaveLength(2);
      expect(result[0].priority.level).toBe('high');
      expect(result[1].priority.level).toBe('high');
    });

    it('should return empty array when no todos satisfy the specification', async () => {
      // Create test todos
      const todo1 = new Todo('Medium Priority Todo', false, new Date(), undefined, 'medium');
      const todo2 = new Todo('Low Priority Todo', false, new Date(), undefined, 'low');
      
      await repository.create(todo1);
      await repository.create(todo2);

      // Create a specification that finds todos with high priority (none exist)
      const highPrioritySpec = {
        isSatisfiedBy: (todo: Todo) => todo.priority.level === 'high'
      };

      const result = await repository.findBySpecification(highPrioritySpec);

      expect(result).toHaveLength(0);
    });
  });

  describe('mapToTodoEntity edge cases', () => {
    it('should handle todo records with null/undefined createdAt', async () => {
      // Create a todo first
      const todo = new Todo('Test Todo');
      const id = await repository.create(todo);
      
      // Directly modify the database record to have null createdAt
      await db.todos.update(id, { createdAt: null as any });
      
      // Retrieve the todo - this should trigger the default Date() branch in mapToTodoEntity
      const retrievedTodo = await repository.getById(id);
      
      expect(retrievedTodo).toBeDefined();
      expect(retrievedTodo!.createdAt).toBeInstanceOf(Date);
      // Should be very recent (within last second)
      expect(Date.now() - retrievedTodo!.createdAt.getTime()).toBeLessThan(1000);
    });

    it('should handle todo records with undefined createdAt', async () => {
      // Create a todo first
      const todo = new Todo('Test Todo');
      const id = await repository.create(todo);
      
      // Directly modify the database record to have undefined createdAt
      await db.todos.update(id, { createdAt: undefined as any });
      
      // Retrieve the todo - this should trigger the default Date() branch in mapToTodoEntity
      const retrievedTodo = await repository.getById(id);
      
      expect(retrievedTodo).toBeDefined();
      expect(retrievedTodo!.createdAt).toBeInstanceOf(Date);
      // Should be very recent (within last second)
      expect(Date.now() - retrievedTodo!.createdAt.getTime()).toBeLessThan(1000);
    });

    it('should handle todo records with null/undefined priority', async () => {
      // Create a todo first
      const todo = new Todo('Test Todo');
      const id = await repository.create(todo);
      
      // Directly modify the database record to have null priority
      await db.todos.update(id, { priority: null as any });
      
      // Retrieve the todo - this should trigger the default 'medium' priority branch in mapToTodoEntity
      const retrievedTodo = await repository.getById(id);
      
      expect(retrievedTodo).toBeDefined();
      expect(retrievedTodo!.priority.level).toBe('medium');
    });

    it('should handle todo records with undefined priority', async () => {
      // Create a todo first
      const todo = new Todo('Test Todo');
      const id = await repository.create(todo);
      
      // Directly modify the database record to have undefined priority
      await db.todos.update(id, { priority: undefined as any });
      
      // Retrieve the todo - this should trigger the default 'medium' priority branch in mapToTodoEntity
      const retrievedTodo = await repository.getById(id);
      
      expect(retrievedTodo).toBeDefined();
      expect(retrievedTodo!.priority.level).toBe('medium');
    });
  });
});