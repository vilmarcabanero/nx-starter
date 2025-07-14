import { Todo } from '@/core/domain/todo/entities/Todo';
import type { TodoDto, CreateTodoDto } from '@/core/application/todo/dto/TodoDto';
import { type TodoPriorityLevel } from '@/core/domain/todo/value-objects/TodoPriority';

export class TodoMapper {
  static toDto(todo: Todo): TodoDto {
    return {
      id: todo.id?.value.toString() || '',
      title: todo.title.value,
      completed: todo.completed,
      priority: todo.priority.toString(),
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.createdAt.toISOString() // Using createdAt since Todo doesn't have updatedAt
    };
  }

  static toDtoArray(todos: Todo[]): TodoDto[] {
    return todos.map(this.toDto);
  }

  static toDomain(dto: TodoDto): Todo {
    const numericId = dto.id ? parseInt(dto.id) : undefined;
    return new Todo(
      dto.title,
      dto.completed,
      new Date(dto.createdAt),
      numericId,
      dto.priority as TodoPriorityLevel
    );
  }

  static createToDomain(dto: CreateTodoDto): Todo {
    return new Todo(
      dto.title,
      false,
      new Date(),
      undefined,
      dto.priority as TodoPriorityLevel
    );
  }
}
