// Test utilities for creating mock data and test helpers
import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { type ReactElement } from 'react';
import { Todo } from '../core/domain/entities/Todo';
import type { ITodoRepository } from '../core/domain/repositories/ITodoRepository';

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

// Custom render function for components (no Redux needed)
export const renderWithTestSetup = (ui: ReactElement) => {
  return render(ui);
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
    case 'error': {
      const error = new Error('Mock repository error');
      vi.mocked(mockRepo.getAll).mockRejectedValue(error);
      vi.mocked(mockRepo.create).mockRejectedValue(error);
      vi.mocked(mockRepo.update).mockRejectedValue(error);
      vi.mocked(mockRepo.delete).mockRejectedValue(error);
      vi.mocked(mockRepo.getById).mockRejectedValue(error);
      vi.mocked(mockRepo.getActive).mockRejectedValue(error);
      vi.mocked(mockRepo.getCompleted).mockRejectedValue(error);
      break;
    }
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
