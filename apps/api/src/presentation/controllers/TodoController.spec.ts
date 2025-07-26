import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodoController } from './TodoController';
import { ApiResponseBuilder } from '../dto/ApiResponse';

// Mock all the use cases and dependencies
const mockCreateTodoUseCase = {
  execute: vi.fn(),
};

const mockUpdateTodoUseCase = {
  execute: vi.fn(),
};

const mockDeleteTodoUseCase = {
  execute: vi.fn(),
};

const mockToggleTodoUseCase = {
  execute: vi.fn(),
};

const mockGetAllTodosQueryHandler = {
  execute: vi.fn(),
};

const mockGetActiveTodosQueryHandler = {
  execute: vi.fn(),
};

const mockGetCompletedTodosQueryHandler = {
  execute: vi.fn(),
};

const mockGetTodoByIdQueryHandler = {
  execute: vi.fn(),
};

const mockGetTodoStatsQueryHandler = {
  execute: vi.fn(),
};

const mockValidationService = {
  validateCreateCommand: vi.fn(),
  validateUpdateCommand: vi.fn(),
  validateToggleCommand: vi.fn(),
  validateDeleteCommand: vi.fn(),
};

// Mock the TodoMapper
vi.mock('@nx-starter/application-shared', async () => {
  const actual = await vi.importActual('@nx-starter/application-shared');
  return {
    ...actual,
    TodoMapper: {
      toDto: vi.fn((todo) => ({
        id: todo.id,
        title: todo.titleValue,
        completed: todo.completed,
        createdAt: todo.createdAt?.toISOString(),
        priority: todo.priority?.level,
        dueDate: todo.dueDate?.toISOString(),
      })),
      toDtoArray: vi.fn((todos) => 
        todos.map((todo: any) => ({
          id: todo.id,
          title: todo.titleValue,
          completed: todo.completed,
          createdAt: todo.createdAt?.toISOString(),
          priority: todo.priority?.level,
          dueDate: todo.dueDate?.toISOString(),
        }))
      ),
    },
    TodoIdSchema: {
      parse: vi.fn((id) => {
        if (id === 'invalid-id-format') {
          throw new Error('Invalid ID format');
        }
        return id;
      }),
    },
  };
});

