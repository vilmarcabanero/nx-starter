import { describe, it, expect } from 'vitest';
import { Specification } from './Specification';

// Test implementations of Specification
class IsPositiveSpecification extends Specification<number> {
  isSatisfiedBy(candidate: number): boolean {
    return candidate > 0;
  }
}

class IsEvenSpecification extends Specification<number> {
  isSatisfiedBy(candidate: number): boolean {
    return candidate % 2 === 0;
  }
}

class IsGreaterThanSpecification extends Specification<number> {
  constructor(private threshold: number) {
    super();
  }

  isSatisfiedBy(candidate: number): boolean {
    return candidate > this.threshold;
  }
}

class StringLengthSpecification extends Specification<string> {
  constructor(private minLength: number) {
    super();
  }

  isSatisfiedBy(candidate: string): boolean {
    return candidate.length >= this.minLength;
  }
}

describe('Specification', () => {
  describe('basic specification functionality', () => {
    it('should evaluate single specification correctly', () => {
      const isPositive = new IsPositiveSpecification();

      expect(isPositive.isSatisfiedBy(5)).toBe(true);
      expect(isPositive.isSatisfiedBy(-3)).toBe(false);
      expect(isPositive.isSatisfiedBy(0)).toBe(false);
    });

    it('should work with different data types', () => {
      const stringSpec = new StringLengthSpecification(3);

      expect(stringSpec.isSatisfiedBy('hello')).toBe(true);
      expect(stringSpec.isSatisfiedBy('hi')).toBe(false);
      expect(stringSpec.isSatisfiedBy('abc')).toBe(true);
    });
  });

  describe('and operation', () => {
    it('should combine specifications with AND logic', () => {
      const isPositive = new IsPositiveSpecification();
      const isEven = new IsEvenSpecification();
      const isPositiveAndEven = isPositive.and(isEven);

      expect(isPositiveAndEven.isSatisfiedBy(4)).toBe(true); // positive and even
      expect(isPositiveAndEven.isSatisfiedBy(3)).toBe(false); // positive but odd
      expect(isPositiveAndEven.isSatisfiedBy(-2)).toBe(false); // even but negative
      expect(isPositiveAndEven.isSatisfiedBy(-3)).toBe(false); // negative and odd
    });

    it('should chain multiple AND operations', () => {
      const isPositive = new IsPositiveSpecification();
      const isEven = new IsEvenSpecification();
      const isGreaterThan10 = new IsGreaterThanSpecification(10);
      const complex = isPositive.and(isEven).and(isGreaterThan10);

      expect(complex.isSatisfiedBy(12)).toBe(true); // positive, even, > 10
      expect(complex.isSatisfiedBy(8)).toBe(false); // positive, even, but <= 10
      expect(complex.isSatisfiedBy(11)).toBe(false); // positive, > 10, but odd
    });
  });

  describe('or operation', () => {
    it('should combine specifications with OR logic', () => {
      const isPositive = new IsPositiveSpecification();
      const isEven = new IsEvenSpecification();
      const isPositiveOrEven = isPositive.or(isEven);

      expect(isPositiveOrEven.isSatisfiedBy(4)).toBe(true); // positive and even
      expect(isPositiveOrEven.isSatisfiedBy(3)).toBe(true); // positive but odd
      expect(isPositiveOrEven.isSatisfiedBy(-2)).toBe(true); // even but negative
      expect(isPositiveOrEven.isSatisfiedBy(-3)).toBe(false); // negative and odd
    });

    it('should chain multiple OR operations', () => {
      const isPositive = new IsPositiveSpecification();
      const isEven = new IsEvenSpecification();
      const isGreaterThan100 = new IsGreaterThanSpecification(100);
      const complex = isPositive.or(isEven).or(isGreaterThan100);

      expect(complex.isSatisfiedBy(3)).toBe(true); // positive
      expect(complex.isSatisfiedBy(-2)).toBe(true); // even
      expect(complex.isSatisfiedBy(-150)).toBe(true); // > 100
      expect(complex.isSatisfiedBy(-3)).toBe(false); // none of the conditions
    });
  });

  describe('not operation', () => {
    it('should negate specification result', () => {
      const isPositive = new IsPositiveSpecification();
      const isNotPositive = isPositive.not();

      expect(isNotPositive.isSatisfiedBy(5)).toBe(false); // positive -> not positive = false
      expect(isNotPositive.isSatisfiedBy(-3)).toBe(true); // negative -> not positive = true
      expect(isNotPositive.isSatisfiedBy(0)).toBe(true); // zero -> not positive = true
    });

    it('should handle double negation', () => {
      const isPositive = new IsPositiveSpecification();
      const doubleNegated = isPositive.not().not();

      expect(doubleNegated.isSatisfiedBy(5)).toBe(true); // should behave like original
      expect(doubleNegated.isSatisfiedBy(-3)).toBe(false); // should behave like original
    });
  });

  describe('complex combinations', () => {
    it('should handle complex AND/OR combinations', () => {
      const isPositive = new IsPositiveSpecification();
      const isEven = new IsEvenSpecification();
      const isGreaterThan10 = new IsGreaterThanSpecification(10);

      // (positive AND even) OR greater than 10
      const complex = isPositive.and(isEven).or(isGreaterThan10);

      expect(complex.isSatisfiedBy(4)).toBe(true); // positive and even
      expect(complex.isSatisfiedBy(15)).toBe(true); // > 10
      expect(complex.isSatisfiedBy(3)).toBe(false); // positive but odd, not > 10
      expect(complex.isSatisfiedBy(-2)).toBe(false); // even but negative, not > 10
    });

    it('should handle NOT with AND/OR combinations', () => {
      const isPositive = new IsPositiveSpecification();
      const isEven = new IsEvenSpecification();

      // NOT (positive AND even) = NOT positive OR NOT even
      const complex = isPositive.and(isEven).not();

      expect(complex.isSatisfiedBy(4)).toBe(false); // positive and even -> NOT = false
      expect(complex.isSatisfiedBy(3)).toBe(true); // positive but odd -> NOT = true
      expect(complex.isSatisfiedBy(-2)).toBe(true); // even but negative -> NOT = true
      expect(complex.isSatisfiedBy(-3)).toBe(true); // negative and odd -> NOT = true
    });

    it('should handle precedence correctly', () => {
      const isPositive = new IsPositiveSpecification();
      const isEven = new IsEvenSpecification();
      const isGreaterThan5 = new IsGreaterThanSpecification(5);

      // positive AND (even OR greater than 5)
      const spec1 = isPositive.and(isEven.or(isGreaterThan5));

      // (positive AND even) OR greater than 5
      const spec2 = isPositive.and(isEven).or(isGreaterThan5);

      const testValue = 7; // positive, odd, > 5

      expect(spec1.isSatisfiedBy(testValue)).toBe(true); // positive AND (false OR true) = true
      expect(spec2.isSatisfiedBy(testValue)).toBe(true); // (positive AND false) OR true = true

      const testValue2 = 3; // positive, odd, <= 5

      expect(spec1.isSatisfiedBy(testValue2)).toBe(false); // positive AND (false OR false) = false
      expect(spec2.isSatisfiedBy(testValue2)).toBe(false); // (positive AND false) OR false = false
    });
  });

  describe('edge cases', () => {
    it('should handle empty values correctly', () => {
      const stringSpec = new StringLengthSpecification(0);

      expect(stringSpec.isSatisfiedBy('')).toBe(true);
      expect(stringSpec.isSatisfiedBy('a')).toBe(true);
    });

    it('should work with zero values', () => {
      const isPositive = new IsPositiveSpecification();
      const isEven = new IsEvenSpecification();

      expect(isPositive.isSatisfiedBy(0)).toBe(false);
      expect(isEven.isSatisfiedBy(0)).toBe(true);
    });

    it('should maintain specification immutability', () => {
      const isPositive = new IsPositiveSpecification();
      const isEven = new IsEvenSpecification();

      const combined = isPositive.and(isEven);

      // Original specifications should still work independently
      expect(isPositive.isSatisfiedBy(3)).toBe(true);
      expect(isEven.isSatisfiedBy(-2)).toBe(true);

      // Combined specification should have its own behavior
      expect(combined.isSatisfiedBy(3)).toBe(false);
      expect(combined.isSatisfiedBy(-2)).toBe(false);
    });
  });
});
