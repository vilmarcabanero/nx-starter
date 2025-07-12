import { Todo } from '@/core/domain/todo/entities/Todo';
import type { TodoDto, CreateTodoDto } from '@/core/application/todo/dto/TodoDto';

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
    return new Todo(
      dto.title,
      dto.completed,
      new Date(dto.createdAt),
      parseInt(dto.id),
      dto.priority as any // Will need proper mapping based on TodoPriority
    );
  }

  static createToDomain(dto: CreateTodoDto): Todo {
    return new Todo(
      dto.title,
      false,
      new Date(),
      undefined,
      dto.priority as any
    );
  }
}
