/**
 * Interface for ID validation strategies
 */
interface IdValidator {
  isValid(id: string): boolean;
  getTypeName(): string;
}

/**
 * UUID validator implementation
 */
class UuidValidator implements IdValidator {
  isValid(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{32}$/i;
    return uuidRegex.test(id);
  }

  getTypeName(): string {
    return 'uuid';
  }
}

/**
 * MongoDB ObjectId validator implementation
 */
class MongoIdValidator implements IdValidator {
  isValid(id: string): boolean {
    const mongoIdRegex = /^[0-9a-f]{24}$/i;
    return mongoIdRegex.test(id);
  }

  getTypeName(): string {
    return 'mongodb';
  }
}

/**
 * Value Object for Todo ID
 * Ensures type safety and validation for todo identifiers
 * Uses Strategy pattern for OCP compliance
 */
export class TodoId {
  private readonly _value: string;
  private readonly _validator: IdValidator;

  private static readonly validators: IdValidator[] = [
    new UuidValidator(),
    new MongoIdValidator(),
  ];

  constructor(value: string) {
    this.validateId(value);
    this._value = value;
    this._validator = this.findValidator(value);
  }

  get value(): string {
    return this._value;
  }

  private validateId(id: string): void {
    if (typeof id !== 'string' || id.trim().length === 0) {
      throw new Error('Todo ID must be a non-empty string');
    }

    const isValid = TodoId.validators.some((validator) =>
      validator.isValid(id)
    );

    if (!isValid) {
      const supportedFormats = TodoId.validators
        .map((v) => v.getTypeName())
        .join(', ');
      throw new Error(
        `Todo ID must be a valid format. Supported formats: ${supportedFormats}`
      );
    }
  }

  private findValidator(id: string): IdValidator {
    const validator = TodoId.validators.find((v) => v.isValid(id));
    if (!validator) {
      throw new Error('No validator found for the given ID');
    }
    return validator;
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

  isUUID(): boolean {
    return this._validator.getTypeName() === 'uuid';
  }

  isMongoObjectId(): boolean {
    return this._validator.getTypeName() === 'mongodb';
  }

  getIdType(): 'uuid' | 'mongodb' {
    return this._validator.getTypeName() as 'uuid' | 'mongodb';
  }

  static addValidator(validator: IdValidator): void {
    TodoId.validators.push(validator);
  }
}
