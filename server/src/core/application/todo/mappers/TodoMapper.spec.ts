import { describe, it, expect } from 'vitest';
import { TodoMapper } from './TodoMapper';
import { Todo } from '@/core/domain/todo/entities/Todo';

describe('TodoMapper', () => {
  describe('toDto', () => {
    it('should map Todo entity to TodoDto with all fields', () => {
      const createdAt = new Date('2020-01-01T00:00:00.000Z');
      const dueDate = new Date('2020-01-02T00:00:00.000Z');
      const todo = new Todo(
        'Test Todo',
        false,
        createdAt,
        'test-id',
        'high',
        dueDate
      );

      const dto = TodoMapper.toDto(todo);

      expect(dto.id).toBe('test-id');
      expect(dto.title).toBe('Test Todo');
      expect(dto.completed).toBe(false);
      expect(dto.priority).toBe('high');
      expect(dto.createdAt).toBe('2020-01-01T00:00:00.000Z');
      expect(dto.dueDate).toBe('2020-01-02T00:00:00.000Z');
    });

    it('should map Todo entity to TodoDto without due date', () => {
      const createdAt = new Date('2020-01-01T00:00:00.000Z');
      const todo = new Todo(
        'Test Todo',
        false,
        createdAt,
        'test-id',
        'medium'
      );

      const dto = TodoMapper.toDto(todo);

      expect(dto.id).toBe('test-id');
      expect(dto.title).toBe('Test Todo');
      expect(dto.completed).toBe(false);
      expect(dto.priority).toBe('medium');
      expect(dto.createdAt).toBe('2020-01-01T00:00:00.000Z');
      expect(dto.dueDate).toBeUndefined();
    });

    it('should handle todo without id', () => {
      const todo = new Todo('Test Todo', false);

      const dto = TodoMapper.toDto(todo);

      expect(dto.id).toBe('');
      expect(dto.title).toBe('Test Todo');
      expect(dto.completed).toBe(false);
      expect(dto.priority).toBe('medium');
    });

    it('should map completed todo', () => {
      const todo = new Todo('Completed Todo', true, new Date(), 'test-id', 'low');

      const dto = TodoMapper.toDto(todo);

      expect(dto.completed).toBe(true);
      expect(dto.priority).toBe('low');
    });
  });

  describe('toDtoArray', () => {
    it('should map array of Todo entities to TodoDtos', () => {
      const todos = [
        new Todo('Todo 1', false, new Date(), '1', 'high'),
        new Todo('Todo 2', true, new Date(), '2', 'low'),
        new Todo('Todo 3', false, new Date(), '3', 'medium')
      ];

      const dtos = TodoMapper.toDtoArray(todos);

      expect(dtos).toHaveLength(3);
      expect(dtos[0].id).toBe('1');
      expect(dtos[0].title).toBe('Todo 1');
      expect(dtos[0].completed).toBe(false);
      expect(dtos[0].priority).toBe('high');

      expect(dtos[1].id).toBe('2');
      expect(dtos[1].completed).toBe(true);
      expect(dtos[1].priority).toBe('low');
    });

    it('should handle empty array', () => {
      const dtos = TodoMapper.toDtoArray([]);
      expect(dtos).toHaveLength(0);
    });
  });

  describe('fromPlainObject', () => {
    it('should map plain object to Todo entity with all fields', () => {
      const plainObject = {
        id: 'test-id',
        title: 'Test Todo',
        completed: false,
        createdAt: new Date('2020-01-01'),
        priority: 'high',
        dueDate: new Date('2020-01-02')
      };

      const todo = TodoMapper.fromPlainObject(plainObject);

      expect(todo.stringId).toBe('test-id');
      expect(todo.titleValue).toBe('Test Todo');
      expect(todo.completed).toBe(false);
      expect(todo.priority.level).toBe('high');
      expect(todo.createdAt).toEqual(new Date('2020-01-01'));
      expect(todo.dueDate).toEqual(new Date('2020-01-02'));
    });

    it('should map plain object without optional fields', () => {
      const plainObject = {
        id: 'test-id',
        title: 'Test Todo',
        completed: true,
        createdAt: new Date('2020-01-01')
      };

      const todo = TodoMapper.fromPlainObject(plainObject);

      expect(todo.stringId).toBe('test-id');
      expect(todo.titleValue).toBe('Test Todo');
      expect(todo.completed).toBe(true);
      expect(todo.priority.level).toBe('medium'); // Default priority
      expect(todo.dueDate).toBeUndefined();
    });

    it('should handle different priority values', () => {
      const lowPriorityObj = {
        id: 'test-id',
        title: 'Low Priority Todo',
        completed: false,
        createdAt: new Date(),
        priority: 'low'
      };

      const todo = TodoMapper.fromPlainObject(lowPriorityObj);
      expect(todo.priority.level).toBe('low');
    });
  });

  describe('toPlainObject', () => {
    it('should map Todo entity to plain object with all fields', () => {
      const createdAt = new Date('2020-01-01');
      const dueDate = new Date('2020-01-02');
      const todo = new Todo(
        'Test Todo',
        false,
        createdAt,
        'test-id',
        'high',
        dueDate
      );

      const plainObject = TodoMapper.toPlainObject(todo);

      expect(plainObject.title).toBe('Test Todo');
      expect(plainObject.completed).toBe(false);
      expect(plainObject.priority).toBe('high');
      expect(plainObject.createdAt).toBe(createdAt);
      expect(plainObject.dueDate).toBe(dueDate);
      expect(plainObject.id).toBeUndefined(); // ID not included unless provided
    });

    it('should map Todo entity to plain object with provided id', () => {
      const todo = new Todo('Test Todo', false, new Date(), undefined, 'medium');

      const plainObject = TodoMapper.toPlainObject(todo, 'new-id');

      expect(plainObject.id).toBe('new-id');
      expect(plainObject.title).toBe('Test Todo');
      expect(plainObject.completed).toBe(false);
      expect(plainObject.priority).toBe('medium');
    });

    it('should map Todo entity without due date', () => {
      const todo = new Todo('Test Todo', true, new Date(), 'test-id', 'low');

      const plainObject = TodoMapper.toPlainObject(todo);

      expect(plainObject.title).toBe('Test Todo');
      expect(plainObject.completed).toBe(true);
      expect(plainObject.priority).toBe('low');
      expect(plainObject.dueDate).toBeUndefined();
    });

    it('should not include id when not provided', () => {
      const todo = new Todo('Test Todo', false, new Date(), 'test-id', 'medium');

      const plainObject = TodoMapper.toPlainObject(todo);

      expect(plainObject).not.toHaveProperty('id');
      expect(plainObject.title).toBe('Test Todo');
    });
  });

  describe('edge cases', () => {
    it('should handle todos with special characters in title', () => {
      const todo = new Todo('Special chars: @#$% émojis 🚀', false, new Date(), 'test-id', 'high');

      const dto = TodoMapper.toDto(todo);
      expect(dto.title).toBe('Special chars: @#$% émojis 🚀');

      const plainObject = TodoMapper.toPlainObject(todo);
      expect(plainObject.title).toBe('Special chars: @#$% émojis 🚀');
    });

    it('should handle dates correctly in ISO format', () => {
      const specificDate = new Date('2020-06-15T14:30:00.123Z');
      const todo = new Todo('Date Test', false, specificDate, 'test-id', 'medium');

      const dto = TodoMapper.toDto(todo);
      expect(dto.createdAt).toBe('2020-06-15T14:30:00.123Z');
    });
  });
});