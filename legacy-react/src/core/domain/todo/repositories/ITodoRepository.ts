import { Todo } from '@/core/domain/todo/entities/Todo';
import { type Specification } from '@/core/domain/todo/specifications/TodoSpecifications';

export interface ITodoRepository {
  getAll(): Promise<Todo[]>;
  create(todo: Todo): Promise<string>;
  update(id: string, changes: Partial<Todo>): Promise<void>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<Todo | undefined>;
  getActive(): Promise<Todo[]>;
  getCompleted(): Promise<Todo[]>;
  findBySpecification(specification: Specification<Todo>): Promise<Todo[]>;
}
