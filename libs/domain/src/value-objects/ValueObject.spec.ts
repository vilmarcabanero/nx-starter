import { describe, it, expect } from 'vitest';
import { ValueObject } from './ValueObject';

// Test implementation of ValueObject
class TestStringValueObject extends ValueObject<string> {
  protected validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Value cannot be empty');
    }
  }
}

class TestNumberValueObject extends ValueObject<number> {
  protected validate(value: number): void {
    if (value < 0) {
      throw new Error('Value cannot be negative');
    }
  }
}

class TestObjectValueObject extends ValueObject<{ name: string; age: number }> {
  protected validate(value: { name: string; age: number }): void {
    if (!value.name || value.age < 0) {
      throw new Error('Invalid object value');
    }
  }
}

describe('ValueObject', () => {
  describe('constructor and validation', () => {
    it('should create value object with valid value', () => {
      const vo = new TestStringValueObject('valid value');

      expect(vo.value).toBe('valid value');
    });

    it('should throw error for invalid string value', () => {
      expect(() => new TestStringValueObject('')).toThrow(
        'Value cannot be empty'
      );
      expect(() => new TestStringValueObject('   ')).toThrow(
        'Value cannot be empty'
      );
    });

    it('should throw error for invalid number value', () => {
      expect(() => new TestNumberValueObject(-1)).toThrow(
        'Value cannot be negative'
      );
    });

    it('should accept valid number value', () => {
      const vo = new TestNumberValueObject(42);

      expect(vo.value).toBe(42);
    });

    it('should handle complex object values', () => {
      const validObject = { name: 'John', age: 30 };
      const vo = new TestObjectValueObject(validObject);

      expect(vo.value).toEqual(validObject);
    });

    it('should validate complex object values', () => {
      expect(() => new TestObjectValueObject({ name: '', age: 25 })).toThrow(
        'Invalid object value'
      );
      expect(
        () => new TestObjectValueObject({ name: 'John', age: -5 })
      ).toThrow('Invalid object value');
    });
  });

  describe('value property', () => {
    it('should return the stored value', () => {
      const stringVo = new TestStringValueObject('test');
      const numberVo = new TestNumberValueObject(123);

      expect(stringVo.value).toBe('test');
      expect(numberVo.value).toBe(123);
    });

    it('should return immutable reference to complex objects', () => {
      const originalObject = { name: 'Alice', age: 25 };
      const vo = new TestObjectValueObject(originalObject);

      expect(vo.value).toEqual(originalObject);
      expect(vo.value).toBe(vo.value); // Same reference
    });
  });

  describe('equals', () => {
    it('should return true for value objects with same primitive values', () => {
      const vo1 = new TestStringValueObject('same value');
      const vo2 = new TestStringValueObject('same value');

      expect(vo1.equals(vo2)).toBe(true);
    });

    it('should return false for value objects with different primitive values', () => {
      const vo1 = new TestStringValueObject('value 1');
      const vo2 = new TestStringValueObject('value 2');

      expect(vo1.equals(vo2)).toBe(false);
    });

    it('should return true for value objects with same object values', () => {
      const obj1 = { name: 'John', age: 30 };
      const obj2 = { name: 'John', age: 30 };
      const vo1 = new TestObjectValueObject(obj1);
      const vo2 = new TestObjectValueObject(obj2);

      expect(vo1.equals(vo2)).toBe(true);
    });

    it('should return false for value objects with different object values', () => {
      const obj1 = { name: 'John', age: 30 };
      const obj2 = { name: 'Jane', age: 25 };
      const vo1 = new TestObjectValueObject(obj1);
      const vo2 = new TestObjectValueObject(obj2);

      expect(vo1.equals(vo2)).toBe(false);
    });

    it('should return false when comparing with non-ValueObject', () => {
      const vo = new TestStringValueObject('test');
      const notValueObject = { value: 'test' };

      expect(vo.equals(notValueObject as unknown as ValueObject<string>)).toBe(
        false
      );
    });

    it('should return false when comparing with null or undefined', () => {
      const vo = new TestStringValueObject('test');

      expect(vo.equals(null as unknown as ValueObject<string>)).toBe(false);
      expect(vo.equals(undefined as unknown as ValueObject<string>)).toBe(
        false
      );
    });

    it('should handle different types of value objects', () => {
      const stringVo = new TestStringValueObject('123');
      const numberVo = new TestNumberValueObject(123);

      expect(stringVo.equals(numberVo as unknown as ValueObject<string>)).toBe(
        false
      );
    });
  });

  describe('toString', () => {
    it('should return string representation of primitive values', () => {
      const stringVo = new TestStringValueObject('hello');
      const numberVo = new TestNumberValueObject(42);

      expect(stringVo.toString()).toBe('hello');
      expect(numberVo.toString()).toBe('42');
    });

    it('should return string representation of object values', () => {
      const objectVo = new TestObjectValueObject({ name: 'Alice', age: 30 });

      expect(objectVo.toString()).toBe('[object Object]');
    });

    it('should handle special values', () => {
      const zeroVo = new TestNumberValueObject(0);

      expect(zeroVo.toString()).toBe('0');
    });
  });
});
