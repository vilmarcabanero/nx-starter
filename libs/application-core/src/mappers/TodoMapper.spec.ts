import { describe, it, expect } from 'vitest';
import { TodoMapper } from './TodoMapper';
import { Todo, TodoTitle } from '@nx-starter/domain';
import type { TodoDto, CreateTodoDto } from '../dto/TodoDto';
import { TEST_UUIDS } from '@nx-starter/utils-core';

describe('TodoMapper', () => {
  const sampleTodo = new Todo(
    new TodoTitle('Sample todo'),
    false,
    new Date('2025-01-01T00:00:00.000Z'),
    TEST_UUIDS.MAPPER_TODO_1,
    'high',
    new Date('2025-12-31T23:59:59.000Z')
  );

  describe('toDto', () => {
    it('should convert Todo entity to TodoDto', () => {
      // Act
      const dto = TodoMapper.toDto(sampleTodo);

      // Assert
      expect(dto).toEqual({
        id: TEST_UUIDS.MAPPER_TODO_1,
        title: 'Sample todo',
        completed: false,
        priority: 'high',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        dueDate: '2025-12-31T23:59:59.000Z',
      });
    });

    it('should handle todo without ID', () => {
      // Arrange
      const todoWithoutId = new Todo(
        new TodoTitle('Todo without ID'),
        true,
        new Date('2025-01-01T00:00:00.000Z'),
        undefined,
        'medium',
        undefined
      );

      // Act
      const dto = TodoMapper.toDto(todoWithoutId);

      // Assert
      expect(dto.id).toBe('');
      expect(dto.title).toBe('Todo without ID');
      expect(dto.completed).toBe(true);
      expect(dto.priority).toBe('medium');
      expect(dto.dueDate).toBeUndefined();
    });
  });

  describe('toDtoArray', () => {
    it('should convert array of Todo entities to TodoDto array', () => {
      // Arrange
      const todos = [sampleTodo];

      // Act
      const dtos = TodoMapper.toDtoArray(todos);

      // Assert
      expect(dtos).toHaveLength(1);
      expect(dtos[0]).toEqual(TodoMapper.toDto(sampleTodo));
    });

    it('should handle empty array', () => {
      // Act
      const dtos = TodoMapper.toDtoArray([]);

      // Assert
      expect(dtos).toEqual([]);
    });
  });

  describe('toDomain', () => {
    it('should convert TodoDto to Todo entity', () => {
      // Arrange
      const dto: TodoDto = {
        id: TEST_UUIDS.MAPPER_TODO_2,
        title: 'DTO todo',
        completed: true,
        priority: 'low',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T12:00:00.000Z',
        dueDate: '2025-12-31T23:59:59.000Z',
      };

      // Act
      const todo = TodoMapper.toDomain(dto);

      // Assert
      expect(todo.title.value).toBe('DTO todo');
      expect(todo.completed).toBe(true);
      expect(todo.priority.level).toBe('low');
      expect(todo.createdAt).toEqual(new Date('2025-01-01T00:00:00.000Z'));
      expect(todo.dueDate).toEqual(new Date('2025-12-31T23:59:59.000Z'));
      expect(todo.id?.value).toBe(TEST_UUIDS.MAPPER_TODO_2);
    });

    it('should handle dto without ID and dueDate', () => {
      // Arrange
      const dto: TodoDto = {
        id: '',
        title: 'Simple todo',
        completed: false,
        priority: 'medium',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      // Act
      const todo = TodoMapper.toDomain(dto);

      // Assert
      expect(todo.title.value).toBe('Simple todo');
      expect(todo.id).toBeUndefined();
      expect(todo.dueDate).toBeUndefined();
    });
  });

  describe('createToDomain', () => {
    it('should convert CreateTodoDto to Todo entity', () => {
      // Arrange
      const dto: CreateTodoDto = {
        title: 'New todo',
        priority: 'high',
        dueDate: '2025-12-31T23:59:59.000Z',
      };

      // Act
      const todo = TodoMapper.createToDomain(dto);

      // Assert
      expect(todo.title.value).toBe('New todo');
      expect(todo.completed).toBe(false);
      expect(todo.priority.level).toBe('high');
      expect(todo.dueDate).toEqual(new Date('2025-12-31T23:59:59.000Z'));
      expect(todo.id).toBeUndefined();
      expect(todo.createdAt).toBeInstanceOf(Date);
    });

    it('should handle CreateTodoDto without optional fields', () => {
      // Arrange
      const dto: CreateTodoDto = {
        title: 'Minimal todo',
      };

      // Act
      const todo = TodoMapper.createToDomain(dto);

      // Assert
      expect(todo.title.value).toBe('Minimal todo');
      expect(todo.completed).toBe(false);
      expect(todo.priority.level).toBe('medium'); // Default priority
      expect(todo.dueDate).toBeUndefined();
    });
  });

  describe('fromPlainObject', () => {
    it('should convert plain object to Todo entity', () => {
      // Arrange
      const plainObject = {
        id: TEST_UUIDS.MAPPER_TODO_3,
        title: 'Plain object todo',
        completed: true,
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
        priority: 'high',
        dueDate: new Date('2025-12-31T23:59:59.000Z'),
      };

      // Act
      const todo = TodoMapper.fromPlainObject(plainObject);

      // Assert
      expect(todo.title.value).toBe('Plain object todo');
      expect(todo.completed).toBe(true);
      expect(todo.priority.level).toBe('high');
      expect(todo.createdAt).toEqual(new Date('2025-01-01T00:00:00.000Z'));
      expect(todo.dueDate).toEqual(new Date('2025-12-31T23:59:59.000Z'));
      expect(todo.id?.value).toBe(TEST_UUIDS.MAPPER_TODO_3);
    });

    it('should use default priority when not provided', () => {
      // Arrange
      const plainObject = {
        id: TEST_UUIDS.TODO_2,
        title: 'Todo without priority',
        completed: false,
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
      };

      // Act
      const todo = TodoMapper.fromPlainObject(plainObject);

      // Assert
      expect(todo.priority.level).toBe('medium');
    });
  });

  describe('toPlainObject', () => {
    it('should convert Todo entity to plain object', () => {
      // Act
      const plainObject = TodoMapper.toPlainObject(sampleTodo);

      // Assert
      expect(plainObject).toEqual({
        title: 'Sample todo',
        completed: false,
        createdAt: sampleTodo.createdAt,
        priority: 'high',
        dueDate: new Date('2025-12-31T23:59:59.000Z'),
      });
    });

    it('should include ID when provided', () => {
      // Arrange
      const id = TEST_UUIDS.TODO_3;

      // Act
      const plainObject = TodoMapper.toPlainObject(sampleTodo, id);

      // Assert
      expect(plainObject).toEqual({
        id: TEST_UUIDS.TODO_3,
        title: 'Sample todo',
        completed: false,
        createdAt: sampleTodo.createdAt,
        priority: 'high',
        dueDate: new Date('2025-12-31T23:59:59.000Z'),
      });
    });

    it('should handle todo without dueDate', () => {
      // Arrange
      const todoWithoutDueDate = new Todo(
        new TodoTitle('No due date todo'),
        false,
        new Date('2025-01-01T00:00:00.000Z'),
        TEST_UUIDS.TODO_4,
        'low',
        undefined
      );

      // Act
      const plainObject = TodoMapper.toPlainObject(todoWithoutDueDate);

      // Assert
      expect(plainObject.dueDate).toBeUndefined();
    });
  });
});
