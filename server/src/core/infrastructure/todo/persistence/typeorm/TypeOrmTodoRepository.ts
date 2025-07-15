import { injectable } from 'tsyringe';
import { Repository, DataSource } from 'typeorm';
import { Todo } from '@/core/domain/todo/entities/Todo';
import type { ITodoRepository } from '@/core/domain/todo/repositories/ITodoRepository';
import { TodoEntity } from './TodoEntity';
import { generateId } from '@/utils/uuid';

/**
 * TypeORM implementation of ITodoRepository
 * Supports MySQL, PostgreSQL, SQLite via TypeORM
 */
@injectable()
export class TypeOrmTodoRepository implements ITodoRepository {
  private repository: Repository<TodoEntity>;

  constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(TodoEntity);
  }

  async getAll(): Promise<Todo[]> {
    const entities = await this.repository.find({
      order: { createdAt: 'DESC' },
    });
    return entities.map(this.toDomain);
  }

  async create(todo: Todo): Promise<string> {
    const id = generateId();
    const entity = this.repository.create({
      id,
      title: todo.titleValue,
      completed: todo.completed,
      createdAt: todo.createdAt,
      priority: todo.priority.level,
      dueDate: todo.dueDate,
    });

    await this.repository.save(entity);
    return id;
  }

  async update(id: string, changes: Partial<Todo>): Promise<void> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new Error(`Todo with ID ${id} not found`);
    }

    const updateData: Partial<TodoEntity> = {};

    if (changes.title !== undefined) {
      updateData.title =
        typeof changes.title === 'string' ? changes.title : (changes.title as any).value;
    }
    if (changes.completed !== undefined) {
      updateData.completed = changes.completed;
    }
    if (changes.priority !== undefined) {
      updateData.priority =
        typeof changes.priority === 'string' ? changes.priority : (changes.priority as any).level;
    }
    if (changes.dueDate !== undefined) {
      updateData.dueDate = changes.dueDate;
    }

    await this.repository.update(id, updateData);
  }

  async delete(id: string): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new Error(`Todo with ID ${id} not found`);
    }
  }

  async getById(id: string): Promise<Todo | undefined> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : undefined;
  }

  async getActive(): Promise<Todo[]> {
    const entities = await this.repository.find({
      where: { completed: false },
      order: { createdAt: 'DESC' },
    });
    return entities.map(this.toDomain);
  }

  async getCompleted(): Promise<Todo[]> {
    const entities = await this.repository.find({
      where: { completed: true },
      order: { createdAt: 'DESC' },
    });
    return entities.map(this.toDomain);
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }

  async countActive(): Promise<number> {
    return await this.repository.count({ where: { completed: false } });
  }

  async countCompleted(): Promise<number> {
    return await this.repository.count({ where: { completed: true } });
  }

  /**
   * Converts TypeORM entity to domain object
   */
  private toDomain(entity: TodoEntity): Todo {
    return new Todo(
      entity.title,
      entity.completed,
      entity.createdAt,
      entity.id,
      entity.priority as any,
      entity.dueDate
    );
  }
}
