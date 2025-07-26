import Database from 'better-sqlite3';
import { injectable } from 'tsyringe';
import { User, IUserRepository } from '@nx-starter/domain';
import { UserMapper } from '@nx-starter/application-shared';
import { getSqliteDatabase } from '../../../database/connections/SqliteConnection';

interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  hashedPassword: string;
  createdAt: string; // SQLite datetime as string
}

/**
 * SQLite implementation of IUserRepository using better-sqlite3
 * Uses shared database connection
 */
@injectable()
export class SqliteUserRepository implements IUserRepository {
  private db: Database.Database;

  constructor() {
    // Use shared SQLite database connection
    this.db = getSqliteDatabase();
  }

  async getById(id: string): Promise<User | undefined> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id) as UserRecord | undefined;
    return row ? this.mapToUserEntity(row) : undefined;
  }

  async getByEmail(email: string): Promise<User | undefined> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)');
    const row = stmt.get(email) as UserRecord | undefined;
    return row ? this.mapToUserEntity(row) : undefined;
  }

  async getByUsername(username: string): Promise<User | undefined> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)');
    const row = stmt.get(username) as UserRecord | undefined;
    return row ? this.mapToUserEntity(row) : undefined;
  }

  async getByEmailOrUsername(identifier: string): Promise<User | undefined> {
    const stmt = this.db.prepare(`
      SELECT * FROM users 
      WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)
      LIMIT 1
    `);
    const row = stmt.get(identifier, identifier) as UserRecord | undefined;
    return row ? this.mapToUserEntity(row) : undefined;
  }

  async create(user: User): Promise<string> {
    const stmt = this.db.prepare(`
      INSERT INTO users (id, firstName, lastName, email, username, hashedPassword, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      user.id,
      user.firstName.value,
      user.lastName.value,
      user.email.value,
      user.username.value,
      user.hashedPassword.value,
      user.createdAt.toISOString()
    );

    return user.id;
  }

  async update(id: string, changes: Partial<User>): Promise<void> {
    const updates: string[] = [];
    const params: any[] = [];

    if (changes.firstName !== undefined) {
      updates.push('firstName = ?');
      params.push((changes.firstName as any).value);
    }

    if (changes.lastName !== undefined) {
      updates.push('lastName = ?');
      params.push((changes.lastName as any).value);
    }

    if (changes.email !== undefined) {
      updates.push('email = ?');
      params.push((changes.email as any).value);
    }

    if (changes.username !== undefined) {
      updates.push('username = ?');
      params.push((changes.username as any).value);
    }

    if (changes.hashedPassword !== undefined) {
      updates.push('hashedPassword = ?');
      params.push((changes.hashedPassword as any).value);
    }

    if (updates.length === 0) {
      return;
    }

    params.push(id);
    const stmt = this.db.prepare(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
    );
    const result = stmt.run(...params);

    if (result.changes === 0) {
      throw new Error(`User with ID ${id} not found`);
    }
  }

  async delete(id: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      throw new Error(`User with ID ${id} not found`);
    }
  }

  async existsByEmail(email: string): Promise<boolean> {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM users WHERE LOWER(email) = LOWER(?)');
    const result = stmt.get(email) as { count: number };
    return result.count > 0;
  }

  async existsByUsername(username: string): Promise<boolean> {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM users WHERE LOWER(username) = LOWER(?)');
    const result = stmt.get(username) as { count: number };
    return result.count > 0;
  }

  async generateUniqueUsername(baseUsername: string): Promise<string> {
    // Check if base username is available
    if (!(await this.existsByUsername(baseUsername))) {
      return baseUsername;
    }

    // Find unique username with incremental suffix
    let counter = 1;
    let candidateUsername = `${baseUsername}${counter}`;
    
    while (await this.existsByUsername(candidateUsername)) {
      counter++;
      candidateUsername = `${baseUsername}${counter}`;
      
      // Prevent infinite loops
      if (counter > 1000) {
        throw new Error('Unable to generate unique username');
      }
    }

    return candidateUsername;
  }

  private mapToUserEntity(row: UserRecord): User {
    return UserMapper.fromPlainObject({
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      username: row.username,
      hashedPassword: row.hashedPassword,
      createdAt: new Date(row.createdAt),
    });
  }
}