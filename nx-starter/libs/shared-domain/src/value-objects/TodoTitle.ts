import { InvalidTodoTitleException } from '../exceptions/DomainExceptions';

/**
 * Value Object for Todo Title
 * Encapsulates business rules for todo titles
 */
export class TodoTitle {
  private readonly _value: string;

  constructor(value: string) {
    this.validateTitle(value);
    this._value = value.trim();
  }

  get value(): string {
    return this._value;
  }

  private validateTitle(title: string): void {
    if (!title || !title.trim()) {
      throw new InvalidTodoTitleException('cannot be empty');
    }

    if (title.trim().length > 255) {
      throw new InvalidTodoTitleException('cannot exceed 255 characters');
    }

    if (title.trim().length < 2) {
      throw new InvalidTodoTitleException('must be at least 2 characters long');
    }
  }

  equals(other: TodoTitle): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
