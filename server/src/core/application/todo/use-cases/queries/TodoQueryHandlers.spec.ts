import 'reflect-metadata';
import { describe, it, expect } from 'vitest';
import { GetFilteredTodosQueryHandler } from './TodoQueryHandlers';
import { InMemoryTodoRepository } from '@/core/infrastructure/todo/persistence/InMemoryTodoRepository';
import { Todo } from '@/core/domain/todo/entities/Todo';

// Test UUIDs (32-character hex strings)
const TEST_UUIDS = {
  TODO_1: 'a1b2c3d4e5f6789012345678901234ab',
  TODO_2: 'b2c3d4e5f6789012345678901234abc1',
  TODO_3: 'c3d4e5f6789012345678901234abcd12',
} as const;

describe('GetFilteredTodosQueryHandler', () => {
  it('should filter active todos', async () => {
    const repository = new InMemoryTodoRepository();
    const handler = new GetFilteredTodosQueryHandler(repository);

    // Create test todos
    const activeTodo = new Todo('Active Todo', false, new Date(), TEST_UUIDS.TODO_1, 'medium');
    const completedTodo = new Todo('Completed Todo', true, new Date(), '2', 'medium');
    
    await repository.create(activeTodo);
    await repository.create(completedTodo);

    const result = await handler.execute({ filter: 'active' });
    
    expect(result).toHaveLength(1);
    expect(result[0].completed).toBe(false);
  });

  it('should filter completed todos', async () => {
    const repository = new InMemoryTodoRepository();
    const handler = new GetFilteredTodosQueryHandler(repository);

    // Create test todos
    const activeTodo = new Todo('Active Todo', false, new Date(), TEST_UUIDS.TODO_1, 'medium');
    const completedTodo = new Todo('Completed Todo', true, new Date(), '2', 'medium');
    
    await repository.create(activeTodo);
    await repository.create(completedTodo);

    const result = await handler.execute({ filter: 'completed' });
    
    expect(result).toHaveLength(1);
    expect(result[0].completed).toBe(true);
  });

  it('should return all todos when filter is all', async () => {
    const repository = new InMemoryTodoRepository();
    const handler = new GetFilteredTodosQueryHandler(repository);

    // Create test todos
    const activeTodo = new Todo('Active Todo', false, new Date(), TEST_UUIDS.TODO_1, 'medium');
    const completedTodo = new Todo('Completed Todo', true, new Date(), '2', 'medium');
    
    await repository.create(activeTodo);
    await repository.create(completedTodo);

    const result = await handler.execute({ filter: 'all' });
    
    expect(result).toHaveLength(2);
  });

  it('should sort by priority', async () => {
    const repository = new InMemoryTodoRepository();
    const handler = new GetFilteredTodosQueryHandler(repository);

    // Create todos with different priorities
    const lowTodo = new Todo('Low Priority', false, new Date(), TEST_UUIDS.TODO_1, 'low');
    const highTodo = new Todo('High Priority', false, new Date(), '2', 'high');
    
    await repository.create(lowTodo);
    await repository.create(highTodo);

    const result = await handler.execute({ 
      filter: 'all', 
      sortBy: 'priority', 
      sortOrder: 'asc' 
    });
    
    expect(result[0].priority.level).toBe('high');
    expect(result[1].priority.level).toBe('low');
  });

  it('should sort by createdAt', async () => {
    const repository = new InMemoryTodoRepository();
    const handler = new GetFilteredTodosQueryHandler(repository);

    // Create todos with different creation dates
    const oldTodo = new Todo('Old Todo', false, new Date('2020-01-01'), TEST_UUIDS.TODO_1, 'medium');
    const newTodo = new Todo('New Todo', false, new Date('2020-01-02'), '2', 'medium');
    
    await repository.create(oldTodo);
    await repository.create(newTodo);

    const result = await handler.execute({ 
      filter: 'all', 
      sortBy: 'createdAt', 
      sortOrder: 'asc' 
    });
    
    expect(result[0].createdAt.getTime()).toBeLessThan(result[1].createdAt.getTime());
  });

  it('should sort descending when specified', async () => {
    const repository = new InMemoryTodoRepository();
    const handler = new GetFilteredTodosQueryHandler(repository);

    // Create todos with different priorities
    const lowTodo = new Todo('Low Priority', false, new Date(), TEST_UUIDS.TODO_1, 'low');
    const highTodo = new Todo('High Priority', false, new Date(), '2', 'high');
    
    await repository.create(lowTodo);
    await repository.create(highTodo);

    const result = await handler.execute({ 
      filter: 'all', 
      sortBy: 'priority', 
      sortOrder: 'desc' 
    });
    
    expect(result[0].priority.level).toBe('low');
    expect(result[1].priority.level).toBe('high');
  });
});