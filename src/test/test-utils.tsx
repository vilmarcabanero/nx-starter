// Test utilities for creating mock data and test helpers
import { vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import React, { type ReactElement } from 'react';
import { Todo } from '../core/domain/entities/Todo';
import type { ITodoRepository } from '../core/domain/repositories/ITodoRepository';
import todosReducer, { type TodosState } from '../core/application/todos/slice';

// Factory function for creating mock todos
export const createMockTodo = (overrides?: Partial<Todo>): Todo => {
  return new Todo(
    overrides?.title || 'Test Todo',
    overrides?.completed || false,
    overrides?.createdAt || new Date(),
    overrides?.id || 1
  );
};

// Factory function for creating mock todos arrays
export const createMockTodos = (count: number, overrides?: Partial<Todo>[]): Todo[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockTodo({
      id: index + 1,
      title: `Todo ${index + 1}`,
      ...overrides?.[index]
    })
  );
};

// Factory function for creating fresh mock repository
export const createMockRepository = (): ITodoRepository => {
  return {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getById: vi.fn(),
    getActive: vi.fn(),
    getCompleted: vi.fn(),
  };
};

// Store factory for testing (combines Main Version pattern with CC Version isolation)
export const createTestStore = (initialState?: Partial<TodosState>) => {
  const defaultState: TodosState = {
    todos: [],
    status: 'idle',
    error: null,
    filter: 'all',
  };
  
  return configureStore({
    reducer: {
      todos: todosReducer,
    },
    preloadedState: {
      todos: { ...defaultState, ...initialState },
    },
  });
};

// React Testing Library helper for rendering with Redux store
export const renderWithRedux = (
  ui: ReactElement,
  initialState?: Partial<TodosState>
) => {
  const store = createTestStore(initialState);
  
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return <Provider store={store}>{children}</Provider>;
  };

  return {
    ...render(ui, { wrapper: AllTheProviders }),
    store,
  };
};

// Common test data sets
export const testTodos = {
  active: createMockTodos(3, [
    { completed: false, title: 'Active Todo 1' },
    { completed: false, title: 'Active Todo 2' },
    { completed: false, title: 'Active Todo 3' },
  ]),
  completed: createMockTodos(2, [
    { completed: true, title: 'Completed Todo 1' },
    { completed: true, title: 'Completed Todo 2' },
  ]),
  mixed: [
    createMockTodo({ id: 1, title: 'Active Todo', completed: false }),
    createMockTodo({ id: 2, title: 'Completed Todo', completed: true }),
    createMockTodo({ id: 3, title: 'Another Active', completed: false }),
  ],
};

// Test state presets
export const testStates = {
  initial: {
    todos: [],
    status: 'idle' as const,
    error: null,
    filter: 'all' as const,
  },
  loading: {
    todos: [],
    status: 'loading' as const,
    error: null,
    filter: 'all' as const,
  },
  withTodos: {
    todos: testTodos.mixed,
    status: 'succeeded' as const,
    error: null,
    filter: 'all' as const,
  },
  withError: {
    todos: [],
    status: 'failed' as const,
    error: 'Something went wrong',
    filter: 'all' as const,
  },
};

// Mock setup helpers
export const setupMockRepository = (mockRepo: ITodoRepository, scenario: 'success' | 'error' | 'mixed' = 'success') => {
  switch (scenario) {
    case 'success':
      vi.mocked(mockRepo.getAll).mockResolvedValue(testTodos.mixed);
      vi.mocked(mockRepo.create).mockResolvedValue(1);
      vi.mocked(mockRepo.update).mockResolvedValue();
      vi.mocked(mockRepo.delete).mockResolvedValue();
      vi.mocked(mockRepo.getById).mockResolvedValue(testTodos.mixed[0]);
      vi.mocked(mockRepo.getActive).mockResolvedValue(testTodos.active);
      vi.mocked(mockRepo.getCompleted).mockResolvedValue(testTodos.completed);
      break;
    case 'error':
      const error = new Error('Mock repository error');
      vi.mocked(mockRepo.getAll).mockRejectedValue(error);
      vi.mocked(mockRepo.create).mockRejectedValue(error);
      vi.mocked(mockRepo.update).mockRejectedValue(error);
      vi.mocked(mockRepo.delete).mockRejectedValue(error);
      vi.mocked(mockRepo.getById).mockRejectedValue(error);
      vi.mocked(mockRepo.getActive).mockRejectedValue(error);
      vi.mocked(mockRepo.getCompleted).mockRejectedValue(error);
      break;
    case 'mixed':
      // Some operations succeed, others fail
      vi.mocked(mockRepo.getAll).mockResolvedValue(testTodos.mixed);
      vi.mocked(mockRepo.create).mockResolvedValueOnce(1);
      vi.mocked(mockRepo.create).mockRejectedValueOnce(new Error('Create failed'));
      vi.mocked(mockRepo.update).mockResolvedValue();
      vi.mocked(mockRepo.delete).mockResolvedValue();
      vi.mocked(mockRepo.getById).mockResolvedValue(testTodos.mixed[0]);
      break;
  }
};

// Performance testing helper
export const measureAsync = async <T,>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return { result, duration: end - start };
};

// Wait helper for testing loading states
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0));

// Cleanup helper for tests
export const cleanupMocks = (...mocks: ReturnType<typeof vi.fn>[]) => {
  mocks.forEach(mock => mock.mockClear());
};
