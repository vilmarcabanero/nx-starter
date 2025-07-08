  import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import todosReducer, { type TodosState } from '../core/application/todos/slice';
import { Todo } from '../core/domain/entities/Todo';

// Mock the TodoRepository with shared mock functions (CC Version pattern)
vi.mock('../core/infrastructure/db/TodoRepository', () => {
  const mockGetAll = vi.fn();
  const mockCreate = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();
  const mockGetById = vi.fn();
  const mockGetActive = vi.fn();
  const mockGetCompleted = vi.fn();

  const mockRepo = {
    getAll: mockGetAll,
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
    getById: mockGetById,
    getActive: mockGetActive,
    getCompleted: mockGetCompleted,
  };

  return {
    TodoRepository: vi.fn().mockImplementation(() => mockRepo),
    __mockRepo: mockRepo,
  };
});

// Import thunks after mocking
import { 
  fetchTodosThunk, 
  createTodoThunk, 
  updateTodoThunk, 
  deleteTodoThunk,
  toggleTodoThunk 
} from '../core/application/todos/thunks';

// Get the mock repository - using module import pattern
const mockModule = await import('../core/infrastructure/db/TodoRepository');
const mockRepo = (mockModule as any).__mockRepo;

type AppState = {
  todos: TodosState;
};

describe('todos thunks integration', () => {
  let store: ReturnType<typeof configureStore<AppState>>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        todos: todosReducer,
      },
    });
    vi.clearAllMocks();
  });

  describe('fetchTodosThunk', () => {
    it('should fetch todos and update state', async () => {
      const mockTodos = [new Todo('Test Todo', false, new Date(), 1)];
      mockRepo.getAll.mockResolvedValue(mockTodos);

      await store.dispatch(fetchTodosThunk());

      const state = store.getState();
      expect(state.todos.todos).toEqual(mockTodos);
      expect(state.todos.status).toBe('succeeded');
    });

    it('should set loading state while fetching', async () => {
      mockRepo.getAll.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve([]), 100))
      );

      const promise = store.dispatch(fetchTodosThunk());
      
      // Check loading state
      expect(store.getState().todos.status).toBe('loading');
      
      await promise;
      
      // Check final state
      expect(store.getState().todos.status).toBe('succeeded');
    });

    it('should handle fetch errors', async () => {
      const error = new Error('Failed to fetch');
      mockRepo.getAll.mockRejectedValue(error);

      await store.dispatch(fetchTodosThunk());

      const state = store.getState();
      expect(state.todos.status).toBe('failed');
      expect(state.todos.error).toBe('Failed to fetch');
    });
  });

  describe('createTodoThunk', () => {
    it('should create a new todo and update state', async () => {
      const title = 'New Todo';
      const mockId = 1;
      mockRepo.create.mockResolvedValue(mockId);

      await store.dispatch(createTodoThunk(title));

      const state = store.getState();
      expect(state.todos.todos).toHaveLength(1);
      expect(state.todos.todos[0].title).toBe(title);
      expect(state.todos.todos[0].id).toBe(mockId);
      expect(mockRepo.create).toHaveBeenCalledOnce();
    });

    it('should handle create errors', async () => {
      const error = new Error('Failed to create');
      mockRepo.create.mockRejectedValue(error);

      await store.dispatch(createTodoThunk('New Todo'));

      const state = store.getState();
      expect(state.todos.status).toBe('failed');
      expect(state.todos.error).toBe('Failed to create');
    });
  });

  describe('updateTodoThunk', () => {
    it('should update todo and refresh state', async () => {
      const todoId = 1;
      const changes = { title: 'Updated Todo' };
      const updatedTodo = new Todo('Updated Todo', false, new Date(), todoId);
      
      // First add a todo to state
      mockRepo.create.mockResolvedValue(todoId);
      await store.dispatch(createTodoThunk('Original Todo'));
      
      // Now update it
      mockRepo.update.mockResolvedValue();
      mockRepo.getById.mockResolvedValue(updatedTodo);

      await store.dispatch(updateTodoThunk({ id: todoId, changes }));

      const state = store.getState();
      expect(state.todos.todos).toHaveLength(1);
      expect(state.todos.todos[0].title).toBe('Updated Todo');
      expect(mockRepo.update).toHaveBeenCalledWith(todoId, changes);
    });
  });

  describe('deleteTodoThunk', () => {
    it('should delete todo from state', async () => {
      // First add a todo to state
      const mockId = 1;
      mockRepo.create.mockResolvedValue(mockId);
      await store.dispatch(createTodoThunk('Todo to delete'));

      // Then delete it
      mockRepo.delete.mockResolvedValue();
      await store.dispatch(deleteTodoThunk(mockId));

      const state = store.getState();
      expect(state.todos.todos).toHaveLength(0);
      expect(mockRepo.delete).toHaveBeenCalledWith(mockId);
    });
  });

  describe('toggleTodoThunk', () => {
    it('should toggle todo completion status', async () => {
      const todoId = 1;
      const originalTodo = new Todo('Test Todo', false, new Date(), todoId);
      
      mockRepo.getById.mockResolvedValue(originalTodo);
      mockRepo.update.mockResolvedValue();

      await store.dispatch(toggleTodoThunk(todoId));

      expect(mockRepo.getById).toHaveBeenCalledWith(todoId);
      expect(mockRepo.update).toHaveBeenCalledWith(todoId, { completed: true });
    });
  });

  describe('integration workflows', () => {
    it('should handle complete todo lifecycle', async () => {
      // Test creation
      mockRepo.create.mockResolvedValue(1);
      await store.dispatch(createTodoThunk('New Todo'));
      
      // Test fetch
      const todo = new Todo('New Todo', false, new Date(), 1);
      mockRepo.getAll.mockResolvedValue([todo]);
      await store.dispatch(fetchTodosThunk());
      
      // Test toggle
      mockRepo.getById.mockResolvedValue(todo);
      mockRepo.update.mockResolvedValue();
      await store.dispatch(toggleTodoThunk(1));
      
      const state = store.getState();
      expect(state.todos.todos).toHaveLength(1);
      expect(state.todos.status).toBe('succeeded');
    });

    it('should handle concurrent operations', async () => {
      mockRepo.create.mockResolvedValueOnce(1);
      mockRepo.create.mockResolvedValueOnce(2);
      mockRepo.create.mockResolvedValueOnce(3);

      const promises = [
        store.dispatch(createTodoThunk('Todo 1')),
        store.dispatch(createTodoThunk('Todo 2')),
        store.dispatch(createTodoThunk('Todo 3')),
      ];

      await Promise.all(promises);

      const state = store.getState();
      expect(state.todos.todos).toHaveLength(3);
    });

    it('should handle mixed success and failure operations', async () => {
      // First operation succeeds
      mockRepo.create.mockResolvedValueOnce(1);
      await store.dispatch(createTodoThunk('Success Todo'));

      // Second operation fails
      mockRepo.create.mockRejectedValueOnce(new Error('Network error'));
      await store.dispatch(createTodoThunk('Fail Todo'));

      const state = store.getState();
      expect(state.todos.todos).toHaveLength(1); // Only successful todo
      expect(state.todos.status).toBe('failed'); // Last operation failed
      expect(state.todos.error).toBe('Network error');
    });
  });
});
