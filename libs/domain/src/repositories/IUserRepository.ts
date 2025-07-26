import { User } from '../entities/User';

export interface IUserRepository {
  getById(id: string): Promise<User | undefined>;
  getByEmail(email: string): Promise<User | undefined>;
  getByUsername(username: string): Promise<User | undefined>;
  getByEmailOrUsername(identifier: string): Promise<User | undefined>;
  create(user: User): Promise<string>;
  update(id: string, changes: Partial<User>): Promise<void>;
  delete(id: string): Promise<void>;
  existsByEmail(email: string): Promise<boolean>;
  existsByUsername(username: string): Promise<boolean>;
  generateUniqueUsername(baseUsername: string): Promise<string>;
}