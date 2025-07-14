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
    
    // Validate UUID format without dashes (32 hex characters)
    const uuidRegex = /^[0-9a-f]{32}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Todo ID must be a valid UUID without dashes (32 hex characters)');
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
