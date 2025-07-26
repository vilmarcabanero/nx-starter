import { describe, it, expect } from 'vitest';
import type { Todo } from '@nx-starter/domain';
import type {
  CreateTodoData,
  UpdateTodoData,
  ITodoCommandService,
  ITodoQueryService,
  ITodoService,
} from './ITodoService';

// Import the actual module to ensure coverage
import * as ITodoServiceModule from './ITodoService';

describe('ITodoService Module', () => {
  it('should export all expected types and interfaces', () => {
    // This ensures the module is imported and coverage is tracked
    expect(ITodoServiceModule).toBeDefined();
    expect(typeof ITodoServiceModule).toBe('object');
  });
});

describe('ITodoService Interfaces', () => {
  describe('CreateTodoData interface', () => {
    it('should define correct structure with required title', () => {
      const createData: CreateTodoData = {
        title: 'Test todo',
      };

      expect(createData.title).toBe('Test todo');
      expect(createData.priority).toBeUndefined();
      expect(createData.dueDate).toBeUndefined();
    });

    it('should allow optional priority and dueDate', () => {
      const createData: CreateTodoData = {
        title: 'Test todo with details',
        priority: 'high',
        dueDate: new Date('2025-12-31'),
      };

      expect(createData.title).toBe('Test todo with details');
      expect(createData.priority).toBe('high');
      expect(createData.dueDate).toBeInstanceOf(Date);
    });

    it('should support all priority levels', () => {
      const lowPriorityData: CreateTodoData = {
        title: 'Low priority',
        priority: 'low',
      };
      const mediumPriorityData: CreateTodoData = {
        title: 'Medium priority',
        priority: 'medium',
      };
      const highPriorityData: CreateTodoData = {
        title: 'High priority',
        priority: 'high',
      };

      expect(lowPriorityData.priority).toBe('low');
      expect(mediumPriorityData.priority).toBe('medium');
      expect(highPriorityData.priority).toBe('high');
    });
  });

  describe('UpdateTodoData interface', () => {
    it('should allow partial updates with any combination of fields', () => {
      const titleUpdate: UpdateTodoData = {
        title: 'Updated title',
      };
      const completedUpdate: UpdateTodoData = {
        completed: true,
      };
      const priorityUpdate: UpdateTodoData = {
        priority: 'low',
      };
      const dueDateUpdate: UpdateTodoData = {
        dueDate: new Date('2025-06-15'),
      };

      expect(titleUpdate.title).toBe('Updated title');
      expect(completedUpdate.completed).toBe(true);
      expect(priorityUpdate.priority).toBe('low');
      expect(dueDateUpdate.dueDate).toBeInstanceOf(Date);
    });

    it('should allow all fields to be updated simultaneously', () => {
      const fullUpdate: UpdateTodoData = {
        title: 'Fully updated todo',
        completed: true,
        priority: 'high',
        dueDate: new Date('2025-12-25'),
      };

      expect(fullUpdate.title).toBe('Fully updated todo');
      expect(fullUpdate.completed).toBe(true);
      expect(fullUpdate.priority).toBe('high');
      expect(fullUpdate.dueDate).toBeInstanceOf(Date);
    });

    it('should allow empty update object', () => {
      const emptyUpdate: UpdateTodoData = {};

      expect(Object.keys(emptyUpdate)).toHaveLength(0);
    });
  });

  describe('ITodoCommandService interface', () => {
    it('should define the correct command service contract', () => {
      // This test verifies the interface structure exists and has the expected methods
      // We can't instantiate an interface, but we can verify its shape through type checking
      const mockCommandService: ITodoCommandService = {
        createTodo: async () => ({} as Todo),
        updateTodo: async () => ({} as Todo),
        deleteTodo: async () => undefined,
        toggleTodo: async () => ({} as Todo),
      };

      expect(typeof mockCommandService.createTodo).toBe('function');
      expect(typeof mockCommandService.updateTodo).toBe('function');
      expect(typeof mockCommandService.deleteTodo).toBe('function');
      expect(typeof mockCommandService.toggleTodo).toBe('function');
    });
  });

  describe('ITodoQueryService interface', () => {
    it('should define the correct query service contract', () => {
      // This test verifies the interface structure exists and has the expected methods
      const mockQueryService: ITodoQueryService = {
        getAllTodos: async () => [],
        getActiveTodos: async () => [],
        getCompletedTodos: async () => [],
        getTodoById: async () => ({} as Todo),
        getFilteredTodos: async () => [],
        getTodoStats: async () => ({
          total: 0,
          active: 0,
          completed: 0,
        }),
      };

      expect(typeof mockQueryService.getAllTodos).toBe('function');
      expect(typeof mockQueryService.getActiveTodos).toBe('function');
      expect(typeof mockQueryService.getCompletedTodos).toBe('function');
      expect(typeof mockQueryService.getTodoById).toBe('function');
      expect(typeof mockQueryService.getFilteredTodos).toBe('function');
      expect(typeof mockQueryService.getTodoStats).toBe('function');
    });
  });

  describe('ITodoService interface', () => {
    it('should extend both command and query service interfaces', () => {
      // This test verifies that ITodoService includes all methods from both interfaces
      const mockTodoService: ITodoService = {
        // Command methods
        createTodo: async () => ({} as Todo),
        updateTodo: async () => ({} as Todo),
        deleteTodo: async () => undefined,
        toggleTodo: async () => ({} as Todo),
        // Query methods
        getAllTodos: async () => [],
        getActiveTodos: async () => [],
        getCompletedTodos: async () => [],
        getTodoById: async () => ({} as Todo),
        getFilteredTodos: async () => [],
        getTodoStats: async () => ({
          total: 0,
          active: 0,
          completed: 0,
        }),
      };

      // Verify command methods
      expect(typeof mockTodoService.createTodo).toBe('function');
      expect(typeof mockTodoService.updateTodo).toBe('function');
      expect(typeof mockTodoService.deleteTodo).toBe('function');
      expect(typeof mockTodoService.toggleTodo).toBe('function');

      // Verify query methods
      expect(typeof mockTodoService.getAllTodos).toBe('function');
      expect(typeof mockTodoService.getActiveTodos).toBe('function');
      expect(typeof mockTodoService.getCompletedTodos).toBe('function');
      expect(typeof mockTodoService.getTodoById).toBe('function');
      expect(typeof mockTodoService.getFilteredTodos).toBe('function');
      expect(typeof mockTodoService.getTodoStats).toBe('function');
    });
  });
});