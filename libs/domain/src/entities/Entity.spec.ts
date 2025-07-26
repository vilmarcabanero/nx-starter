import { describe, it, expect } from 'vitest';
import { Entity, AggregateRoot, DomainEvent } from './Entity';

// Test implementation of Entity
class TestEntity extends Entity<string> {
  constructor(id: string) {
    super(id);
  }
}

// Test implementation of AggregateRoot
class TestAggregateRoot extends AggregateRoot<number> {
  constructor(id: number) {
    super(id);
  }

  public addTestEvent(event: DomainEvent): void {
    this.addDomainEvent(event);
  }
}

// Test implementation of DomainEvent
class TestDomainEvent extends DomainEvent {
  constructor(public readonly data: string) {
    super();
  }
}

describe('Entity', () => {
  describe('constructor and properties', () => {
    it('should create entity with provided id', () => {
      const entity = new TestEntity('test-id');

      expect(entity.id).toBe('test-id');
    });

    it('should handle different id types', () => {
      const stringEntity = new TestEntity('string-id');
      const numberEntity = new TestEntity('123');

      expect(stringEntity.id).toBe('string-id');
      expect(numberEntity.id).toBe('123');
    });
  });

  describe('equals', () => {
    it('should return true for entities with same id', () => {
      const entity1 = new TestEntity('same-id');
      const entity2 = new TestEntity('same-id');

      expect(entity1.equals(entity2)).toBe(true);
    });

    it('should return false for entities with different ids', () => {
      const entity1 = new TestEntity('id-1');
      const entity2 = new TestEntity('id-2');

      expect(entity1.equals(entity2)).toBe(false);
    });

    it('should return false when comparing with non-Entity object', () => {
      const entity = new TestEntity('test-id');
      const notEntity = { id: 'test-id' };

      expect(entity.equals(notEntity as unknown as Entity<string>)).toBe(false);
    });

    it('should return false when comparing with null or undefined', () => {
      const entity = new TestEntity('test-id');

      expect(entity.equals(null as unknown as Entity<string>)).toBe(false);
      expect(entity.equals(undefined as unknown as Entity<string>)).toBe(false);
    });
  });
});

describe('AggregateRoot', () => {
  describe('domain events management', () => {
    it('should start with empty domain events', () => {
      const aggregate = new TestAggregateRoot(1);

      expect(aggregate.domainEvents).toHaveLength(0);
    });

    it('should add domain events', () => {
      const aggregate = new TestAggregateRoot(1);
      const event1 = new TestDomainEvent('event-1');
      const event2 = new TestDomainEvent('event-2');

      aggregate.addTestEvent(event1);
      aggregate.addTestEvent(event2);

      expect(aggregate.domainEvents).toHaveLength(2);
      expect(aggregate.domainEvents[0]).toBe(event1);
      expect(aggregate.domainEvents[1]).toBe(event2);
    });

    it('should clear all domain events', () => {
      const aggregate = new TestAggregateRoot(1);
      const event = new TestDomainEvent('test-event');

      aggregate.addTestEvent(event);
      expect(aggregate.domainEvents).toHaveLength(1);

      aggregate.clearEvents();
      expect(aggregate.domainEvents).toHaveLength(0);
    });

    it('should return readonly array of domain events', () => {
      const aggregate = new TestAggregateRoot(1);
      const events = aggregate.domainEvents;

      expect(Array.isArray(events)).toBe(true);
      // Should be readonly, so modifying methods should not be available
      expect(events).toBeInstanceOf(Array);
    });
  });

  describe('inheritance from Entity', () => {
    it('should inherit Entity functionality', () => {
      const aggregate1 = new TestAggregateRoot(42);
      const aggregate2 = new TestAggregateRoot(42);
      const aggregate3 = new TestAggregateRoot(43);

      expect(aggregate1.id).toBe(42);
      expect(aggregate1.equals(aggregate2)).toBe(true);
      expect(aggregate1.equals(aggregate3)).toBe(false);
    });
  });
});

describe('DomainEvent', () => {
  describe('constructor and properties', () => {
    it('should set occurredOn to current date', () => {
      const beforeCreation = new Date();
      const event = new TestDomainEvent('test-data');
      const afterCreation = new Date();

      expect(event.occurredOn).toBeInstanceOf(Date);
      expect(event.occurredOn.getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime()
      );
      expect(event.occurredOn.getTime()).toBeLessThanOrEqual(
        afterCreation.getTime()
      );
    });

    it('should preserve event data', () => {
      const event = new TestDomainEvent('important-data');

      expect(event.data).toBe('important-data');
    });

    it('should create unique timestamps for different events', async () => {
      const event1 = new TestDomainEvent('event-1');
      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 2));
      const event2 = new TestDomainEvent('event-2');

      expect(event2.occurredOn.getTime()).toBeGreaterThan(
        event1.occurredOn.getTime()
      );
    });
  });
});
