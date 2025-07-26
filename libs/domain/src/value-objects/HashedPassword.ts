import { ValueObject } from './ValueObject';

export class HashedPassword extends ValueObject<string> {
  protected validate(value: string): void {
    if (!value) {
      throw new Error('Hashed password cannot be empty');
    }

    // Validate bcrypt hash format (starts with $2a$, $2b$, $2x$, or $2y$)
    const bcryptRegex = /^\$2[abyxy]?\$[0-9]{2}\$.{53}$/;
    if (!bcryptRegex.test(value)) {
      throw new Error('Invalid hashed password format');
    }
  }

  public static create(hashedValue: string): HashedPassword {
    return new HashedPassword(hashedValue);
  }

  public static isValidPlainPassword(password: string): boolean {
    if (!password || password.length < 8) {
      return false;
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return false;
    }

    // Check for at least one lowercase letter  
    if (!/[a-z]/.test(password)) {
      return false;
    }

    // Check for at least one number
    if (!/[0-9]/.test(password)) {
      return false;
    }

    return true;
  }

  public static validatePlainPassword(password: string): void {
    if (!password) {
      throw new Error('Password is required');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      throw new Error('Password must contain at least one number');
    }
  }
}