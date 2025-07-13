import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTodoStore } from '@/core/infrastructure/todo/state/TodoStore';
import { configureDI, container, TOKENS } from '@/core/infrastructure/shared/container';
import type { ITodoService, ITodoCommandService, ITodoQueryService } from '@/core/application/shared/interfaces/ITodoService';
import { Todo } from '@/core/domain/todo/entities/Todo';

// Mock the CQRS services separately to test clean architecture
const mockTodoCommandService: ITodoCommandService = {
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
  toggleTodo: vi.fn(),
};

const mockTodoQueryService: ITodoQueryService = {
  getAllTodos: vi.fn(),
  getActiveTodos: vi.fn(),
  getCompletedTodos: vi.fn(),
  getTodoById: vi.fn(),
  getFilteredTodos: vi.fn(),
  getTodoStats: vi.fn(),
};

// Combined service for backward compatibility
const mockTodoService: ITodoService = {
  ...mockTodoCommandService,
  ...mockTodoQueryService,
};

describe('TodoStore Status Management', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useTodoStore.setState({
      todos: [],
      filter: 'all',
      status: 'idle',
      error: null,
    });

    configureDI();
    
    // Override the resolved services with our mocks following CQRS pattern
    vi.spyOn(container, 'resolve').mockImplementation((token) => {
      if (token === TOKENS.TodoCommandService) {
        return mockTodoCommandService;
      }
      if (token === TOKENS.TodoQueryService) {
        return mockTodoQueryService;
      }
      return mockTodoService;
    });
    
    // Reset all mocks
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useTodoStore.getState();
      
      expect(state.status).toBe('idle');
      expect(state.error).toBeNull();
      expect(state.getIsLoading()).toBe(false);
      expect(state.getIsIdle()).toBe(true);
      expect(state.getHasError()).toBe(false);
    });
  });

  describe('status transitions', () => {
    it('should transition from idle to loading', () => {
      useTodoStore.setState({ status: 'loading' });
      
      const state = useTodoStore.getState();
      expect(state.status).toBe('loading');
      expect(state.getIsLoading()).toBe(true);
      expect(state.getIsIdle()).toBe(false);
      expect(state.getHasError()).toBe(false);
    });

    it('should transition from loading to succeeded', () => {
      useTodoStore.setState({ status: 'loading' });
      useTodoStore.setState({ status: 'succeeded' });
      
      const state = useTodoStore.getState();
      expect(state.status).toBe('succeeded');
      expect(state.getIsLoading()).toBe(false);
      expect(state.getIsIdle()).toBe(false);
      expect(state.getHasError()).toBe(false);
    });

    it('should transition from loading to failed', () => {
      useTodoStore.setState({ status: 'loading' });
      useTodoStore.setState({ status: 'failed', error: 'Something went wrong' });
      
      const state = useTodoStore.getState();
      expect(state.status).toBe('failed');
      expect(state.getIsLoading()).toBe(false);
      expect(state.getIsIdle()).toBe(false);
      expect(state.getHasError()).toBe(true);
      expect(state.error).toBe('Something went wrong');
    });
  });

  describe('loadTodos status management', () => {
    it('should set loading status when loadTodos starts', async () => {
      const mockTodos: Todo[] = [
        new Todo('Test Todo', false, new Date(), 1),
      ];
      
      let resolvePromise: (value: Todo[]) => void = () => {};
      const promise = new Promise<Todo[]>((resolve) => {
        resolvePromise = resolve;
      });
      
      mockTodoQueryService.getAllTodos = vi.fn().mockReturnValue(promise);
      
      // Start the async operation
      const loadPromise = useTodoStore.getState().loadTodos();
      
      // Check that status is loading
      expect(useTodoStore.getState().status).toBe('loading');
      expect(useTodoStore.getState().getIsLoading()).toBe(true);
      expect(useTodoStore.getState().error).toBeNull();
      
      // Resolve the promise
      resolvePromise(mockTodos);
      await loadPromise;
      
      // Check that status is succeeded
      const finalState = useTodoStore.getState();
      expect(finalState.status).toBe('succeeded');
      expect(finalState.getIsLoading()).toBe(false);
      expect(finalState.todos).toEqual(mockTodos);
    });

    it('should set failed status when loadTodos fails', async () => {
      const errorMessage = 'Failed to load todos';
      mockTodoQueryService.getAllTodos = vi.fn().mockRejectedValue(new Error(errorMessage));
      
      await useTodoStore.getState().loadTodos();
      
      const state = useTodoStore.getState();
      expect(state.status).toBe('failed');
      expect(state.getHasError()).toBe(true);
      expect(state.error).toBe(errorMessage);
      expect(state.getIsLoading()).toBe(false);
    });
  });

  describe('createTodo status management', () => {
    it('should create todo successfully without loading state', async () => {
      const mockTodo = new Todo('New Todo', false, new Date(), 1);
      mockTodoCommandService.createTodo = vi.fn().mockResolvedValue(mockTodo);
      
      await useTodoStore.getState().createTodo({ title: 'New Todo' });
      
      const finalState = useTodoStore.getState();
      expect(finalState.status).toBe('succeeded');
      expect(finalState.getIsLoading()).toBe(false);
      expect(finalState.todos).toContain(mockTodo);
      expect(finalState.error).toBeNull();
    });

    it('should set failed status when createTodo fails', async () => {
      const errorMessage = 'Failed to create todo';
      mockTodoCommandService.createTodo = vi.fn().mockRejectedValue(new Error(errorMessage));
      
      try {
        await useTodoStore.getState().createTodo({ title: 'New Todo' });
      } catch {
        // Expected to throw
      }
      
      const state = useTodoStore.getState();
      expect(state.status).toBe('failed');
      expect(state.getHasError()).toBe(true);
      expect(state.error).toBe(errorMessage);
      expect(state.getIsLoading()).toBe(false);
    });
  });

  describe('updateTodo status management', () => {
    it('should update todo successfully without loading state', async () => {
      const mockTodo = new Todo('Updated Todo', true, new Date(), 1);
      
      // Set initial state with a todo
      useTodoStore.setState({
        todos: [new Todo('Test Todo', false, new Date(), 1)],
        status: 'idle',
        error: null,
      });
      
      mockTodoCommandService.updateTodo = vi.fn().mockResolvedValue(mockTodo);
      
      await useTodoStore.getState().updateTodo(1, { completed: true });
      
      const finalState = useTodoStore.getState();
      expect(finalState.status).toBe('succeeded');
      expect(finalState.getIsLoading()).toBe(false);
      expect(finalState.todos[0].completed).toBe(true);
      expect(finalState.error).toBeNull();
    });

    it('should set failed status when updateTodo fails', async () => {
      const errorMessage = 'Failed to update todo';
      mockTodoCommandService.updateTodo = vi.fn().mockRejectedValue(new Error(errorMessage));
      
      // Set initial state with a todo
      useTodoStore.setState({
        todos: [new Todo('Test Todo', false, new Date(), 1)],
        status: 'idle',
        error: null,
      });
      
      try {
        await useTodoStore.getState().updateTodo(1, { completed: true });
      } catch {
        // Expected to throw
      }
      
      const state = useTodoStore.getState();
      expect(state.status).toBe('failed');
      expect(state.getHasError()).toBe(true);
      expect(state.error).toBe(errorMessage);
      expect(state.getIsLoading()).toBe(false);
    });
  });

  describe('deleteTodo status management', () => {
    it('should delete todo successfully without loading state', async () => {
      // Set initial state with a todo
      useTodoStore.setState({
        todos: [new Todo('Test Todo', false, new Date(), 1)],
        status: 'idle',
        error: null,
      });
      
      mockTodoCommandService.deleteTodo = vi.fn().mockResolvedValue(undefined);
      
      await useTodoStore.getState().deleteTodo(1);
      
      const finalState = useTodoStore.getState();
      expect(finalState.status).toBe('succeeded');
      expect(finalState.getIsLoading()).toBe(false);
      expect(finalState.todos).toHaveLength(0);
      expect(finalState.error).toBeNull();
    });

    it('should set failed status when deleteTodo fails', async () => {
      const errorMessage = 'Failed to delete todo';
      mockTodoCommandService.deleteTodo = vi.fn().mockRejectedValue(new Error(errorMessage));
      
      // Set initial state with a todo
      useTodoStore.setState({
        todos: [new Todo('Test Todo', false, new Date(), 1)],
        status: 'idle',
        error: null,
      });
      
      try {
        await useTodoStore.getState().deleteTodo(1);
      } catch {
        // Expected to throw
      }
      
      const state = useTodoStore.getState();
      expect(state.status).toBe('failed');
      expect(state.getHasError()).toBe(true);
      expect(state.error).toBe(errorMessage);
      expect(state.getIsLoading()).toBe(false);
    });
  });

  describe('clearError', () => {
    it('should clear error and reset status to idle', () => {
      // Set failed state
      useTodoStore.setState({
        status: 'failed',
        error: 'Something went wrong',
      });
      
      // Clear error
      useTodoStore.getState().clearError();
      
      const state = useTodoStore.getState();
      expect(state.status).toBe('idle');
      expect(state.error).toBeNull();
      expect(state.getIsIdle()).toBe(true);
      expect(state.getHasError()).toBe(false);
    });
  });

  describe('status-derived computed getters', () => {
    it('should correctly compute getIsLoading', () => {
      const testCases = [
        { status: 'idle', expected: false },
        { status: 'loading', expected: true },
        { status: 'succeeded', expected: false },
        { status: 'failed', expected: false },
      ] as const;
      
      testCases.forEach(({ status, expected }) => {
        useTodoStore.setState({ status });
        expect(useTodoStore.getState().getIsLoading()).toBe(expected);
      });
    });

    it('should correctly compute getIsIdle', () => {
      const testCases = [
        { status: 'idle', expected: true },
        { status: 'loading', expected: false },
        { status: 'succeeded', expected: false },
        { status: 'failed', expected: false },
      ] as const;
      
      testCases.forEach(({ status, expected }) => {
        useTodoStore.setState({ status });
        expect(useTodoStore.getState().getIsIdle()).toBe(expected);
      });
    });

    it('should correctly compute getHasError', () => {
      const testCases = [
        { status: 'idle', expected: false },
        { status: 'loading', expected: false },
        { status: 'succeeded', expected: false },
        { status: 'failed', expected: true },
      ] as const;
      
      testCases.forEach(({ status, expected }) => {
        useTodoStore.setState({ status });
        expect(useTodoStore.getState().getHasError()).toBe(expected);
      });
    });
  });

  describe('status state machine validation', () => {
    it('should prevent impossible state combinations', () => {
      // Ensure only one status can be true at a time
      const testStatuses = ['idle', 'loading', 'succeeded', 'failed'] as const;
      
      testStatuses.forEach(status => {
        useTodoStore.setState({ status });
        const state = useTodoStore.getState();
        
        const statusBooleans = {
          isIdle: state.getIsIdle(),
          isLoading: state.getIsLoading(),
          hasError: state.getHasError(),
        };
        
        // Count how many status flags are true
        const trueCount = Object.values(statusBooleans).filter(Boolean).length;
        
        // Only one status flag should be true (except for 'succeeded' which has no boolean flag)
        if (status === 'succeeded') {
          expect(trueCount).toBe(0);
        } else {
          expect(trueCount).toBe(1);
        }
      });
    });
  });

  describe('getFilteredTodos', () => {
    beforeEach(() => {
      const todos = [
        new Todo('Active Todo 1', false, new Date(), 1),
        new Todo('Completed Todo 1', true, new Date(), 2),
        new Todo('Active Todo 2', false, new Date(), 3),
        new Todo('Completed Todo 2', true, new Date(), 4),
      ];
      
      useTodoStore.setState({
        todos,
        filter: 'all',
        status: 'idle',
        error: null,
      });
    });

    it('should return all todos when filter is "all"', () => {
      useTodoStore.setState({ filter: 'all' });
      const filteredTodos = useTodoStore.getState().getFilteredTodos();
      expect(filteredTodos).toHaveLength(4);
    });

    it('should return only active todos when filter is "active"', () => {
      useTodoStore.setState({ filter: 'active' });
      const filteredTodos = useTodoStore.getState().getFilteredTodos();
      expect(filteredTodos).toHaveLength(2);
      expect(filteredTodos.every(todo => !todo.completed)).toBe(true);
    });

    it('should return only completed todos when filter is "completed"', () => {
      useTodoStore.setState({ filter: 'completed' });
      const filteredTodos = useTodoStore.getState().getFilteredTodos();
      expect(filteredTodos).toHaveLength(2);
      expect(filteredTodos.every(todo => todo.completed)).toBe(true);
    });

    it('should return all todos for default case', () => {
      // @ts-expect-error Testing invalid filter value
      useTodoStore.setState({ filter: 'invalid' });
      const filteredTodos = useTodoStore.getState().getFilteredTodos();
      expect(filteredTodos).toHaveLength(4);
    });
  });

  describe('getStats', () => {
    it('should return correct stats for empty todos', () => {
      useTodoStore.setState({ todos: [] });
      const stats = useTodoStore.getState().getStats();
      expect(stats).toEqual({
        total: 0,
        active: 0,
        completed: 0,
      });
    });

    it('should return correct stats for mixed todos', () => {
      const todos = [
        new Todo('Active Todo 1', false, new Date(), 1),
        new Todo('Completed Todo 1', true, new Date(), 2),
        new Todo('Active Todo 2', false, new Date(), 3),
        new Todo('Completed Todo 2', true, new Date(), 4),
        new Todo('Active Todo 3', false, new Date(), 5),
      ];
      
      useTodoStore.setState({ todos });
      const stats = useTodoStore.getState().getStats();
      expect(stats).toEqual({
        total: 5,
        active: 3,
        completed: 2,
      });
    });

    it('should return correct stats for all active todos', () => {
      const todos = [
        new Todo('Active Todo 1', false, new Date(), 1),
        new Todo('Active Todo 2', false, new Date(), 2),
      ];
      
      useTodoStore.setState({ todos });
      const stats = useTodoStore.getState().getStats();
      expect(stats).toEqual({
        total: 2,
        active: 2,
        completed: 0,
      });
    });

    it('should return correct stats for all completed todos', () => {
      const todos = [
        new Todo('Completed Todo 1', true, new Date(), 1),
        new Todo('Completed Todo 2', true, new Date(), 2),
      ];
      
      useTodoStore.setState({ todos });
      const stats = useTodoStore.getState().getStats();
      expect(stats).toEqual({
        total: 2,
        active: 0,
        completed: 2,
      });
    });
  });

  describe('setFilter', () => {
    it('should set filter to "all"', () => {
      useTodoStore.getState().setFilter('all');
      expect(useTodoStore.getState().filter).toBe('all');
    });

    it('should set filter to "active"', () => {
      useTodoStore.getState().setFilter('active');
      expect(useTodoStore.getState().filter).toBe('active');
    });

    it('should set filter to "completed"', () => {
      useTodoStore.getState().setFilter('completed');
      expect(useTodoStore.getState().filter).toBe('completed');
    });
  });

  describe('toggleTodo', () => {
    beforeEach(() => {
      const todos = [
        new Todo('Test Todo 1', false, new Date(), 1),
        new Todo('Test Todo 2', true, new Date(), 2),
      ];
      
      useTodoStore.setState({
        todos,
        status: 'idle',
        error: null,
      });
    });

    it('should toggle todo completion status successfully', async () => {
      const updatedTodo = new Todo('Test Todo 1', true, new Date(), 1);
      mockTodoCommandService.toggleTodo = vi.fn().mockResolvedValue(updatedTodo);

      await useTodoStore.getState().toggleTodo(1);

      const state = useTodoStore.getState();
      expect(state.status).toBe('succeeded');
      expect(state.todos[0].completed).toBe(true);
      expect(mockTodoCommandService.toggleTodo).toHaveBeenCalledWith(1);
    });

    it('should handle toggle todo failure with error revert', async () => {
      const errorMessage = 'Failed to toggle todo';
      mockTodoCommandService.toggleTodo = vi.fn().mockRejectedValue(new Error(errorMessage));
      
      // Test todo 1 starts as false (not completed)
      expect(useTodoStore.getState().todos[0].completed).toBe(false);

      try {
        await useTodoStore.getState().toggleTodo(1);
      } catch {
        // Expected to throw
      }

      const state = useTodoStore.getState();
      expect(state.status).toBe('failed');
      expect(state.error).toBe(errorMessage);
      expect(state.todos[0].completed).toBe(false); // Should be reverted to original false
    });

    it('should handle toggle todo when todo is not found', async () => {
      const updatedTodo = new Todo('Test Todo 999', false, new Date(), 999);
      mockTodoCommandService.toggleTodo = vi.fn().mockResolvedValue(updatedTodo);

      await useTodoStore.getState().toggleTodo(999);

      const state = useTodoStore.getState();
      expect(state.status).toBe('succeeded');
      // Todo should not be found and not updated
      expect(state.todos.find(todo => todo.id === 999)).toBeUndefined();
    });

    it('should handle non-Error objects in catch block', async () => {
      mockTodoCommandService.toggleTodo = vi.fn().mockRejectedValue('String error');

      try {
        await useTodoStore.getState().toggleTodo(1);
      } catch {
        // Expected to throw
      }

      const state = useTodoStore.getState();
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Failed to toggle todo');
    });
  });

  describe('error handling with non-Error objects', () => {
    it('should handle non-Error objects in loadTodos', async () => {
      mockTodoQueryService.getAllTodos = vi.fn().mockRejectedValue('String error');
      
      await useTodoStore.getState().loadTodos();
      
      const state = useTodoStore.getState();
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Failed to load todos');
    });

    it('should handle non-Error objects in createTodo', async () => {
      mockTodoCommandService.createTodo = vi.fn().mockRejectedValue('String error');
      
      try {
        await useTodoStore.getState().createTodo({ title: 'New Todo' });
      } catch {
        // Expected to throw
      }
      
      const state = useTodoStore.getState();
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Failed to create todo');
    });

    it('should handle non-Error objects in updateTodo', async () => {
      useTodoStore.setState({
        todos: [new Todo('Test Todo', false, new Date(), 1)],
        status: 'idle',
        error: null,
      });

      mockTodoCommandService.updateTodo = vi.fn().mockRejectedValue('String error');
      
      try {
        await useTodoStore.getState().updateTodo(1, { completed: true });
      } catch {
        // Expected to throw
      }
      
      const state = useTodoStore.getState();
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Failed to update todo');
    });

    it('should handle non-Error objects in deleteTodo', async () => {
      useTodoStore.setState({
        todos: [new Todo('Test Todo', false, new Date(), 1)],
        status: 'idle',
        error: null,
      });

      mockTodoCommandService.deleteTodo = vi.fn().mockRejectedValue('String error');
      
      try {
        await useTodoStore.getState().deleteTodo(1);
      } catch {
        // Expected to throw
      }
      
      const state = useTodoStore.getState();
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Failed to delete todo');
    });
  });

  describe('edge cases for updateTodo and deleteTodo', () => {
    it('should handle updateTodo when todo is not found', async () => {
      const updatedTodo = new Todo('Updated Todo', true, new Date(), 999);
      mockTodoCommandService.updateTodo = vi.fn().mockResolvedValue(updatedTodo);

      useTodoStore.setState({
        todos: [new Todo('Test Todo', false, new Date(), 1)],
        status: 'idle',
        error: null,
      });

      await useTodoStore.getState().updateTodo(999, { completed: true });

      const state = useTodoStore.getState();
      expect(state.status).toBe('succeeded');
      expect(state.todos.find(todo => todo.id === 999)).toBeUndefined();
    });

    it('should handle clearError when status is not failed', () => {
      useTodoStore.setState({
        status: 'succeeded',
        error: 'Some error',
      });

      useTodoStore.getState().clearError();

      const state = useTodoStore.getState();
      expect(state.error).toBeNull();
      expect(state.status).toBe('succeeded'); // Should remain unchanged
    });
  });

  describe('updateTodo edge cases to achieve 100% branch coverage', () => {
    beforeEach(() => {
      const testTodo = new Todo('Test Todo', false, new Date(), 1, 'medium');
      useTodoStore.setState({
        todos: [testTodo],
        status: 'idle',
        error: null,
      });
    });

    it('should handle updateTodo with undefined title, priority, and dueDate (missing branch coverage)', async () => {
      // This test covers the missing branches in lines 110-115 where title, priority, and dueDate are undefined
      const originalTodo = useTodoStore.getState().todos[0];
      const updatedTodo = new Todo('Test Todo', true, originalTodo.createdAt, 1, 'medium');
      
      mockTodoCommandService.updateTodo = vi.fn().mockResolvedValue(updatedTodo);
      
      // Only update completed field, leaving title, priority, and dueDate undefined
      await useTodoStore.getState().updateTodo(1, { completed: true });
      
      const state = useTodoStore.getState();
      expect(state.status).toBe('succeeded');
      expect(state.todos[0].completed).toBe(true);
      expect(state.todos[0].titleValue).toBe(originalTodo.titleValue); // Should use fallback
      expect(state.todos[0].priority.level).toBe(originalTodo.priority.level); // Should use fallback
      expect(state.error).toBeNull();
    });

    it('should handle updateTodo with partial updates (testing all undefined branches)', async () => {
      const originalTodo = useTodoStore.getState().todos[0];
      const updatedTodo = new Todo('Updated Title', false, originalTodo.createdAt, 1, 'high', new Date());
      
      mockTodoCommandService.updateTodo = vi.fn().mockResolvedValue(updatedTodo);
      
      // Test case where only title is provided, completed and priority are undefined
      await useTodoStore.getState().updateTodo(1, { title: 'Updated Title' });
      
      // Verify the fallback logic worked during optimistic update
      const state = useTodoStore.getState();
      expect(state.status).toBe('succeeded');
      expect(mockTodoCommandService.updateTodo).toHaveBeenCalledWith(1, { title: 'Updated Title' });
    });

    it('should handle updateTodo with dueDate undefined to cover remaining branch (line 115)', async () => {
      // Set up a todo with an existing dueDate
      const existingDueDate = new Date('2024-12-31');
      const testTodo = new Todo('Test Todo', false, new Date(), 1, 'medium', existingDueDate);
      useTodoStore.setState({
        todos: [testTodo],
        status: 'idle',
        error: null,
      });

      const originalTodo = useTodoStore.getState().todos[0];
      const updatedTodo = new Todo('Test Todo', true, originalTodo.createdAt, 1, 'medium', existingDueDate);
      
      mockTodoCommandService.updateTodo = vi.fn().mockResolvedValue(updatedTodo);
      
      // Explicitly test both branches of the dueDate condition (line 115) 
      // First, test with dueDate explicitly undefined
      await useTodoStore.getState().updateTodo(1, { 
        completed: true, 
        dueDate: undefined  // This should trigger the fallback: currentTodo.dueDate
      });
      
      const state = useTodoStore.getState();
      expect(state.status).toBe('succeeded');
      expect(state.todos[0].completed).toBe(true);
      expect(state.todos[0].dueDate).toBe(existingDueDate); // Should preserve original dueDate
      expect(state.error).toBeNull();
    });

    it('should handle updateTodo with dueDate provided (covering the other branch of line 115)', async () => {
      const existingDueDate = new Date('2024-12-31');
      const newDueDate = new Date('2025-01-15');
      const testTodo = new Todo('Test Todo', false, new Date(), 1, 'medium', existingDueDate);
      
      useTodoStore.setState({
        todos: [testTodo],
        status: 'idle',
        error: null,
      });

      const originalTodo = useTodoStore.getState().todos[0];
      const updatedTodo = new Todo('Test Todo', true, originalTodo.createdAt, 1, 'medium', newDueDate);
      
      mockTodoCommandService.updateTodo = vi.fn().mockResolvedValue(updatedTodo);
      
      // Test with dueDate provided (not undefined) - this should use the provided value
      await useTodoStore.getState().updateTodo(1, { 
        completed: true, 
        dueDate: newDueDate  // This should use the new date, not the fallback
      });
      
      const state = useTodoStore.getState();
      expect(state.status).toBe('succeeded');
      expect(state.todos[0].completed).toBe(true);
      expect(state.todos[0].dueDate).toBe(newDueDate); // Should use the new dueDate
      expect(state.error).toBeNull();
    });
  });

  describe('CQRS pattern validation', () => {
    it('should use separate command and query services following CQRS principles', async () => {
      const mockTodos = [new Todo('Test Todo', false, new Date(), 1)];
      const mockTodo = new Todo('New Todo', false, new Date(), 2);
      
      // Test that query operations use query service
      mockTodoQueryService.getAllTodos = vi.fn().mockResolvedValue(mockTodos);
      await useTodoStore.getState().loadTodos();
      expect(mockTodoQueryService.getAllTodos).toHaveBeenCalled();
      
      // Test that command operations use command service
      mockTodoCommandService.createTodo = vi.fn().mockResolvedValue(mockTodo);
      await useTodoStore.getState().createTodo({ title: 'New Todo' });
      expect(mockTodoCommandService.createTodo).toHaveBeenCalledWith({ title: 'New Todo' });
      
      // Verify services are called independently
      expect(mockTodoQueryService.getAllTodos).toHaveBeenCalledTimes(1);
      expect(mockTodoCommandService.createTodo).toHaveBeenCalledTimes(1);
    });
  });

  describe('optimistic updates comprehensive coverage', () => {
    beforeEach(() => {
      const todos = [
        new Todo('Test Todo 1', false, new Date(), 1, 'low'),
        new Todo('Test Todo 2', true, new Date(), 2, 'high'),
      ];
      useTodoStore.setState({
        todos,
        status: 'idle',
        error: null,
      });
    });

    it('should create deep copies for optimistic updates in updateTodo', async () => {
      const originalTodos = useTodoStore.getState().todos;
      const updatedTodo = new Todo('Updated', true, new Date(), 1, 'medium');
      
      mockTodoCommandService.updateTodo = vi.fn().mockRejectedValue(new Error('Update failed'));
      
      try {
        await useTodoStore.getState().updateTodo(1, { title: 'Updated', completed: true, priority: 'medium' });
      } catch {
        // Expected to fail
      }
      
      const finalState = useTodoStore.getState();
      // Verify original todos are restored
      expect(finalState.todos).toHaveLength(2);
      expect(finalState.todos[0].titleValue).toBe(originalTodos[0].titleValue);
      expect(finalState.todos[0].completed).toBe(originalTodos[0].completed);
    });

    it('should create deep copies for optimistic updates in deleteTodo', async () => {
      const originalLength = useTodoStore.getState().todos.length;
      
      mockTodoCommandService.deleteTodo = vi.fn().mockRejectedValue(new Error('Delete failed'));
      
      try {
        await useTodoStore.getState().deleteTodo(1);
      } catch {
        // Expected to fail
      }
      
      const finalState = useTodoStore.getState();
      // Verify todos are restored
      expect(finalState.todos).toHaveLength(originalLength);
      expect(finalState.status).toBe('failed');
    });

    it('should create deep copies for optimistic updates in toggleTodo', async () => {
      const originalCompleted = useTodoStore.getState().todos[0].completed;
      
      mockTodoCommandService.toggleTodo = vi.fn().mockRejectedValue(new Error('Toggle failed'));
      
      try {
        await useTodoStore.getState().toggleTodo(1);
      } catch {
        // Expected to fail
      }
      
      const finalState = useTodoStore.getState();
      // Verify original state is restored
      expect(finalState.todos[0].completed).toBe(originalCompleted);
      expect(finalState.status).toBe('failed');
    });
  });
});