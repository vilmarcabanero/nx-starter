import Database from 'better-sqlite3';
import { injectable } from 'tsyringe';
import { Todo } from '@nx-starter/domain';
import type { ITodoRepository } from '@nx-starter/domain';
import { TodoMapper } from '@nx-starter/application-shared';
import { generateUUID } from '@nx-starter/utils-core';
import { getSqliteDatabase } from '../../../database/connections/SqliteConnection';

interface TodoRecord {
  id: string;
  title: string;
  completed: number; // SQLite boolean as integer
  priority: string;
  createdAt: string; // SQLite datetime as string
  dueDate?: string;
}

/**
 * SQLite implementation of ITodoRepository using better-sqlite3
 * Now uses shared database connection
 */
@injectable()
export class SqliteTodoRepository implements ITodoRepository {
  private db: Database.Database;

  constructor() {
    // Use shared SQLite database connection
    this.db = getSqliteDatabase();
  }

  async getAll(): Promise<Todo[]> {
    const stmt = this.db.prepare('SELECT * FROM todos ORDER BY createdAt DESC');
    const rows = stmt.all() as TodoRecord[];
    return rows.map((row) => this.mapToTodoEntity(row));
  }

  async create(todo: Todo): Promise<string> {
    const id = generateUUID();
    const stmt = this.db.prepare(`
      INSERT INTO todos (id, title, completed, priority, createdAt, dueDate)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      todo.titleValue,
      todo.completed ? 1 : 0,
      todo.priority.level,
      todo.createdAt.toISOString(),
      todo.dueDate?.toISOString()
    );

    return id;
  }

  async update(id: string, changes: Partial<Todo>): Promise<void> {
    const updates: string[] = [];
    const params: any[] = [];

    if (changes.title !== undefined) {
      updates.push('title = ?');
      params.push(
        typeof changes.title === 'string'
          ? changes.title
          : (changes.title as any).value
      );
    }

    if (changes.completed !== undefined) {
      updates.push('completed = ?');
      params.push(changes.completed ? 1 : 0);
    }

    if (changes.priority !== undefined) {
      updates.push('priority = ?');
      params.push(
        typeof changes.priority === 'string'
          ? changes.priority
          : (changes.priority as any).level
      );
    }

    if (changes.dueDate !== undefined) {
      updates.push('dueDate = ?');
      params.push(changes.dueDate?.toISOString());
    }

    if (updates.length === 0) {
      return;
    }

    params.push(id);
    const stmt = this.db.prepare(
      `UPDATE todos SET ${updates.join(', ')} WHERE id = ?`
    );
    const result = stmt.run(...params);

    if (result.changes === 0) {
      throw new Error(`Todo with ID ${id} not found`);
    }
  }

  async delete(id: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM todos WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      throw new Error(`Todo with ID ${id} not found`);
    }
  }

  async getById(id: string): Promise<Todo | undefined> {
    const stmt = this.db.prepare('SELECT * FROM todos WHERE id = ?');
    const row = stmt.get(id) as TodoRecord | undefined;
    return row ? this.mapToTodoEntity(row) : undefined;
  }

  async getActive(): Promise<Todo[]> {
    const stmt = this.db.prepare(
      'SELECT * FROM todos WHERE completed = 0 ORDER BY createdAt DESC'
    );
    const rows = stmt.all() as TodoRecord[];
    return rows.map((row) => this.mapToTodoEntity(row));
  }

  async getCompleted(): Promise<Todo[]> {
    const stmt = this.db.prepare(
      'SELECT * FROM todos WHERE completed = 1 ORDER BY createdAt DESC'
    );
    const rows = stmt.all() as TodoRecord[];
    return rows.map((row) => this.mapToTodoEntity(row));
  }

  async count(): Promise<number> {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM todos');
    const result = stmt.get() as { count: number };
    return result.count;
  }

  async countActive(): Promise<number> {
    const stmt = this.db.prepare(
      'SELECT COUNT(*) as count FROM todos WHERE completed = 0'
    );
    const result = stmt.get() as { count: number };
    return result.count;
  }

  async countCompleted(): Promise<number> {
    const stmt = this.db.prepare(
      'SELECT COUNT(*) as count FROM todos WHERE completed = 1'
    );
    const result = stmt.get() as { count: number };
    return result.count;
  }

  async findBySpecification(specification: any): Promise<Todo[]> {
    // For SQLite, we'll fetch all and filter in memory
    // In a real implementation, you'd translate specifications to SQL
    const allTodos = await this.getAll();
    return allTodos
      .filter((todo) => specification.isSatisfiedBy(todo))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  private mapToTodoEntity(row: TodoRecord): Todo {
    return TodoMapper.fromPlainObject({
      id: row.id,
      title: row.title,
      completed: Boolean(row.completed),
      createdAt: new Date(row.createdAt),
      priority: row.priority,
      dueDate: row.dueDate ? new Date(row.dueDate) : undefined,
    });
  }

  /**
   * Note: Database connection is managed by shared connection manager
   * Individual repositories should not close the shared connection
   */
}
