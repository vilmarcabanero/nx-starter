import 'reflect-metadata';
import { describe, it, expect } from 'vitest';
import { ToggleTodoUseCase } from './ToggleTodoUseCase';
import { InMemoryTodoRepository } from '@/core/infrastructure/todo/persistence/InMemoryTodoRepository';
import { Todo } from '@/core/domain/todo/entities/Todo';

describe('ToggleTodoUseCase', () => {
  it('should toggle active todo to completed', async () => {
    const repository = new InMemoryTodoRepository();
    const useCase = new ToggleTodoUseCase(repository);

    // Create an active todo
    const activeTodo = new Todo('Active Todo', false, new Date(), 'test-id', 'medium');
    await repository.create(activeTodo);

    // Toggle the todo
    const toggledTodo = await useCase.execute('test-id');

    // Verify the todo is now completed
    expect(toggledTodo.completed).toBe(true);
    expect(toggledTodo.titleValue).toBe('Active Todo');
    expect(toggledTodo.stringId).toBe('test-id');

    // Verify in repository
    const updatedTodo = await repository.getById('test-id');
    expect(updatedTodo!.completed).toBe(true);
  });

  it('should toggle completed todo to active', async () => {
    const repository = new InMemoryTodoRepository();
    const useCase = new ToggleTodoUseCase(repository);

    // Create a completed todo
    const completedTodo = new Todo('Completed Todo', true, new Date(), 'test-id', 'high');
    await repository.create(completedTodo);

    // Toggle the todo
    const toggledTodo = await useCase.execute('test-id');

    // Verify the todo is now active
    expect(toggledTodo.completed).toBe(false);
    expect(toggledTodo.titleValue).toBe('Completed Todo');
    expect(toggledTodo.priority.level).toBe('high');

    // Verify in repository
    const updatedTodo = await repository.getById('test-id');
    expect(updatedTodo!.completed).toBe(false);
  });

  it('should throw error when toggling non-existent todo', async () => {
    const repository = new InMemoryTodoRepository();
    const useCase = new ToggleTodoUseCase(repository);

    await expect(useCase.execute('non-existent-id'))
      .rejects
      .toThrow('Todo with ID non-existent-id not found');
  });

  it('should preserve all other properties when toggling', async () => {
    const repository = new InMemoryTodoRepository();
    const useCase = new ToggleTodoUseCase(repository);

    const createdAt = new Date('2020-01-01');
    const dueDate = new Date('2020-12-31');
    const originalTodo = new Todo('Test Todo', false, createdAt, 'test-id', 'low', dueDate);
    await repository.create(originalTodo);

    const toggledTodo = await useCase.execute('test-id');

    // Verify other properties are preserved
    expect(toggledTodo.titleValue).toBe('Test Todo');
    expect(toggledTodo.priority.level).toBe('low');
    expect(toggledTodo.createdAt).toEqual(createdAt);
    expect(toggledTodo.dueDate).toEqual(dueDate);
    expect(toggledTodo.stringId).toBe('test-id');
    // Only completion status should change
    expect(toggledTodo.completed).toBe(true);
  });

  it('should work with multiple sequential toggles', async () => {
    const repository = new InMemoryTodoRepository();
    const useCase = new ToggleTodoUseCase(repository);

    const todo = new Todo('Toggle Test', false, new Date(), 'test-id', 'medium');
    await repository.create(todo);

    // First toggle: false -> true
    const firstToggle = await useCase.execute('test-id');
    expect(firstToggle.completed).toBe(true);

    // Second toggle: true -> false
    const secondToggle = await useCase.execute('test-id');
    expect(secondToggle.completed).toBe(false);

    // Third toggle: false -> true
    const thirdToggle = await useCase.execute('test-id');
    expect(thirdToggle.completed).toBe(true);
  });
});