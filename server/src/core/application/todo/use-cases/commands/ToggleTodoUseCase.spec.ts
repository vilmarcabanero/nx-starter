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
    const activeTodo = new Todo('Active Todo', false, new Date(), undefined, 'medium');
    const createdId = await repository.create(activeTodo);

    // Toggle the todo
    const toggledTodo = await useCase.execute({ id: createdId });

    // Verify the todo is now completed
    expect(toggledTodo.completed).toBe(true);
    expect(toggledTodo.titleValue).toBe('Active Todo');

    // Verify in repository
    const updatedTodo = await repository.getById(createdId);
    expect(updatedTodo!.completed).toBe(true);
  });

  it('should toggle completed todo to active', async () => {
    const repository = new InMemoryTodoRepository();
    const useCase = new ToggleTodoUseCase(repository);

    // Create a completed todo
    const completedTodo = new Todo('Completed Todo', true, new Date(), undefined, 'high');
    const createdId = await repository.create(completedTodo);

    // Toggle the todo
    const toggledTodo = await useCase.execute({ id: createdId });

    // Verify the todo is now active
    expect(toggledTodo.completed).toBe(false);
    expect(toggledTodo.titleValue).toBe('Completed Todo');
    expect(toggledTodo.priority.level).toBe('high');

    // Verify in repository
    const updatedTodo = await repository.getById(createdId);
    expect(updatedTodo!.completed).toBe(false);
  });

  it('should throw error when toggling non-existent todo', async () => {
    const repository = new InMemoryTodoRepository();
    const useCase = new ToggleTodoUseCase(repository);

    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow(
      'Todo with ID non-existent-id not found'
    );
  });

  it('should preserve all other properties when toggling', async () => {
    const repository = new InMemoryTodoRepository();
    const useCase = new ToggleTodoUseCase(repository);

    const createdAt = new Date('2020-01-01');
    const dueDate = new Date('2020-12-31');
    const originalTodo = new Todo('Test Todo', false, createdAt, undefined, 'low', dueDate);
    const createdId = await repository.create(originalTodo);

    const toggledTodo = await useCase.execute({ id: createdId });

    // Verify other properties are preserved
    expect(toggledTodo.titleValue).toBe('Test Todo');
    expect(toggledTodo.priority.level).toBe('low');
    expect(toggledTodo.createdAt).toEqual(createdAt);
    expect(toggledTodo.dueDate).toEqual(dueDate);
    // Only completion status should change
    expect(toggledTodo.completed).toBe(true);
  });

  it('should work with multiple sequential toggles', async () => {
    const repository = new InMemoryTodoRepository();
    const useCase = new ToggleTodoUseCase(repository);

    const todo = new Todo('Toggle Test', false, new Date(), undefined, 'medium');
    const createdId = await repository.create(todo);

    // First toggle: false -> true
    const firstToggle = await useCase.execute({ id: createdId });
    expect(firstToggle.completed).toBe(true);

    // Second toggle: true -> false
    const secondToggle = await useCase.execute({ id: createdId });
    expect(secondToggle.completed).toBe(false);

    // Third toggle: false -> true
    const thirdToggle = await useCase.execute({ id: createdId });
    expect(thirdToggle.completed).toBe(true);
  });
});
