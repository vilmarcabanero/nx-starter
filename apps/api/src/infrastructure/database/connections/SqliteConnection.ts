import Database from 'better-sqlite3';
import { getDatabaseConfig } from '../../../config';

/**
 * Shared SQLite database connection management
 * Provides singleton database instance for all features
 */
class SqliteConnectionManager {
  private static instance: SqliteConnectionManager;
  private db: Database.Database | null = null;

  private constructor() {}

  public static getInstance(): SqliteConnectionManager {
    if (!SqliteConnectionManager.instance) {
      SqliteConnectionManager.instance = new SqliteConnectionManager();
    }
    return SqliteConnectionManager.instance;
  }

  public getDatabase(): Database.Database {
    if (!this.db) {
      // Use database URL from config or default to memory for development
      const dbConfig = getDatabaseConfig();
      const dbPath = dbConfig.url || ':memory:';
      this.db = new Database(dbPath);
      console.log(`📦 Shared SQLite database connected: ${dbPath === ':memory:' ? 'in-memory' : dbPath}`);
      
      // Initialize all table schemas
      this.initializeTables();
    }
    return this.db;
  }

  private initializeTables(): void {
    if (!this.db) return;

    // Initialize todos table (existing functionality)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        priority TEXT NOT NULL DEFAULT 'medium',
        createdAt TEXT NOT NULL,
        dueDate TEXT
      )
    `);

    // Initialize users table (for auth functionality)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        hashedPassword TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )
    `);

    console.log('📦 SQLite tables initialized');
  }

  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('📦 Shared SQLite database connection closed');
    }
  }
}

// Export singleton instance getter
export const getSqliteDatabase = (): Database.Database => {
  return SqliteConnectionManager.getInstance().getDatabase();
};

export const closeSqliteConnection = (): void => {
  SqliteConnectionManager.getInstance().close();
};