import { injectable } from 'tsyringe';
import { Todo } from '@/core/domain/todo/entities/Todo';
import type { ITodoRepository } from '@/core/domain/todo/repositories/ITodoRepository';
import { generateId } from '@/utils/uuid';

/**
 * In-memory implementation of ITodoRepository
 * Useful for development and testing
 */
@injectable()
export class InMemoryTodoRepository implements ITodoRepository {
  private todos: Map<string, Todo> = new Map();

  async getAll(): Promise<Todo[]> {
    return Array.from(this.todos.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async create(todo: Todo): Promise<string> {
    const id = generateId();
    const todoWithId = new Todo(
      todo.title,
      todo.completed,
      todo.createdAt,
      id,
      todo.priority.level,
      todo.dueDate
    );
    
    this.todos.set(id, todoWithId);
    return id;
  }

  async update(id: string, changes: Partial<Todo>): Promise<void> {
    const existingTodo = this.todos.get(id);
    if (!existingTodo) {
      throw new Error(`Todo with ID ${id} not found`);
    }

    // Create updated todo with changes
    const updatedTodo = new Todo(
      changes.title !== undefined ? changes.title : existingTodo.title,
      changes.completed !== undefined ? changes.completed : existingTodo.completed,
      existingTodo.createdAt,
      id,
      changes.priority !== undefined ? (changes.priority as any) : existingTodo.priority.level,
      changes.dueDate !== undefined ? changes.dueDate : existingTodo.dueDate
    );

    this.todos.set(id, updatedTodo);
  }

  async delete(id: string): Promise<void> {
    const deleted = this.todos.delete(id);
    if (!deleted) {
      throw new Error(`Todo with ID ${id} not found`);
    }
  }

  async getById(id: string): Promise<Todo | undefined> {
    return this.todos.get(id);
  }

  async getActive(): Promise<Todo[]> {
    return Array.from(this.todos.values())
      .filter(todo => !todo.completed)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getCompleted(): Promise<Todo[]> {
    return Array.from(this.todos.values())
      .filter(todo => todo.completed)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async count(): Promise<number> {
    return this.todos.size;
  }

  async countActive(): Promise<number> {
    return Array.from(this.todos.values()).filter(todo => !todo.completed).length;
  }

  async countCompleted(): Promise<number> {
    return Array.from(this.todos.values()).filter(todo => todo.completed).length;
  }
}