import { Todo } from '../entities/Todo';

export interface ITodoRepository {
  getAll(): Promise<Todo[]>;
  create(todo: Todo): Promise<number>;
  update(id: number, changes: Partial<Todo>): Promise<void>;
  delete(id: number): Promise<void>;
  getById(id: number): Promise<Todo | undefined>;
  getActive(): Promise<Todo[]>;
  getCompleted(): Promise<Todo[]>;
}