describe('TodoController', () => {
  let controller: TodoController;
  let mockTodos: any[];
  let mockTodo: any;
  let mockStats: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create controller instance with mocked dependencies
    controller = new TodoController(
      mockCreateTodoUseCase as any,
      mockUpdateTodoUseCase as any,
      mockDeleteTodoUseCase as any,
      mockToggleTodoUseCase as any,
      mockGetAllTodosQueryHandler as any,
      mockGetActiveTodosQueryHandler as any,
      mockGetCompletedTodosQueryHandler as any,
      mockGetTodoByIdQueryHandler as any,
      mockGetTodoStatsQueryHandler as any,
      mockValidationService as any
    );

    // Setup mock data
    mockTodo = {
      id: '1',
      titleValue: 'Test Todo',
      completed: false,
      createdAt: new Date('2023-01-01'),
      priority: { level: 'high' },
      dueDate: new Date('2023-12-31'),
    };

    mockTodos = [
      mockTodo,
      {
        id: '2',
        titleValue: 'Another Todo',
        completed: true,
        createdAt: new Date('2023-01-02'),
        priority: { level: 'low' },
        dueDate: undefined, // Use undefined instead of null
      },
    ];

    mockStats = {
      total: 10,
      active: 6,
      completed: 4,
    };
  });

  describe('getAllTodos', () => {
    it('should return all todos', async () => {
      mockGetAllTodosQueryHandler.execute.mockResolvedValue(mockTodos);

      const result = await controller.getAllTodos();

      expect(mockGetAllTodosQueryHandler.execute).toHaveBeenCalledWith();
      expect(result).toEqual(
        ApiResponseBuilder.success([
          {
            id: '1',
            title: 'Test Todo',
            completed: false,
            createdAt: '2023-01-01T00:00:00.000Z',
            priority: 'high',
            dueDate: '2023-12-31T00:00:00.000Z',
          },
          {
            id: '2',
            title: 'Another Todo',
            completed: true,
            createdAt: '2023-01-02T00:00:00.000Z',
            priority: 'low',
            dueDate: undefined,
          },
        ])
      );
    });

    it('should return empty array when no todos exist', async () => {
      mockGetAllTodosQueryHandler.execute.mockResolvedValue([]);

      const result = await controller.getAllTodos();

      expect(result).toEqual(ApiResponseBuilder.success([]));
    });

    it('should handle errors from query handler', async () => {
      const error = new Error('Database error');
      mockGetAllTodosQueryHandler.execute.mockRejectedValue(error);

      await expect(controller.getAllTodos()).rejects.toThrow('Database error');
    });
  });

  describe('getActiveTodos', () => {
    it('should return only active todos', async () => {
      const activeTodos = [mockTodos[0]]; // Only the first todo (not completed)
      mockGetActiveTodosQueryHandler.execute.mockResolvedValue(activeTodos);

      const result = await controller.getActiveTodos();

      expect(mockGetActiveTodosQueryHandler.execute).toHaveBeenCalledWith();
      expect(result).toEqual(
        ApiResponseBuilder.success([
          {
            id: '1',
            title: 'Test Todo',
            completed: false,
            createdAt: '2023-01-01T00:00:00.000Z',
            priority: 'high',
            dueDate: '2023-12-31T00:00:00.000Z',
          },
        ])
      );
    });
  });

  describe('getCompletedTodos', () => {
    it('should return only completed todos', async () => {
      const completedTodos = [mockTodos[1]]; // Only the second todo (completed)
      mockGetCompletedTodosQueryHandler.execute.mockResolvedValue(completedTodos);

      const result = await controller.getCompletedTodos();

      expect(mockGetCompletedTodosQueryHandler.execute).toHaveBeenCalledWith();
      expect(result).toEqual(
        ApiResponseBuilder.success([
          {
            id: '2',
            title: 'Another Todo',
            completed: true,
            createdAt: '2023-01-02T00:00:00.000Z',
            priority: 'low',
            dueDate: undefined,
          },
        ])
      );
    });
  });

  describe('getTodoById', () => {
    it('should return a specific todo by id', async () => {
      const id = '1';
      mockGetTodoByIdQueryHandler.execute.mockResolvedValue(mockTodo);

      const result = await controller.getTodoById(id);

      expect(mockGetTodoByIdQueryHandler.execute).toHaveBeenCalledWith({ id });
      expect(result).toEqual(
        ApiResponseBuilder.success({
          id: '1',
          title: 'Test Todo',
          completed: false,
          createdAt: '2023-01-01T00:00:00.000Z',
          priority: 'high',
          dueDate: '2023-12-31T00:00:00.000Z',
        })
      );
    });

    it('should handle non-existent todo', async () => {
      const id = 'non-existent';
      const error = new Error('Todo not found');
      mockGetTodoByIdQueryHandler.execute.mockRejectedValue(error);

      await expect(controller.getTodoById(id)).rejects.toThrow('Todo not found');
    });

    it('should handle invalid id format', async () => {
      const invalidId = 'invalid-id-format';
      
      // This will throw when TodoIdSchema.parse fails
      await expect(controller.getTodoById(invalidId)).rejects.toThrow();
    });
  });

  describe('getTodoStats', () => {
    it('should return todo statistics', async () => {
      mockGetTodoStatsQueryHandler.execute.mockResolvedValue(mockStats);

      const result = await controller.getTodoStats();

      expect(mockGetTodoStatsQueryHandler.execute).toHaveBeenCalledWith();
      expect(result).toEqual(ApiResponseBuilder.success(mockStats));
    });

    it('should handle zero stats', async () => {
      const zeroStats = { total: 0, active: 0, completed: 0 };
      mockGetTodoStatsQueryHandler.execute.mockResolvedValue(zeroStats);

      const result = await controller.getTodoStats();

      expect(result).toEqual(ApiResponseBuilder.success(zeroStats));
    });
  });

  describe('createTodo', () => {
    it('should create a new todo', async () => {
      const createData = { title: 'New Todo', priority: 'high' };
      const validatedData = { ...createData };
      const createdTodo = { ...mockTodo, id: '3', titleValue: 'New Todo' };

      mockValidationService.validateCreateCommand.mockReturnValue(validatedData);
      mockCreateTodoUseCase.execute.mockResolvedValue(createdTodo);

      const result = await controller.createTodo(createData);

      expect(mockValidationService.validateCreateCommand).toHaveBeenCalledWith(createData);
      expect(mockCreateTodoUseCase.execute).toHaveBeenCalledWith(validatedData);
      expect(result).toEqual(
        ApiResponseBuilder.success({
          id: '3',
          title: 'New Todo',
          completed: false,
          createdAt: '2023-01-01T00:00:00.000Z',
          priority: 'high',
          dueDate: '2023-12-31T00:00:00.000Z',
        })
      );
    });

    it('should handle validation errors', async () => {
      const createData = { title: '' }; // Invalid data
      const validationError = new Error('Title is required');

      mockValidationService.validateCreateCommand.mockImplementation(() => {
        throw validationError;
      });

      await expect(controller.createTodo(createData)).rejects.toThrow('Title is required');
      expect(mockCreateTodoUseCase.execute).not.toHaveBeenCalled();
    });

    it('should handle use case errors', async () => {
      const createData = { title: 'New Todo' };
      const validatedData = { ...createData };
      const useCaseError = new Error('Failed to create todo');

      mockValidationService.validateCreateCommand.mockReturnValue(validatedData);
      mockCreateTodoUseCase.execute.mockRejectedValue(useCaseError);

      await expect(controller.createTodo(createData)).rejects.toThrow('Failed to create todo');
    });
  });

  describe('updateTodo', () => {
    it('should update an existing todo', async () => {
      const id = '1';
      const updateData = { title: 'Updated Todo', completed: true };
      const validatedData = { ...updateData, id };

      mockValidationService.validateUpdateCommand.mockReturnValue(validatedData);
      mockUpdateTodoUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.updateTodo(id, updateData);

      expect(mockValidationService.validateUpdateCommand).toHaveBeenCalledWith({
        ...updateData,
        id,
      });
      expect(mockUpdateTodoUseCase.execute).toHaveBeenCalledWith(validatedData);
      expect(result).toEqual(ApiResponseBuilder.successWithMessage('Todo updated successfully'));
    });

    it('should handle validation errors for update', async () => {
      const id = '1';
      const updateData = { title: '' }; // Invalid data
      const validationError = new Error('Title cannot be empty');

      mockValidationService.validateUpdateCommand.mockImplementation(() => {
        throw validationError;
      });

      await expect(controller.updateTodo(id, updateData)).rejects.toThrow('Title cannot be empty');
      expect(mockUpdateTodoUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe('toggleTodo', () => {
    it('should toggle todo completion status', async () => {
      const id = '1';
      const validatedData = { id };

      mockValidationService.validateToggleCommand.mockReturnValue(validatedData);
      mockToggleTodoUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.toggleTodo(id);

      expect(mockValidationService.validateToggleCommand).toHaveBeenCalledWith({ id });
      expect(mockToggleTodoUseCase.execute).toHaveBeenCalledWith(validatedData);
      expect(result).toEqual(ApiResponseBuilder.successWithMessage('Todo toggled successfully'));
    });

    it('should handle invalid id for toggle', async () => {
      const id = 'invalid-id';
      const validationError = new Error('Invalid todo ID');

      mockValidationService.validateToggleCommand.mockImplementation(() => {
        throw validationError;
      });

      await expect(controller.toggleTodo(id)).rejects.toThrow('Invalid todo ID');
      expect(mockToggleTodoUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe('deleteTodo', () => {
    it('should delete an existing todo', async () => {
      const id = '1';
      const validatedData = { id };

      mockValidationService.validateDeleteCommand.mockReturnValue(validatedData);
      mockDeleteTodoUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.deleteTodo(id);

      expect(mockValidationService.validateDeleteCommand).toHaveBeenCalledWith({ id });
      expect(mockDeleteTodoUseCase.execute).toHaveBeenCalledWith(validatedData);
      expect(result).toEqual(ApiResponseBuilder.successWithMessage('Todo deleted successfully'));
    });

    it('should handle non-existent todo for deletion', async () => {
      const id = 'non-existent';
      const useCaseError = new Error('Todo not found');

      mockValidationService.validateDeleteCommand.mockReturnValue({ id });
      mockDeleteTodoUseCase.execute.mockRejectedValue(useCaseError);

      await expect(controller.deleteTodo(id)).rejects.toThrow('Todo not found');
    });
  });

  describe('edge cases', () => {
    it('should handle undefined parameters gracefully', async () => {
      const validationError = new Error('ID is required');
      mockValidationService.validateToggleCommand.mockImplementation(() => {
        throw validationError;
      });

      await expect(controller.toggleTodo(undefined as any)).rejects.toThrow('ID is required');
    });

    it('should handle null response from use cases', async () => {
      mockGetAllTodosQueryHandler.execute.mockResolvedValue(null);

      // Should handle null gracefully
      await expect(controller.getAllTodos()).rejects.toThrow();
    });
  });
});