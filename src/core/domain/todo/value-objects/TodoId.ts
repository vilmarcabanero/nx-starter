/**
 * Value Object for Todo ID
 * Ensures type safety and validation for todo identifiers
 */
export class TodoId {
  private readonly _value: number;

  constructor(value: number) {
    this.validateId(value);
    this._value = value;
  }

  get value(): number {
    return this._value;
  }

  private validateId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Todo ID must be a positive integer');
    }
  }

  equals(other: TodoId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value.toString();
  }

  static fromString(value: string): TodoId {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
      throw new Error('Invalid Todo ID format');
    }
    return new TodoId(numValue);
  }
}
