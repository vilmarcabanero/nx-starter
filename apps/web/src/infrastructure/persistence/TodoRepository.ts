import { injectable } from 'tsyringe';
import {
  Todo,
  TodoPriorityLevel,
  Specification,
  ITodoRepository,
} from '@nx-starter/domain';
import { db, type TodoRecord } from './TodoDB';
import { generateUUID } from '@nx-starter/utils-core';

@injectable()
export class TodoRepository implements ITodoRepository {
  async getAll(): Promise<Todo[]> {
    const rawTodos = await db.todos.orderBy('createdAt').reverse().toArray();
    return rawTodos.map((raw) => this.mapToTodoEntity(raw));
  }

  async create(todo: Todo): Promise<string> {
    // Generate UUID for the todo
    const id = generateUUID();

    // Convert Todo entity to plain object for storage
    const todoData = this.mapToPlainObject(todo);
    const todoRecord: TodoRecord = {
      ...todoData,
      id,
    };

    await db.todos.add(todoRecord);
    return id;
  }

  async update(id: string, changes: Partial<Todo>): Promise<void> {
    // Convert any value objects to plain objects for storage
    const updateData: Partial<TodoRecord> = {};
    if (changes.title) {
      updateData.title =
        changes.title instanceof Object && 'value' in changes.title
          ? changes.title.value
          : changes.title;
    }
    if (changes.completed !== undefined) {
      updateData.completed = changes.completed ? 1 : 0; // Convert boolean to 0/1
    }
    if (changes.priority) {
      updateData.priority =
        changes.priority instanceof Object && 'level' in changes.priority
          ? changes.priority.level
          : changes.priority;
    }
    if ('dueDate' in changes) {
      updateData.dueDate = changes.dueDate;
    }

    await db.todos.update(id, updateData);
  }

  async delete(id: string): Promise<void> {
    await db.todos.delete(id);
  }

  async getById(id: string): Promise<Todo | undefined> {
    const rawTodo = await db.todos.get(id);
    return rawTodo ? this.mapToTodoEntity(rawTodo) : undefined;
  }

  async getActive(): Promise<Todo[]> {
    const rawTodos = await db.todos.where('completed').equals(0).toArray();
    return rawTodos.map((raw) => this.mapToTodoEntity(raw));
  }

  async getCompleted(): Promise<Todo[]> {
    const rawTodos = await db.todos.where('completed').equals(1).toArray();
    return rawTodos.map((raw) => this.mapToTodoEntity(raw));
  }

  async findBySpecification(
    specification: Specification<Todo>
  ): Promise<Todo[]> {
    const allTodos = await this.getAll();
    return allTodos.filter((todo) => specification.isSatisfiedBy(todo));
  }

  /**
   * Maps a raw database object to a proper Todo entity
   */
  private mapToTodoEntity(rawTodo: TodoRecord): Todo {
    return new Todo(
      rawTodo.title,
      Boolean(rawTodo.completed), // Convert 0/1 back to boolean
      rawTodo.createdAt ? new Date(rawTodo.createdAt) : new Date(),
      rawTodo.id,
      (rawTodo.priority || 'medium') as TodoPriorityLevel,
      rawTodo.dueDate ? new Date(rawTodo.dueDate) : undefined
    );
  }

  /**
   * Maps a Todo entity to a plain object for storage
   */
  private mapToPlainObject(todo: Todo): Omit<TodoRecord, 'id'> {
    return {
      title: todo.titleValue,
      completed: todo.completed ? 1 : 0, // Convert boolean to 0/1 for IndexedDB
      createdAt: todo.createdAt,
      priority: todo.priority.level,
      dueDate: todo.dueDate,
    };
  }
}
