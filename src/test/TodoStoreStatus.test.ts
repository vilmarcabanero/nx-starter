import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTodoStore } from '../core/application/stores/TodoStore';
import { configureDI, container } from '../core/infrastructure/di/container';
import type { ITodoService } from '../core/application/interfaces/ITodoService';
import { Todo } from '../core/domain/entities/Todo';

// Mock the dependencies
const mockTodoService: ITodoService = {
  getAllTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
  toggleTodo: vi.fn(),
  getActiveTodos: vi.fn(),
  getCompletedTodos: vi.fn(),
  getTodoStats: vi.fn(),
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
    
    // Override the resolved service with our mock
    vi.spyOn(container, 'resolve').mockReturnValue(mockTodoService);
    
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
      
      mockTodoService.getAllTodos = vi.fn().mockReturnValue(promise);
      
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
      mockTodoService.getAllTodos = vi.fn().mockRejectedValue(new Error(errorMessage));
      
      await useTodoStore.getState().loadTodos();
      
      const state = useTodoStore.getState();
      expect(state.status).toBe('failed');
      expect(state.getHasError()).toBe(true);
      expect(state.error).toBe(errorMessage);
      expect(state.getIsLoading()).toBe(false);
    });
  });

  describe('createTodo status management', () => {
    it('should set loading status when createTodo starts', async () => {
      const mockTodo = new Todo('New Todo', false, new Date(), 1);
      
      let resolvePromise: (value: Todo) => void = () => {};
      const promise = new Promise<Todo>((resolve) => {
        resolvePromise = resolve;
      });
      
      mockTodoService.createTodo = vi.fn().mockReturnValue(promise);
      
      // Start the async operation
      const createPromise = useTodoStore.getState().createTodo({ title: 'New Todo' });
      
      // Check that status is loading
      expect(useTodoStore.getState().status).toBe('loading');
      expect(useTodoStore.getState().getIsLoading()).toBe(true);
      expect(useTodoStore.getState().error).toBeNull();
      
      // Resolve the promise
      resolvePromise(mockTodo);
      await createPromise;
      
      // Check that status is succeeded
      const finalState = useTodoStore.getState();
      expect(finalState.status).toBe('succeeded');
      expect(finalState.getIsLoading()).toBe(false);
      expect(finalState.todos).toContain(mockTodo);
    });

    it('should set failed status when createTodo fails', async () => {
      const errorMessage = 'Failed to create todo';
      mockTodoService.createTodo = vi.fn().mockRejectedValue(new Error(errorMessage));
      
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
    it('should set loading status when updateTodo starts', async () => {
      const mockTodo = new Todo('Updated Todo', true, new Date(), 1);
      
      // Set initial state with a todo
      useTodoStore.setState({
        todos: [new Todo('Test Todo', false, new Date(), 1)],
        status: 'idle',
        error: null,
      });
      
      let resolvePromise: (value: Todo) => void = () => {};
      const promise = new Promise<Todo>((resolve) => {
        resolvePromise = resolve;
      });
      
      mockTodoService.updateTodo = vi.fn().mockReturnValue(promise);
      
      // Start the async operation
      const updatePromise = useTodoStore.getState().updateTodo(1, { completed: true });
      
      // Check that status is loading
      expect(useTodoStore.getState().status).toBe('loading');
      expect(useTodoStore.getState().getIsLoading()).toBe(true);
      expect(useTodoStore.getState().error).toBeNull();
      
      // Resolve the promise
      resolvePromise(mockTodo);
      await updatePromise;
      
      // Check that status is succeeded
      const finalState = useTodoStore.getState();
      expect(finalState.status).toBe('succeeded');
      expect(finalState.getIsLoading()).toBe(false);
      expect(finalState.todos[0].completed).toBe(true);
    });

    it('should set failed status when updateTodo fails', async () => {
      const errorMessage = 'Failed to update todo';
      mockTodoService.updateTodo = vi.fn().mockRejectedValue(new Error(errorMessage));
      
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
    it('should set loading status when deleteTodo starts', async () => {
      // Set initial state with a todo
      useTodoStore.setState({
        todos: [new Todo('Test Todo', false, new Date(), 1)],
        status: 'idle',
        error: null,
      });
      
      let resolvePromise: (value: void) => void = () => {};
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      
      mockTodoService.deleteTodo = vi.fn().mockReturnValue(promise);
      
      // Start the async operation
      const deletePromise = useTodoStore.getState().deleteTodo(1);
      
      // Check that status is loading
      expect(useTodoStore.getState().status).toBe('loading');
      expect(useTodoStore.getState().getIsLoading()).toBe(true);
      expect(useTodoStore.getState().error).toBeNull();
      
      // Resolve the promise
      resolvePromise();
      await deletePromise;
      
      // Check that status is succeeded
      const finalState = useTodoStore.getState();
      expect(finalState.status).toBe('succeeded');
      expect(finalState.getIsLoading()).toBe(false);
      expect(finalState.todos).toHaveLength(0);
    });

    it('should set failed status when deleteTodo fails', async () => {
      const errorMessage = 'Failed to delete todo';
      mockTodoService.deleteTodo = vi.fn().mockRejectedValue(new Error(errorMessage));
      
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
      mockTodoService.toggleTodo = vi.fn().mockResolvedValue(updatedTodo);

      await useTodoStore.getState().toggleTodo(1);

      const state = useTodoStore.getState();
      expect(state.status).toBe('succeeded');
      expect(state.todos[0].completed).toBe(true);
      expect(mockTodoService.toggleTodo).toHaveBeenCalledWith(1);
    });

    it('should handle toggle todo failure with error revert', async () => {
      const errorMessage = 'Failed to toggle todo';
      mockTodoService.toggleTodo = vi.fn().mockRejectedValue(new Error(errorMessage));
      
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
      mockTodoService.toggleTodo = vi.fn().mockResolvedValue(updatedTodo);

      await useTodoStore.getState().toggleTodo(999);

      const state = useTodoStore.getState();
      expect(state.status).toBe('succeeded');
      // Todo should not be found and not updated
      expect(state.todos.find(todo => todo.id === 999)).toBeUndefined();
    });

    it('should handle non-Error objects in catch block', async () => {
      mockTodoService.toggleTodo = vi.fn().mockRejectedValue('String error');

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
      mockTodoService.getAllTodos = vi.fn().mockRejectedValue('String error');
      
      await useTodoStore.getState().loadTodos();
      
      const state = useTodoStore.getState();
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Failed to load todos');
    });

    it('should handle non-Error objects in createTodo', async () => {
      mockTodoService.createTodo = vi.fn().mockRejectedValue('String error');
      
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

      mockTodoService.updateTodo = vi.fn().mockRejectedValue('String error');
      
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

      mockTodoService.deleteTodo = vi.fn().mockRejectedValue('String error');
      
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
      mockTodoService.updateTodo = vi.fn().mockResolvedValue(updatedTodo);

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
});