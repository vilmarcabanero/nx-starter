import { describe, it, expect, beforeEach } from 'vitest';
import { TodoDB } from '../core/infrastructure/db/TodoDB';

describe('TodoDB', () => {
  let db: TodoDB;

  beforeEach(() => {
    db = new TodoDB();
  });

  it('should create a TodoDB instance', () => {
    expect(db).toBeInstanceOf(TodoDB);
    expect(db.name).toBe('TodoDB');
  });

  it('should have todos table defined', () => {
    expect(db.todos).toBeDefined();
  });

  it('should have correct schema for todos table', () => {
    expect(db.tables).toHaveLength(1);
    expect(db.tables[0].name).toBe('todos');
  });
});
