import 'reflect-metadata';
import { describe, it, expect, vi } from 'vitest';
import { UpdateTodoUseCase } from './UpdateTodoUseCase';
import { InMemoryTodoRepository } from '@/core/infrastructure/todo/persistence/InMemoryTodoRepository';
import { Todo } from '@/core/domain/todo/entities/Todo';

describe('UpdateTodoUseCase', () => {
  it('should update existing todo successfully', async () => {
    const repository = new InMemoryTodoRepository();
    const useCase = new UpdateTodoUseCase(repository);

    // Create a todo first
    const originalTodo = new Todo('Original Title', false, new Date(), 'test-id', 'low');
    await repository.create(originalTodo);

    // Update the todo
    await useCase.execute({
      id: 'test-id',
      title: 'Updated Title',
      priority: 'high',
      completed: true
    });

    // Verify the update
    const updatedTodo = await repository.getById('test-id');
    expect(updatedTodo).toBeDefined();
    expect(updatedTodo!.titleValue).toBe('Updated Title');
    expect(updatedTodo!.priority.level).toBe('high');
    expect(updatedTodo!.completed).toBe(true);
  });

  it('should update partial fields only', async () => {
    const repository = new InMemoryTodoRepository();
    const useCase = new UpdateTodoUseCase(repository);

    // Create a todo first
    const originalTodo = new Todo('Original Title', false, new Date(), 'test-id', 'medium');
    await repository.create(originalTodo);

    // Update only the title
    await useCase.execute({
      id: 'test-id',
      title: 'Updated Title Only'
    });

    // Verify only title was updated
    const updatedTodo = await repository.getById('test-id');
    expect(updatedTodo!.titleValue).toBe('Updated Title Only');
    expect(updatedTodo!.priority.level).toBe('medium'); // Unchanged
    expect(updatedTodo!.completed).toBe(false); // Unchanged
  });

  it('should throw error when updating non-existent todo', async () => {
    const repository = new InMemoryTodoRepository();
    const useCase = new UpdateTodoUseCase(repository);

    await expect(useCase.execute({ id: 'non-existent-id', title: 'New Title' }))
      .rejects
      .toThrow('Todo with ID non-existent-id not found');
  });

  it('should handle due date updates', async () => {
    const repository = new InMemoryTodoRepository();
    const useCase = new UpdateTodoUseCase(repository);

    const originalTodo = new Todo('Test Todo', false, new Date(), 'test-id', 'medium');
    await repository.create(originalTodo);

    const newDueDate = new Date('2025-01-01');
    await useCase.execute({
      id: 'test-id',
      dueDate: newDueDate
    });

    const updatedTodo = await repository.getById('test-id');
    expect(updatedTodo!.dueDate).toEqual(newDueDate);
  });

  it('should validate title when updating', async () => {
    const repository = new InMemoryTodoRepository();
    const useCase = new UpdateTodoUseCase(repository);

    const originalTodo = new Todo('Original Title', false, new Date(), 'test-id', 'medium');
    await repository.create(originalTodo);

    // Try to update with invalid title - this will be caught by the repository's update method
    // which creates a new Todo with the title, triggering TodoTitle validation
    await expect(useCase.execute({ id: 'test-id', title: 'A' }))
      .rejects
      .toThrow('Invalid todo title: must be at least 2 characters long');
  });
});