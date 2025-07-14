import { Todo } from '@/core/domain/todo/entities/Todo';

export interface ITodoRepository {
  getAll(): Promise<Todo[]>;
  create(todo: Todo): Promise<string>;
  update(id: string, changes: Partial<Todo>): Promise<void>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<Todo | undefined>;
  getActive(): Promise<Todo[]>;
  getCompleted(): Promise<Todo[]>;
  count(): Promise<number>;
  countActive(): Promise<number>;
  countCompleted(): Promise<number>;
}