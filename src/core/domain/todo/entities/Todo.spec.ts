import { describe, it, expect } from 'vitest';
import { Todo } from './Todo';

describe('Todo Entity', () => {
  it('should create a todo with default values', () => {
    const todo = new Todo('Test todo');
    
    expect(todo.title.value).toBe('Test todo');
    expect(todo.completed).toBe(false);
    expect(todo.createdAt).toBeInstanceOf(Date);
    expect(todo.id).toBeUndefined();
  });

  it('should toggle completion status', () => {
    const todo = new Todo('Test todo');
    const toggledTodo = todo.toggle();
    
    expect(toggledTodo.completed).toBe(true);
    expect(toggledTodo.title.value).toBe('Test todo');
  });

  it('should update title', () => {
    const todo = new Todo('Original title');
    const updatedTodo = todo.updateTitle('New title');
    
    expect(updatedTodo.title.value).toBe('New title');
    expect(updatedTodo.completed).toBe(false);
  });

  it('should detect overdue todos', () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 8); // 8 days ago
    
    const todo = new Todo('Old todo', false, oldDate);
    expect(todo.isOverdue()).toBe(true);
    
    const completedTodo = new Todo('Completed old todo', true, oldDate);
    expect(completedTodo.isOverdue()).toBe(false);
    
    const recentTodo = new Todo('Recent todo');
    expect(recentTodo.isOverdue()).toBe(false);
  });
});