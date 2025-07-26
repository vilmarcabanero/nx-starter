import { ValueObject } from './ValueObject';

export class Email extends ValueObject<string> {
  protected validate(value: string): void {
    if (!value) {
      throw new Error('Email cannot be empty');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('Invalid email format');
    }

    if (value.length > 254) {
      throw new Error('Email is too long');
    }
  }

  public static create(value: string): Email {
    return new Email(value.toLowerCase().trim());
  }

  public getDomain(): string {
    return this.value.split('@')[1];
  }

  public getLocalPart(): string {
    return this.value.split('@')[0];
  }
}