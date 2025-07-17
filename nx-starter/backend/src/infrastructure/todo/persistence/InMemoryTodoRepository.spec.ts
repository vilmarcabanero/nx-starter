import { InMemoryTodoRepository } from './InMemoryTodoRepository';
import { Todo, TodoTitle } from '@nx-starter/shared-domain';

describe('InMemoryTodoRepository', () => {
  let repository: InMemoryTodoRepository;

  beforeEach(() => {
    repository = new InMemoryTodoRepository();
  });

  describe('create', () => {
    it('should create a new todo', async () => {
      const todo = new Todo('Test Todo', false, new Date(), undefined, 'medium');
      
      const id = await repository.create(todo);
      
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
    });

    it('should store todo with generated ID', async () => {
      const todo = new Todo('Test Todo', false, new Date(), undefined, 'medium');
      
      const id = await repository.create(todo);
      const retrieved = await repository.getById(id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.stringId).toBe(id);
      expect(retrieved?.title.value).toBe('Test Todo');
    });
  });

  describe('getAll', () => {
    it('should return empty array when no todos', async () => {
      const todos = await repository.getAll();
      
      expect(todos).toEqual([]);
    });

    it('should return all todos sorted by creation date', async () => {
      const todo1 = new Todo('First Todo', false, new Date(2023, 0, 1), undefined, 'medium');
      const todo2 = new Todo('Second Todo', false, new Date(2023, 0, 2), undefined, 'medium');
      
      await repository.create(todo1);
      await repository.create(todo2);
      
      const todos = await repository.getAll();
      
      expect(todos).toHaveLength(2);
      expect(todos[0].title.value).toBe('Second Todo'); // Most recent first
      expect(todos[1].title.value).toBe('First Todo');
    });
  });

  describe('getById', () => {
    it('should return todo by ID', async () => {
      const todo = new Todo('Test Todo', false, new Date(), undefined, 'medium');
      const id = await repository.create(todo);
      
      const retrieved = await repository.getById(id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.stringId).toBe(id);
      expect(retrieved?.title.value).toBe('Test Todo');
    });

    it('should return undefined for non-existent ID', async () => {
      const retrieved = await repository.getById('non-existent');
      
      expect(retrieved).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update existing todo', async () => {
      const todo = new Todo('Test Todo', false, new Date(), undefined, 'medium');
      const id = await repository.create(todo);
      
      await repository.update(id, { title: new TodoTitle('Updated Todo'), completed: true });
      
      const updated = await repository.getById(id);
      expect(updated?.title.value).toBe('Updated Todo');
      expect(updated?.completed).toBe(true);
    });

    it('should throw error for non-existent todo', async () => {
      await expect(repository.update('non-existent', { title: new TodoTitle('Updated') }))
        .rejects
        .toThrow('Todo with ID non-existent not found');
    });
  });

  describe('delete', () => {
    it('should delete existing todo', async () => {
      const todo = new Todo('Test Todo', false, new Date(), undefined, 'medium');
      const id = await repository.create(todo);
      
      await repository.delete(id);
      
      const retrieved = await repository.getById(id);
      expect(retrieved).toBeUndefined();
    });

    it('should throw error for non-existent todo', async () => {
      await expect(repository.delete('non-existent'))
        .rejects
        .toThrow('Todo with ID non-existent not found');
    });
  });

  describe('getActive', () => {
    it('should return only active todos', async () => {
      const activeTodo = new Todo('Active Todo', false, new Date(), undefined, 'medium');
      const completedTodo = new Todo('Completed Todo', true, new Date(), undefined, 'medium');
      
      await repository.create(activeTodo);
      await repository.create(completedTodo);
      
      const active = await repository.getActive();
      
      expect(active).toHaveLength(1);
      expect(active[0].title.value).toBe('Active Todo');
      expect(active[0].completed).toBe(false);
    });
  });

  describe('getCompleted', () => {
    it('should return only completed todos', async () => {
      const activeTodo = new Todo('Active Todo', false, new Date(), undefined, 'medium');
      const completedTodo = new Todo('Completed Todo', true, new Date(), undefined, 'medium');
      
      await repository.create(activeTodo);
      await repository.create(completedTodo);
      
      const completed = await repository.getCompleted();
      
      expect(completed).toHaveLength(1);
      expect(completed[0].title.value).toBe('Completed Todo');
      expect(completed[0].completed).toBe(true);
    });
  });

  describe('count methods', () => {
    beforeEach(async () => {
      const activeTodo = new Todo('Active Todo', false, new Date(), undefined, 'medium');
      const completedTodo = new Todo('Completed Todo', true, new Date(), undefined, 'medium');
      
      await repository.create(activeTodo);
      await repository.create(completedTodo);
    });

    it('should count all todos', async () => {
      const count = await repository.count();
      expect(count).toBe(2);
    });

    it('should count active todos', async () => {
      const count = await repository.countActive();
      expect(count).toBe(1);
    });

    it('should count completed todos', async () => {
      const count = await repository.countCompleted();
      expect(count).toBe(1);
    });
  });
});