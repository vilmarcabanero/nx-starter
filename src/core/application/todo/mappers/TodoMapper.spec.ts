import { describe, it, expect } from 'vitest';
import { TodoMapper } from './TodoMapper';
import { Todo } from '@/core/domain/todo/entities/Todo';
import type { TodoDto, CreateTodoDto } from '@/core/application/todo/dto/TodoDto';
import { TEST_UUIDS, generateTestUuid } from '@/test/test-helpers';

describe('TodoMapper', () => {
  describe('toDto', () => {
    it('should map Todo entity to TodoDto', () => {
      // Arrange
      const todoId = TEST_UUIDS.TODO_1;
      const todo = new Todo('Test Todo', false, new Date('2024-01-01T10:00:00Z'), todoId, 'medium');

      // Act
      const dto = TodoMapper.toDto(todo);

      // Assert
      expect(dto).toEqual({
        id: todoId,
        title: 'Test Todo',
        completed: false,
        priority: 'medium',
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      });
    });

    it('should handle completed todo', () => {
      // Arrange
      const todoId = TEST_UUIDS.TODO_2;
      const todo = new Todo('Completed Todo', true, new Date('2024-01-02T15:30:00Z'), todoId, 'high');

      // Act
      const dto = TodoMapper.toDto(todo);

      // Assert
      expect(dto.completed).toBe(true);
      expect(dto.title).toBe('Completed Todo');
      expect(dto.priority).toBe('high');
      expect(dto.id).toBe(todoId);
    });

    it('should handle todo without id', () => {
      // Arrange
      const todo = new Todo('No ID Todo', false, new Date('2024-01-03T08:15:00Z'), undefined, 'low');

      // Act
      const dto = TodoMapper.toDto(todo);

      // Assert
      expect(dto.id).toBe('');
      expect(dto.title).toBe('No ID Todo');
      expect(dto.completed).toBe(false);
      expect(dto.priority).toBe('low');
    });

    it('should handle different priority levels', () => {
      // Arrange
      const lowPriorityTodo = new Todo('Low Priority', false, new Date(), TEST_UUIDS.TODO_1, 'low');
      const mediumPriorityTodo = new Todo('Medium Priority', false, new Date(), TEST_UUIDS.TODO_2, 'medium');
      const highPriorityTodo = new Todo('High Priority', false, new Date(), TEST_UUIDS.TODO_3, 'high');

      // Act
      const lowDto = TodoMapper.toDto(lowPriorityTodo);
      const mediumDto = TodoMapper.toDto(mediumPriorityTodo);
      const highDto = TodoMapper.toDto(highPriorityTodo);

      // Assert
      expect(lowDto.priority).toBe('low');
      expect(mediumDto.priority).toBe('medium');
      expect(highDto.priority).toBe('high');
    });

    it('should format dates correctly', () => {
      // Arrange
      const specificDate = new Date('2024-07-13T14:30:45.123Z');
      const todoId = TEST_UUIDS.TODO_4;
      const todo = new Todo('Date Test', false, specificDate, todoId, 'medium');

      // Act
      const dto = TodoMapper.toDto(todo);

      // Assert
      expect(dto.createdAt).toBe('2024-07-13T14:30:45.123Z');
      expect(dto.updatedAt).toBe('2024-07-13T14:30:45.123Z');
    });
  });

  describe('toDtoArray', () => {
    it('should map array of Todo entities to TodoDto array', () => {
      // Arrange
      const todos = [
        new Todo('Todo 1', false, new Date('2024-01-01'), TEST_UUIDS.TODO_1, 'high'),
        new Todo('Todo 2', true, new Date('2024-01-02'), TEST_UUIDS.TODO_2, 'medium'),
        new Todo('Todo 3', false, new Date('2024-01-03'), TEST_UUIDS.TODO_3, 'low'),
      ];

      // Act
      const dtos = TodoMapper.toDtoArray(todos);

      // Assert
      expect(dtos).toHaveLength(3);
      expect(dtos[0].title).toBe('Todo 1');
      expect(dtos[0].completed).toBe(false);
      expect(dtos[0].priority).toBe('high');
      expect(dtos[1].title).toBe('Todo 2');
      expect(dtos[1].completed).toBe(true);
      expect(dtos[1].priority).toBe('medium');
      expect(dtos[2].title).toBe('Todo 3');
      expect(dtos[2].completed).toBe(false);
      expect(dtos[2].priority).toBe('low');
    });

    it('should handle empty array', () => {
      // Arrange
      const todos: Todo[] = [];

      // Act
      const dtos = TodoMapper.toDtoArray(todos);

      // Assert
      expect(dtos).toEqual([]);
    });

    it('should handle single todo array', () => {
      // Arrange
      const todos = [new Todo('Single Todo', false, new Date(), TEST_UUIDS.TODO_5, 'medium')];

      // Act
      const dtos = TodoMapper.toDtoArray(todos);

      // Assert
      expect(dtos).toHaveLength(1);
      expect(dtos[0].title).toBe('Single Todo');
    });
  });

  describe('toDomain', () => {
    it('should map TodoDto to Todo entity', () => {
      // Arrange
      const dto: TodoDto = {
        id: TEST_UUIDS.TODO_1,
        title: 'DTO Todo',
        completed: true,
        priority: 'high',
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T12:00:00.000Z',
      };

      // Act
      const todo = TodoMapper.toDomain(dto);

      // Assert
      expect(todo.title.value).toBe('DTO Todo');
      expect(todo.completed).toBe(true);
      expect(todo.id?.value).toBe(TEST_UUIDS.TODO_1);
      expect(todo.createdAt).toEqual(new Date('2024-01-01T10:00:00.000Z'));
      expect(todo.priority.level).toBe('high');
    });

    it('should handle incomplete todo from DTO', () => {
      // Arrange
      const dto: TodoDto = {
        id: TEST_UUIDS.TODO_5,
        title: 'Incomplete Todo',
        completed: false,
        priority: 'low',
        createdAt: '2024-02-01T08:00:00.000Z',
        updatedAt: '2024-02-01T08:00:00.000Z',
      };

      // Act
      const todo = TodoMapper.toDomain(dto);

      // Assert
      expect(todo.title.value).toBe('Incomplete Todo');
      expect(todo.completed).toBe(false);
      expect(todo.id?.value).toBe(TEST_UUIDS.TODO_5);
      expect(todo.priority.level).toBe('low');
    });

    it('should handle empty id string', () => {
      // Arrange
      const dto: TodoDto = {
        id: '',
        title: 'No ID Todo',
        completed: false,
        priority: 'medium',
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };

      // Act
      const todo = TodoMapper.toDomain(dto);

      // Assert
      expect(todo.title.value).toBe('No ID Todo');
      expect(todo.id).toBeUndefined(); // Should be undefined for empty string
      expect(todo.completed).toBe(false);
    });

    it('should parse dates correctly', () => {
      // Arrange
      const dto: TodoDto = {
        id: TEST_UUIDS.TODO_1,
        title: 'Date Test',
        completed: false,
        priority: 'medium',
        createdAt: '2024-07-13T14:30:45.123Z',
        updatedAt: '2024-07-13T15:00:00.000Z',
      };

      // Act
      const todo = TodoMapper.toDomain(dto);

      // Assert
      expect(todo.createdAt).toEqual(new Date('2024-07-13T14:30:45.123Z'));
    });
  });

  describe('createToDomain', () => {
    it('should map CreateTodoDto to new Todo entity', () => {
      // Arrange
      const createDto: CreateTodoDto = {
        title: 'New Todo',
        priority: 'high',
      };

      // Act
      const todo = TodoMapper.createToDomain(createDto);

      // Assert
      expect(todo.title.value).toBe('New Todo');
      expect(todo.completed).toBe(false);
      expect(todo.priority.level).toBe('high');
      expect(todo.id).toBeUndefined();
      expect(todo.createdAt).toBeInstanceOf(Date);
    });

    it('should handle minimal CreateTodoDto', () => {
      // Arrange
      const createDto: CreateTodoDto = {
        title: 'Minimal Todo',
      };

      // Act
      const todo = TodoMapper.createToDomain(createDto);

      // Assert
      expect(todo.title.value).toBe('Minimal Todo');
      expect(todo.completed).toBe(false);
      expect(todo.id).toBeUndefined();
      expect(todo.createdAt).toBeInstanceOf(Date);
    });

    it('should set completed to false for new todos', () => {
      // Arrange
      const createDto: CreateTodoDto = {
        title: 'Auto-incomplete Todo',
        priority: 'medium',
      };

      // Act
      const todo = TodoMapper.createToDomain(createDto);

      // Assert
      expect(todo.completed).toBe(false);
    });

    it('should create todo with current timestamp', () => {
      // Arrange
      const beforeCreation = new Date();
      const createDto: CreateTodoDto = {
        title: 'Timestamp Test',
        priority: 'low',
      };

      // Act
      const todo = TodoMapper.createToDomain(createDto);
      const afterCreation = new Date();

      // Assert
      expect(todo.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(todo.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    });
  });

  describe('round-trip mapping', () => {
    it('should maintain data integrity through toDomain -> toDto', () => {
      // Arrange
      const originalDto: TodoDto = {
        id: generateTestUuid(42),
        title: 'Round Trip Test',
        completed: true,
        priority: 'medium',
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };

      // Act
      const todo = TodoMapper.toDomain(originalDto);
      const resultDto = TodoMapper.toDto(todo);

      // Assert
      expect(resultDto.id).toBe(originalDto.id);
      expect(resultDto.title).toBe(originalDto.title);
      expect(resultDto.completed).toBe(originalDto.completed);
      expect(resultDto.priority).toBe(originalDto.priority);
      expect(resultDto.createdAt).toBe(originalDto.createdAt);
    });

    it('should maintain data integrity through createToDomain -> toDto', () => {
      // Arrange
      const createDto: CreateTodoDto = {
        title: 'Create Round Trip',
        priority: 'high',
      };

      // Act
      const todo = TodoMapper.createToDomain(createDto);
      const resultDto = TodoMapper.toDto(todo);

      // Assert
      expect(resultDto.title).toBe(createDto.title);
      expect(resultDto.priority).toBe(createDto.priority);
      expect(resultDto.completed).toBe(false);
      expect(resultDto.id).toBe(''); // No ID for newly created todos
    });
  });
});
