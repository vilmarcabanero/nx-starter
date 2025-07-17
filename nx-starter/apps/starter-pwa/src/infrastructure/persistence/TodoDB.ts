import Dexie, { type Table } from 'dexie';

// Interface for the raw data stored in IndexedDB
// Note: completed is stored as 0/1 due to IndexedDB indexing requirements
export interface TodoRecord {
  id: string;
  title: string;
  completed: number; // 0 for false, 1 for true (IndexedDB indexing requirement)
  createdAt: Date;
  priority: string;
  dueDate?: Date;
}

export class TodoDB extends Dexie {
  todos!: Table<TodoRecord>;

  constructor() {
    super('TodoDB');

    // Clean schema for development - no legacy support needed
    this.version(1).stores({
      todos: 'id, title, completed, createdAt, priority',
    });
  }
}

export const db = new TodoDB();
