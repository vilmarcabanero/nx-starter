import 'reflect-metadata';
import { describe, it, expect } from 'vitest';
import { DeleteTodoUseCase } from './DeleteTodoUseCase';
import { InMemoryTodoRepository } from '@/core/infrastructure/todo/persistence/InMemoryTodoRepository';
import { Todo } from '@/core/domain/todo/entities/Todo';

describe('DeleteTodoUseCase', () => {
  it('should delete existing todo successfully', async () => {
    const repository = new InMemoryTodoRepository();
    const useCase = new DeleteTodoUseCase(repository);

    // Create a todo first
    const todo = new Todo('Test Todo', false, new Date(), 'test-id', 'medium');
    await repository.create(todo);

    // Verify todo exists
    const existingTodo = await repository.getById('test-id');
    expect(existingTodo).toBeDefined();

    // Delete the todo
    await useCase.execute('test-id');

    // Verify todo is deleted
    const deletedTodo = await repository.getById('test-id');
    expect(deletedTodo).toBeUndefined();
  });

  it('should throw error when deleting non-existent todo', async () => {
    const repository = new InMemoryTodoRepository();
    const useCase = new DeleteTodoUseCase(repository);

    await expect(useCase.execute('non-existent-id'))
      .rejects
      .toThrow('Todo with ID non-existent-id not found');
  });

  it('should handle multiple deletions', async () => {
    const repository = new InMemoryTodoRepository();
    const useCase = new DeleteTodoUseCase(repository);

    // Create multiple todos
    const todo1 = new Todo('Todo 1', false, new Date(), 'id-1', 'medium');
    const todo2 = new Todo('Todo 2', false, new Date(), 'id-2', 'high');
    const todo3 = new Todo('Todo 3', true, new Date(), 'id-3', 'low');

    await repository.create(todo1);
    await repository.create(todo2);
    await repository.create(todo3);

    // Delete one todo
    await useCase.execute('id-2');

    // Verify only the targeted todo is deleted
    const remainingTodo1 = await repository.getById('id-1');
    const deletedTodo = await repository.getById('id-2');
    const remainingTodo3 = await repository.getById('id-3');

    expect(remainingTodo1).toBeDefined();
    expect(deletedTodo).toBeUndefined();
    expect(remainingTodo3).toBeDefined();
  });

  it('should delete both active and completed todos', async () => {
    const repository = new InMemoryTodoRepository();
    const useCase = new DeleteTodoUseCase(repository);

    // Create active and completed todos
    const activeTodo = new Todo('Active Todo', false, new Date(), 'active-id', 'medium');
    const completedTodo = new Todo('Completed Todo', true, new Date(), 'completed-id', 'high');

    await repository.create(activeTodo);
    await repository.create(completedTodo);

    // Delete both
    await useCase.execute('active-id');
    await useCase.execute('completed-id');

    // Verify both are deleted
    expect(await repository.getById('active-id')).toBeUndefined();
    expect(await repository.getById('completed-id')).toBeUndefined();
  });
});