import { injectable } from 'tsyringe';
import { User, IUserRepository } from '@nx-starter/domain';
import { UserMapper } from '@nx-starter/application-shared';

/**
 * In-memory implementation of IUserRepository
 * Used for testing and development
 */
@injectable()
export class InMemoryUserRepository implements IUserRepository {
  private users = new Map<string, User>();

  async getById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email.value.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return undefined;
  }

  async getByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username.value.toLowerCase() === username.toLowerCase()) {
        return user;
      }
    }
    return undefined;
  }

  async getByEmailOrUsername(identifier: string): Promise<User | undefined> {
    // Try to find by email first (if identifier contains @)
    if (identifier.includes('@')) {
      const userByEmail = await this.getByEmail(identifier);
      if (userByEmail) {
        return userByEmail;
      }
    }
    
    // Try to find by username
    return await this.getByUsername(identifier);
  }

  async create(user: User): Promise<string> {
    this.users.set(user.id, user);
    return user.id;
  }

  async update(id: string, changes: Partial<User>): Promise<void> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new Error(`User with ID ${id} not found`);
    }

    // For in-memory, we'd need to create a new user instance with changes
    // This is simplified - in real implementation, we'd handle partial updates properly
    throw new Error('Update not implemented for in-memory repository');
  }

  async delete(id: string): Promise<void> {
    const deleted = this.users.delete(id);
    if (!deleted) {
      throw new Error(`User with ID ${id} not found`);
    }
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.getByEmail(email);
    return user !== undefined;
  }

  async existsByUsername(username: string): Promise<boolean> {
    const user = await this.getByUsername(username);
    return user !== undefined;
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

  /**
   * Utility method to clear all users (for testing)
   */
  async clear(): Promise<void> {
    this.users.clear();
  }

  /**
   * Utility method to get all users (for testing)
   */
  async getAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }
}