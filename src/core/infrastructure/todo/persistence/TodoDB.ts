import Dexie, { type Table } from 'dexie';

// Interface for the raw data stored in IndexedDB
export interface TodoRecord {
  id?: number;
  title: string;
  completed: boolean;
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
      todos: '++id, title, completed, createdAt, priority'
    });
  }
}

export const db = new TodoDB();
