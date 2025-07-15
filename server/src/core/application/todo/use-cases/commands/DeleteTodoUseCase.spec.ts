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
    const todo = new Todo('Test Todo', false, new Date(), undefined, 'medium');
    const createdId = await repository.create(todo);

    // Verify todo exists
    const existingTodo = await repository.getById(createdId);
    expect(existingTodo).toBeDefined();

    // Delete the todo
    await useCase.execute({ id: createdId });

    // Verify todo is deleted
    const deletedTodo = await repository.getById(createdId);
    expect(deletedTodo).toBeUndefined();
  });

  it('should throw error when deleting non-existent todo', async () => {
    const repository = new InMemoryTodoRepository();
    const useCase = new DeleteTodoUseCase(repository);

    await expect(useCase.execute({ id: 'non-existent-id' }))
      .rejects
      .toThrow('Todo with ID non-existent-id not found');
  });

  it('should handle multiple deletions', async () => {
    const repository = new InMemoryTodoRepository();
    const useCase = new DeleteTodoUseCase(repository);

    // Create multiple todos
    const todo1 = new Todo('Todo 1', false, new Date(), undefined, 'medium');
    const todo2 = new Todo('Todo 2', false, new Date(), undefined, 'high');
    const todo3 = new Todo('Todo 3', true, new Date(), undefined, 'low');

    const id1 = await repository.create(todo1);
    const id2 = await repository.create(todo2);
    const id3 = await repository.create(todo3);

    // Delete one todo
    await useCase.execute({ id: id2 });

    // Verify only the targeted todo is deleted
    const remainingTodo1 = await repository.getById(id1);
    const deletedTodo = await repository.getById(id2);
    const remainingTodo3 = await repository.getById(id3);

    expect(remainingTodo1).toBeDefined();
    expect(deletedTodo).toBeUndefined();
    expect(remainingTodo3).toBeDefined();
  });

  it('should delete both active and completed todos', async () => {
    const repository = new InMemoryTodoRepository();
    const useCase = new DeleteTodoUseCase(repository);

    // Create active and completed todos
    const activeTodo = new Todo('Active Todo', false, new Date(), undefined, 'medium');
    const completedTodo = new Todo('Completed Todo', true, new Date(), undefined, 'high');

    const activeId = await repository.create(activeTodo);
    const completedId = await repository.create(completedTodo);

    // Delete both
    await useCase.execute({ id: activeId });
    await useCase.execute({ id: completedId });

    // Verify both are deleted
    expect(await repository.getById(activeId)).toBeUndefined();
    expect(await repository.getById(completedId)).toBeUndefined();
  });
});