/**
 * Value Object for Todo ID
 * Ensures type safety and validation for todo identifiers
 */
export class TodoId {
  private readonly _value: string;

  constructor(value: string) {
    this.validateId(value);
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  private validateId(id: string): void {
    if (typeof id !== 'string' || id.trim().length === 0) {
      throw new Error('Todo ID must be a non-empty string');
    }
    
    // For flexibility, allow both UUID formats and simple string IDs
    // This makes the server more compatible with different client implementations
    if (id.trim().length < 1) {
      throw new Error('Todo ID must be at least 1 character long');
    }
  }

  equals(other: TodoId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  static fromString(value: string): TodoId {
    return new TodoId(value);
  }
}