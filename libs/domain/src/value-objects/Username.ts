import { ValueObject } from './ValueObject';

export class Username extends ValueObject<string> {
  protected validate(value: string): void {
    if (!value) {
      throw new Error('Username cannot be empty');
    }

    if (value.length < 2) {
      throw new Error('Username must be at least 2 characters long');
    }

    if (value.length > 50) {
      throw new Error('Username cannot exceed 50 characters');
    }

    // Allow letters, numbers, dots, hyphens, and underscores
    const usernameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!usernameRegex.test(value)) {
      throw new Error('Username can only contain letters, numbers, dots, hyphens, and underscores');
    }
  }

  public static create(value: string): Username {
    return new Username(value.toLowerCase().trim());
  }

  public static fromEmail(email: string): Username {
    const localPart = email.split('@')[0];
    return Username.create(localPart);
  }
}