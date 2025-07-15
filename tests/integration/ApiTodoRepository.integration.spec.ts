import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { ApiTodoRepository } from '@/core/infrastructure/todo/persistence/ApiTodoRepository';
import { Todo } from '@/core/domain/todo/entities/Todo';

// Integration test for API TodoRepository
// NOTE: This test requires the server to be running on port 3001
describe('ApiTodoRepository Integration Tests', () => {
  let repository: ApiTodoRepository;
  let createdTodoIds: string[] = [];

  beforeAll(async () => {
    repository = new ApiTodoRepository();
    
    // Test if the server is running
    try {
      const response = await fetch('http://localhost:3001/api/health');
      if (!response.ok) {
        throw new Error('Server health check failed');
      }
    } catch (error) {
      console.warn('⚠️  Server not running on localhost:3001. Skipping integration tests.');
      console.warn('To run integration tests, start the server with: cd server && npm run dev');
      throw new Error('Server not available for integration testing');
    }
  });

  beforeEach(() => {
    createdTodoIds = [];
  });

  afterAll(async () => {
    // Clean up any todos created during testing
    for (const id of createdTodoIds) {
      try {
        await repository.delete(id);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  describe('CRUD Operations', () => {
    it('should create, read, update, and delete a todo via API', async () => {
      // Create a new todo
      const todo = new Todo('Integration Test Todo', false, new Date(), undefined, 'high');
      const todoId = await repository.create(todo);
      createdTodoIds.push(todoId);

      expect(todoId).toBeTruthy();
      expect(typeof todoId).toBe('string');

      // Read the created todo
      const fetchedTodo = await repository.getById(todoId);
      expect(fetchedTodo).toBeDefined();
      expect(fetchedTodo?.titleValue).toBe('Integration Test Todo');
      expect(fetchedTodo?.completed).toBe(false);
      expect(fetchedTodo?.priority.level).toBe('high');

      // Update the todo
      await repository.update(todoId, {
        title: 'Updated Integration Test Todo',
        completed: true,
        priority: 'low'
      });

      // Verify the update
      const updatedTodo = await repository.getById(todoId);
      expect(updatedTodo?.titleValue).toBe('Updated Integration Test Todo');
      expect(updatedTodo?.completed).toBe(true);
      expect(updatedTodo?.priority.level).toBe('low');

      // Delete the todo
      await repository.delete(todoId);

      // Verify deletion
      const deletedTodo = await repository.getById(todoId);
      expect(deletedTodo).toBeUndefined();

      // Remove from cleanup list since we deleted it
      createdTodoIds = createdTodoIds.filter(id => id !== todoId);
    });

    it('should handle todos with due dates', async () => {
      // Use a future date to avoid validation issues
      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      const todo = new Todo('Todo with due date', false, new Date(), undefined, 'medium', dueDate);
      
      const todoId = await repository.create(todo);
      createdTodoIds.push(todoId);

      const fetchedTodo = await repository.getById(todoId);
      expect(fetchedTodo?.dueDate).toBeDefined();
      // Allow for small time differences due to serialization
      expect(Math.abs(fetchedTodo!.dueDate!.getTime() - dueDate.getTime())).toBeLessThan(1000);
    });
  });

  describe('Query Operations', () => {
    it('should get all, active, and completed todos after creating test data', async () => {
      // Create test data - start with all active todos
      const activeTodos = [
        new Todo('Active Todo 1', false, new Date(), undefined, 'high'),
        new Todo('Active Todo 2', false, new Date(), undefined, 'medium'),
      ];

      const createdIds = [];
      for (const todo of activeTodos) {
        const id = await repository.create(todo);
        createdIds.push(id);
        createdTodoIds.push(id);
      }

      // Mark some as completed by updating them
      await repository.update(createdIds[0], { completed: true });

      // Test getAll
      const allTodos = await repository.getAll();
      expect(allTodos.length).toBeGreaterThanOrEqual(2);
      
      // Test getActive
      const activeOnly = await repository.getActive();
      expect(activeOnly.length).toBeGreaterThanOrEqual(1);
      activeOnly.forEach(todo => {
        expect(todo.completed).toBe(false);
      });

      // Test getCompleted
      const completedOnly = await repository.getCompleted();
      expect(completedOnly.length).toBeGreaterThanOrEqual(1);
      completedOnly.forEach(todo => {
        expect(todo.completed).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('should return undefined for non-existent todo', async () => {
      const nonExistentTodo = await repository.getById('nonexistent123456789012345678901234');
      expect(nonExistentTodo).toBeUndefined();
    });

    it('should handle validation errors gracefully', async () => {
      // Try to create a todo with invalid data (empty title)
      // This should fail on the client side before reaching the server
      expect(() => {
        new Todo('', false); // Empty title should fail validation
      }).toThrow('Invalid todo title: cannot be empty');
    });
  });

  describe('Specification Filtering', () => {
    it('should filter todos by specification', async () => {
      // Create test todos with different priorities
      const highPriorityTodo = new Todo('High Priority', false, new Date(), undefined, 'high');
      const lowPriorityTodo = new Todo('Low Priority', false, new Date(), undefined, 'low');
      
      const highId = await repository.create(highPriorityTodo);
      const lowId = await repository.create(lowPriorityTodo);
      createdTodoIds.push(highId, lowId);

      // Mock specification that filters for high priority todos
      const highPrioritySpec = {
        isSatisfiedBy: (todo: Todo) => todo.priority.level === 'high'
      };

      const filteredTodos = await repository.findBySpecification(highPrioritySpec);
      
      // Should include at least our high priority todo
      const highPriorityTodos = filteredTodos.filter(todo => todo.priority.level === 'high');
      expect(highPriorityTodos.length).toBeGreaterThanOrEqual(1);
      
      // Should not include any low priority todos
      const lowPriorityTodos = filteredTodos.filter(todo => todo.priority.level === 'low');
      expect(lowPriorityTodos.length).toBe(0);
    });
  });
});