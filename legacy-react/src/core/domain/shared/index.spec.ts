import { describe, it, expect } from 'vitest';
import * as SharedDomain from './index';
import { Entity } from './base/Entity';
import { ValueObject } from './base/ValueObject';
import { Specification } from './specifications/Specification';

describe('Domain Shared Index Exports', () => {
  it('should export Entity class', () => {
    expect(SharedDomain.Entity).toBe(Entity);
    expect(typeof SharedDomain.Entity).toBe('function');
  });

  it('should export ValueObject class', () => {
    expect(SharedDomain.ValueObject).toBe(ValueObject);
    expect(typeof SharedDomain.ValueObject).toBe('function');
  });

  it('should export Specification class', () => {
    expect(SharedDomain.Specification).toBe(Specification);
    expect(typeof SharedDomain.Specification).toBe('function');
  });

  it('should have all expected exports available', () => {
    expect(SharedDomain.Entity).toBeDefined();
    expect(SharedDomain.ValueObject).toBeDefined();
    expect(SharedDomain.Specification).toBeDefined();
  });
});