/**
 * Value Object for Todo Priority
 */
export type TodoPriorityLevel = 'low' | 'medium' | 'high';

export class TodoPriority {
  private readonly _level: TodoPriorityLevel;

  constructor(level: TodoPriorityLevel = 'medium') {
    this._level = level;
  }

  get level(): TodoPriorityLevel {
    return this._level;
  }

  get numericValue(): number {
    switch (this._level) {
      case 'high':
        return 3;
      case 'medium':
        return 2;
      case 'low':
        return 1;
      default:
        return 2;
    }
  }

  isHigherThan(other: TodoPriority): boolean {
    return this.numericValue > other.numericValue;
  }

  equals(other: TodoPriority): boolean {
    return this._level === other._level;
  }

  toString(): string {
    return this._level;
  }
}
