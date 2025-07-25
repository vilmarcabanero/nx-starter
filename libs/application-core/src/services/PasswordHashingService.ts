import { injectable } from 'tsyringe';
import * as bcrypt from 'bcrypt';

/**
 * Password hashing service interface
 */
export interface IPasswordHashingService {
  hash(plainPassword: string): Promise<string>;
  compare(plainPassword: string, hashedPassword: string): Promise<boolean>;
}

/**
 * Bcrypt implementation of password hashing service
 */
@injectable()
export class BcryptPasswordHashingService implements IPasswordHashingService {
  private readonly saltRounds = 12;

  /**
   * Hashes a plain text password using bcrypt
   */
  async hash(plainPassword: string): Promise<string> {
    try {
      return await bcrypt.hash(plainPassword, this.saltRounds);
    } catch (error) {
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Compares a plain text password with a hashed password
   */
  async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw new Error('Failed to compare passwords');
    }
  }
}