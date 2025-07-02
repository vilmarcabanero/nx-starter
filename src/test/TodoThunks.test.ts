import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Todo } from '../core/domain/entities/Todo';

// Create a mock instance that we can control - hoisted to ensure it's available during mocking
const mockRepositoryInstance = vi.hoisted(() => ({
  getAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  getById: vi.fn(),
  getActive: vi.fn(),
  getCompleted: vi.fn(),
}));

// Mock the TodoRepository module before importing thunks
vi.mock('../core/infrastructure/db/TodoRepository', () => ({
  TodoRepository: vi.fn().mockImplementation(() => mockRepositoryInstance),
}));

// Import thunks after mocking
import { 
  fetchTodosThunk, 
  createTodoThunk, 
  updateTodoThunk, 
  deleteTodoThunk,
  toggleTodoThunk 
} from '../core/application/todos/thunks';

describe('Todo Thunks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchTodosThunk', () => {
    it('should create correct action type', () => {
      expect(fetchTodosThunk.pending.type).toBe('todos/fetchTodos/pending');
      expect(fetchTodosThunk.fulfilled.type).toBe('todos/fetchTodos/fulfilled');
      expect(fetchTodosThunk.rejected.type).toBe('todos/fetchTodos/rejected');
    });

    it('should call repository.getAll', async () => {
      const mockTodos = [new Todo('Todo 1', false, new Date(), 1)];
      mockRepositoryInstance.getAll.mockResolvedValue(mockTodos);

      const thunk = fetchTodosThunk();
      const dispatch = vi.fn();
      const getState = vi.fn();

      await thunk(dispatch, getState, undefined);

      expect(mockRepositoryInstance.getAll).toHaveBeenCalledOnce();
    });
  });

  describe('createTodoThunk', () => {
    it('should create correct action type', () => {
      expect(createTodoThunk.pending.type).toBe('todos/createTodo/pending');
      expect(createTodoThunk.fulfilled.type).toBe('todos/createTodo/fulfilled');
      expect(createTodoThunk.rejected.type).toBe('todos/createTodo/rejected');
    });

    it('should call repository.create with new todo', async () => {
      const title = 'New Todo';
      const todoId = 1;
      mockRepositoryInstance.create.mockResolvedValue(todoId);

      const thunk = createTodoThunk(title);
      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await thunk(dispatch, getState, undefined) as { payload: Todo };

      expect(mockRepositoryInstance.create).toHaveBeenCalledOnce();
      expect(result.payload.title).toBe(title);
      expect(result.payload.id).toBe(todoId);
    });
  });

  describe('updateTodoThunk', () => {
    it('should create correct action type', () => {
      expect(updateTodoThunk.pending.type).toBe('todos/updateTodo/pending');
      expect(updateTodoThunk.fulfilled.type).toBe('todos/updateTodo/fulfilled');
      expect(updateTodoThunk.rejected.type).toBe('todos/updateTodo/rejected');
    });

    it('should call repository methods for update', async () => {
      const todoId = 1;
      const changes = { title: 'Updated Todo' };
      const updatedTodo = new Todo('Updated Todo', false, new Date(), todoId);

      mockRepositoryInstance.update.mockResolvedValue(undefined);
      mockRepositoryInstance.getById.mockResolvedValue(updatedTodo);

      const thunk = updateTodoThunk({ id: todoId, changes });
      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await thunk(dispatch, getState, undefined);

      expect(mockRepositoryInstance.update).toHaveBeenCalledWith(todoId, changes);
      expect(mockRepositoryInstance.getById).toHaveBeenCalledWith(todoId);
      expect(result.payload).toEqual(updatedTodo);
    });

    it('should throw error when todo not found after update', async () => {
      const todoId = 1;
      const changes = { title: 'Updated Todo' };

      mockRepositoryInstance.update.mockResolvedValue(undefined);
      mockRepositoryInstance.getById.mockResolvedValue(null);

      const thunk = updateTodoThunk({ id: todoId, changes });
      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await thunk(dispatch, getState, undefined);
      
      expect(result.type).toBe('todos/updateTodo/rejected');
      expect((result as { error?: { message: string } }).error?.message).toBe('Todo not found after update');
      expect(mockRepositoryInstance.update).toHaveBeenCalledWith(todoId, changes);
      expect(mockRepositoryInstance.getById).toHaveBeenCalledWith(todoId);
    });
  });

  describe('deleteTodoThunk', () => {
    it('should create correct action type', () => {
      expect(deleteTodoThunk.pending.type).toBe('todos/deleteTodo/pending');
      expect(deleteTodoThunk.fulfilled.type).toBe('todos/deleteTodo/fulfilled');
      expect(deleteTodoThunk.rejected.type).toBe('todos/deleteTodo/rejected');
    });

    it('should call repository.delete', async () => {
      const todoId = 1;
      mockRepositoryInstance.delete.mockResolvedValue(undefined);

      const thunk = deleteTodoThunk(todoId);
      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await thunk(dispatch, getState, undefined);

      expect(mockRepositoryInstance.delete).toHaveBeenCalledWith(todoId);
      expect(result.payload).toBe(todoId);
    });
  });

  describe('toggleTodoThunk', () => {
    it('should create correct action type', () => {
      expect(toggleTodoThunk.pending.type).toBe('todos/toggleTodo/pending');
      expect(toggleTodoThunk.fulfilled.type).toBe('todos/toggleTodo/fulfilled');
      expect(toggleTodoThunk.rejected.type).toBe('todos/toggleTodo/rejected');
    });

    it('should toggle todo completion status', async () => {
      const todoId = 1;
      const originalTodo = new Todo('Todo 1', false, new Date(), todoId);
      
      mockRepositoryInstance.getById.mockResolvedValue(originalTodo);
      mockRepositoryInstance.update.mockResolvedValue(undefined);

      const thunk = toggleTodoThunk(todoId);
      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await thunk(dispatch, getState, undefined) as { payload: Todo };

      expect(mockRepositoryInstance.getById).toHaveBeenCalledWith(todoId);
      expect(mockRepositoryInstance.update).toHaveBeenCalledWith(todoId, { completed: true });
      expect(result.payload.completed).toBe(true);
      expect(result.payload.id).toBe(todoId);
    });

    it('should throw error when todo not found for toggle', async () => {
      const todoId = 1;
      
      mockRepositoryInstance.getById.mockResolvedValue(null);

      const thunk = toggleTodoThunk(todoId);
      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await thunk(dispatch, getState, undefined);
      
      expect(result.type).toBe('todos/toggleTodo/rejected');
      expect((result as { error?: { message: string } }).error?.message).toBe('Todo not found');
      expect(mockRepositoryInstance.getById).toHaveBeenCalledWith(todoId);
      expect(mockRepositoryInstance.update).not.toHaveBeenCalled();
    });
  });
});
