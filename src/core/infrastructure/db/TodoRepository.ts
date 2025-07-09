import { injectable } from 'tsyringe';
import { Todo } from '../../domain/entities/Todo';
import type { ITodoRepository } from '../../domain/repositories/ITodoRepository';
import { db } from './TodoDB';

@injectable()
export class TodoRepository implements ITodoRepository {
  async getAll(): Promise<Todo[]> {
    return await db.todos.orderBy('createdAt').reverse().toArray();
  }

  async create(todo: Todo): Promise<number> {
    const id = await db.todos.add(todo);
    return id as number;
  }

  async update(id: number, changes: Partial<Todo>): Promise<void> {
    await db.todos.update(id, changes);
  }

  async delete(id: number): Promise<void> {
    await db.todos.delete(id);
  }

  async getById(id: number): Promise<Todo | undefined> {
    return await db.todos.get(id);
  }

  async getActive(): Promise<Todo[]> {
    return await db.todos.where('completed').equals(0).toArray();
  }

  async getCompleted(): Promise<Todo[]> {
    return await db.todos.where('completed').equals(1).toArray();
  }
}
