import { ValueObject } from './ValueObject';

export class Name extends ValueObject<string> {
  protected validate(value: string): void {
    if (!value) {
      throw new Error('Name cannot be empty');
    }

    if (value.length < 1) {
      throw new Error('Name must have at least 1 character');
    }

    if (value.length > 50) {
      throw new Error('Name cannot exceed 50 characters');
    }

    // Allow letters, spaces, hyphens, and special character ñ
    const nameRegex = /^[a-zA-ZñÑ\s-]+$/;
    if (!nameRegex.test(value)) {
      throw new Error('Names can only contain letters, spaces, and hyphens');
    }
  }

  public static create(value: string): Name {
    return new Name(value.trim());
  }
}