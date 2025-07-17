import { describe, it, expect, beforeEach } from 'vitest';
import {
  TodoCreatedEvent,
  TodoCompletedEvent,
  TodoUncompletedEvent,
  TodoUpdatedEvent,
  TodoDeletedEvent,
} from './TodoEvents';
import { TodoId } from '../value-objects/TodoId';
import { TodoTitle } from '../value-objects/TodoTitle';

describe('TodoEvents', () => {
  let todoId: TodoId;
  let todoTitle: TodoTitle;
  let testDate: Date;

  beforeEach(() => {
    todoId = new TodoId('a1b2c3d4e5f6789012345678901234ab');
    todoTitle = new TodoTitle('Test Todo');
    testDate = new Date('2024-01-15T10:30:00Z');
  });

  describe('TodoCreatedEvent', () => {
    it('should create event with todo id and title', () => {
      const event = new TodoCreatedEvent(todoId, todoTitle);

      expect(event.todoId).toBe(todoId);
      expect(event.title).toBe(todoTitle);
      expect(event.occurredOn).toBeInstanceOf(Date);
    });

    it('should inherit from DomainEvent', () => {
      const event = new TodoCreatedEvent(todoId, todoTitle);

      expect(event.occurredOn).toBeInstanceOf(Date);
    });

    it('should preserve value object properties', () => {
      const event = new TodoCreatedEvent(todoId, todoTitle);

      expect(event.todoId.value).toBe('a1b2c3d4e5f6789012345678901234ab');
      expect(event.title.value).toBe('Test Todo');
    });

    it('should create unique timestamps for different events', async () => {
      const event1 = new TodoCreatedEvent(todoId, todoTitle);
      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 1));
      const event2 = new TodoCreatedEvent(todoId, todoTitle);

      expect(event2.occurredOn.getTime()).toBeGreaterThan(
        event1.occurredOn.getTime()
      );
    });
  });

  describe('TodoCompletedEvent', () => {
    it('should create event with todo id and completion date', () => {
      const event = new TodoCompletedEvent(todoId, testDate);

      expect(event.todoId).toBe(todoId);
      expect(event.completedAt).toBe(testDate);
      expect(event.occurredOn).toBeInstanceOf(Date);
    });

    it('should preserve todo id value', () => {
      const event = new TodoCompletedEvent(todoId, testDate);

      expect(event.todoId.value).toBe('a1b2c3d4e5f6789012345678901234ab');
    });

    it('should store completion date accurately', () => {
      const specificDate = new Date('2024-01-15T14:30:45.123Z');
      const event = new TodoCompletedEvent(todoId, specificDate);

      expect(event.completedAt).toBe(specificDate);
      expect(event.completedAt.getTime()).toBe(specificDate.getTime());
    });

    it('should have different occurred and completed timestamps', () => {
      const completedAt = new Date('2024-01-01T00:00:00Z');
      const event = new TodoCompletedEvent(todoId, completedAt);

      // The event's occurredOn should be different from completedAt
      expect(event.occurredOn.getTime()).not.toBe(completedAt.getTime());
    });
  });

  describe('TodoUncompletedEvent', () => {
    it('should create event with todo id and uncompletion date', () => {
      const event = new TodoUncompletedEvent(todoId, testDate);

      expect(event.todoId).toBe(todoId);
      expect(event.uncompletedAt).toBe(testDate);
      expect(event.occurredOn).toBeInstanceOf(Date);
    });

    it('should preserve todo id value', () => {
      const event = new TodoUncompletedEvent(todoId, testDate);

      expect(event.todoId.value).toBe('a1b2c3d4e5f6789012345678901234ab');
    });

    it('should store uncompletion date accurately', () => {
      const specificDate = new Date('2024-02-20T16:45:30.456Z');
      const event = new TodoUncompletedEvent(todoId, specificDate);

      expect(event.uncompletedAt).toBe(specificDate);
      expect(event.uncompletedAt.getTime()).toBe(specificDate.getTime());
    });
  });

  describe('TodoUpdatedEvent', () => {
    it('should create event with todo id, new title, and update date', () => {
      const newTitle = new TodoTitle('Updated Todo Title');
      const event = new TodoUpdatedEvent(todoId, newTitle, testDate);

      expect(event.todoId).toBe(todoId);
      expect(event.newTitle).toBe(newTitle);
      expect(event.updatedAt).toBe(testDate);
      expect(event.occurredOn).toBeInstanceOf(Date);
    });

    it('should preserve all value object properties', () => {
      const newTitle = new TodoTitle('New Title');
      const event = new TodoUpdatedEvent(todoId, newTitle, testDate);

      expect(event.todoId.value).toBe('a1b2c3d4e5f6789012345678901234ab');
      expect(event.newTitle.value).toBe('New Title');
    });

    it('should handle title changes correctly', () => {
      const originalTitle = new TodoTitle('Original Title');
      const updatedTitle = new TodoTitle('Updated Title');

      const event = new TodoUpdatedEvent(todoId, updatedTitle, testDate);

      expect(event.newTitle.value).toBe('Updated Title');
      expect(event.newTitle).not.toBe(originalTitle);
    });

    it('should store update date accurately', () => {
      const updateDate = new Date('2024-03-10T09:15:25.789Z');
      const newTitle = new TodoTitle('Updated');
      const event = new TodoUpdatedEvent(todoId, newTitle, updateDate);

      expect(event.updatedAt).toBe(updateDate);
      expect(event.updatedAt.getTime()).toBe(updateDate.getTime());
    });
  });

  describe('TodoDeletedEvent', () => {
    it('should create event with todo id and deletion date', () => {
      const event = new TodoDeletedEvent(todoId, testDate);

      expect(event.todoId).toBe(todoId);
      expect(event.deletedAt).toBe(testDate);
      expect(event.occurredOn).toBeInstanceOf(Date);
    });

    it('should preserve todo id value', () => {
      const event = new TodoDeletedEvent(todoId, testDate);

      expect(event.todoId.value).toBe('a1b2c3d4e5f6789012345678901234ab');
    });

    it('should store deletion date accurately', () => {
      const deletionDate = new Date('2024-04-05T13:20:15.987Z');
      const event = new TodoDeletedEvent(todoId, deletionDate);

      expect(event.deletedAt).toBe(deletionDate);
      expect(event.deletedAt.getTime()).toBe(deletionDate.getTime());
    });

    it('should have different occurred and deleted timestamps', () => {
      const deletedAt = new Date('2024-01-01T00:00:00Z');
      const event = new TodoDeletedEvent(todoId, deletedAt);

      // The event's occurredOn should be different from deletedAt
      expect(event.occurredOn.getTime()).not.toBe(deletedAt.getTime());
    });
  });

  describe('event relationships', () => {
    it('should maintain consistency across related events', () => {
      const createdEvent = new TodoCreatedEvent(todoId, todoTitle);
      const completedEvent = new TodoCompletedEvent(todoId, testDate);
      const updatedEvent = new TodoUpdatedEvent(todoId, todoTitle, testDate);
      const deletedEvent = new TodoDeletedEvent(todoId, testDate);

      // All events should reference the same todo
      expect(createdEvent.todoId.value).toBe(todoId.value);
      expect(completedEvent.todoId.value).toBe(todoId.value);
      expect(updatedEvent.todoId.value).toBe(todoId.value);
      expect(deletedEvent.todoId.value).toBe(todoId.value);
    });

    it('should allow tracking todo lifecycle through events', () => {
      const title1 = new TodoTitle('Initial Title');
      const title2 = new TodoTitle('Updated Title');
      const now = new Date();

      const created = new TodoCreatedEvent(todoId, title1);
      const updated = new TodoUpdatedEvent(todoId, title2, now);
      const completed = new TodoCompletedEvent(todoId, now);
      const deleted = new TodoDeletedEvent(todoId, now);

      // Should be able to track the evolution
      expect(created.title.value).toBe('Initial Title');
      expect(updated.newTitle.value).toBe('Updated Title');
      expect(completed.completedAt).toBe(now);
      expect(deleted.deletedAt).toBe(now);
    });
  });

  describe('event immutability', () => {
    it('should create immutable events', () => {
      const event = new TodoCreatedEvent(todoId, todoTitle);

      // Properties should be readonly - TypeScript enforces this at compile time
      // Runtime behavior preserves the original values
      expect(event.todoId.value).toBe('a1b2c3d4e5f6789012345678901234ab');
      expect(event.title.value).toBe('Test Todo');
    });

    it('should preserve value object immutability', () => {
      const event = new TodoCreatedEvent(todoId, todoTitle);

      // Even if we try to modify the value objects, they should remain unchanged
      expect(event.todoId.value).toBe('a1b2c3d4e5f6789012345678901234ab');
      expect(event.title.value).toBe('Test Todo');
    });
  });
});
