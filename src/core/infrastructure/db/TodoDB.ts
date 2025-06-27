import Dexie, { type Table } from 'dexie';
import { Todo } from '../../domain/entities/Todo';

export class TodoDB extends Dexie {
  todos!: Table<Todo>;

  constructor() {
    super('TodoDB');
    this.version(1).stores({
      todos: '++id, title, completed, createdAt'
    });
    this.todos.mapToClass(Todo);
  }
}

export const db = new TodoDB();
