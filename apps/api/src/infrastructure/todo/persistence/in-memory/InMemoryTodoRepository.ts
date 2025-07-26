import { injectable } from 'tsyringe';
import { Todo } from '@nx-starter/domain';
import type { ITodoRepository } from '@nx-starter/domain';
import type { Specification } from '@nx-starter/domain';
import { generateId } from '@nx-starter/utils-core';

/**
 * In-memory implementation of ITodoRepository
 * Useful for development and testing
 */
@injectable()
export class InMemoryTodoRepository implements ITodoRepository {
  private todos: Map<string, Todo> = new Map();

  async getAll(): Promise<Todo[]> {
    return Array.from(this.todos.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async create(todo: Todo): Promise<string> {
    const id = generateId();
    const todoWithId = new Todo(
      todo.title.value,
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
      changes.title !== undefined
        ? typeof changes.title === 'string'
          ? changes.title
          : changes.title && typeof changes.title === 'object' && 'value' in changes.title
            ? (changes.title as any).value
            : existingTodo.title.value
        : existingTodo.title.value,
      changes.completed !== undefined
        ? changes.completed
        : existingTodo.completed,
      existingTodo.createdAt,
      id,
      changes.priority !== undefined
        ? typeof changes.priority === 'string' 
          ? changes.priority 
          : (changes.priority as any).level !== undefined 
            ? (changes.priority as any).level 
            : existingTodo.priority.level
        : existingTodo.priority.level,
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
      .filter((todo) => !todo.completed)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getCompleted(): Promise<Todo[]> {
    return Array.from(this.todos.values())
      .filter((todo) => todo.completed)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async count(): Promise<number> {
    return this.todos.size;
  }

  async countActive(): Promise<number> {
    return Array.from(this.todos.values()).filter((todo) => !todo.completed)
      .length;
  }

  async countCompleted(): Promise<number> {
    return Array.from(this.todos.values()).filter((todo) => todo.completed)
      .length;
  }

  async findBySpecification(
    specification: Specification<Todo>
  ): Promise<Todo[]> {
    return Array.from(this.todos.values())
      .filter((todo) => specification.isSatisfiedBy(todo))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Utility method to clear all todos (for testing)
   */
  async clear(): Promise<void> {
    this.todos.clear();
  }
}
