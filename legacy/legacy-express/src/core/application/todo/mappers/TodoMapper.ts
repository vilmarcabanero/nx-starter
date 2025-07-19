import { Todo } from '@/core/domain/todo/entities/Todo';
import type { TodoDto } from '@/core/application/todo/dto/TodoDto';

/**
 * Mapper for converting between Todo entities and DTOs
 */
export class TodoMapper {
  /**
   * Maps a Todo entity to a TodoDto
   */
  static toDto(todo: Todo): TodoDto {
    return {
      id: todo.stringId || '',
      title: todo.titleValue,
      completed: todo.completed,
      priority: todo.priority.level,
      createdAt: todo.createdAt.toISOString(),
      dueDate: todo.dueDate?.toISOString(),
    };
  }

  /**
   * Maps an array of Todo entities to TodoDtos
   */
  static toDtoArray(todos: Todo[]): TodoDto[] {
    return todos.map(todo => this.toDto(todo));
  }

  /**
   * Maps a plain object from database to Todo entity
   * This method is useful for ORM mapping
   */
  static fromPlainObject(obj: {
    id: string;
    title: string;
    completed: boolean;
    createdAt: Date;
    priority?: string;
    dueDate?: Date;
  }): Todo {
    return new Todo(
      obj.title,
      obj.completed,
      obj.createdAt,
      obj.id,
      (obj.priority as any) || 'medium',
      obj.dueDate
    );
  }

  /**
   * Maps Todo entity to plain object for database storage
   */
  static toPlainObject(
    todo: Todo,
    id?: string
  ): {
    id?: string;
    title: string;
    completed: boolean;
    createdAt: Date;
    priority: string;
    dueDate?: Date;
  } {
    return {
      ...(id && { id }),
      title: todo.titleValue,
      completed: todo.completed,
      createdAt: todo.createdAt,
      priority: todo.priority.level,
      dueDate: todo.dueDate,
    };
  }
}
