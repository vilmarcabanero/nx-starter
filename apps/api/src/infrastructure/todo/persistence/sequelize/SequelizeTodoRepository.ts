import { injectable } from 'tsyringe';
import { Todo } from '@nx-starter/domain';
import type { ITodoRepository } from '@nx-starter/domain';
import type { Specification } from '@nx-starter/domain';
import { TodoSequelizeModel } from './TodoModel';
import { generateUUID } from '@nx-starter/utils-core';

/**
 * Sequelize implementation of ITodoRepository
 * Supports MySQL, PostgreSQL, SQLite via Sequelize ORM
 */
@injectable()
export class SequelizeTodoRepository implements ITodoRepository {
  async getAll(): Promise<Todo[]> {
    const models = await TodoSequelizeModel.findAll({
      order: [['createdAt', 'DESC']],
      raw: true,
    });

    return models.map(this.toDomain);
  }

  async create(todo: Todo): Promise<string> {
    const id = generateUUID();

    const created = await TodoSequelizeModel.create({
      id,
      title: todo.titleValue,
      completed: todo.completed,
      createdAt: todo.createdAt,
      priority: todo.priority.level,
      dueDate: todo.dueDate,
    });

    // Return the actual ID (important for PostgreSQL auto-generated UUIDs)
    return created.get('id') as string;
  }

  async update(id: string, changes: Partial<Todo>): Promise<void> {
    const updateData: any = {};

    if (changes.title !== undefined) {
      updateData.title =
        typeof changes.title === 'string'
          ? changes.title
          : (changes.title as any).value;
    }
    if (changes.completed !== undefined) {
      updateData.completed = changes.completed;
    }
    if (changes.priority !== undefined) {
      updateData.priority =
        typeof changes.priority === 'string'
          ? changes.priority
          : (changes.priority as any).level;
    }
    if (changes.dueDate !== undefined) {
      updateData.dueDate = changes.dueDate;
    }

    const [affectedCount] = await TodoSequelizeModel.update(updateData, {
      where: { id },
    });

    if (affectedCount === 0) {
      throw new Error(`Todo with ID ${id} not found`);
    }
  }

  async delete(id: string): Promise<void> {
    const deletedCount = await TodoSequelizeModel.destroy({
      where: { id },
    });

    if (deletedCount === 0) {
      throw new Error(`Todo with ID ${id} not found`);
    }
  }

  async getById(id: string): Promise<Todo | undefined> {
    const model = await TodoSequelizeModel.findByPk(id, { raw: true });
    return model ? this.toDomain(model) : undefined;
  }

  async getActive(): Promise<Todo[]> {
    const models = await TodoSequelizeModel.findAll({
      where: { completed: false },
      order: [['createdAt', 'DESC']],
      raw: true,
    });

    return models.map(this.toDomain);
  }

  async getCompleted(): Promise<Todo[]> {
    const models = await TodoSequelizeModel.findAll({
      where: { completed: true },
      order: [['createdAt', 'DESC']],
      raw: true,
    });

    return models.map(this.toDomain);
  }

  async count(): Promise<number> {
    return await TodoSequelizeModel.count();
  }

  async countActive(): Promise<number> {
    return await TodoSequelizeModel.count({
      where: { completed: false },
    });
  }

  async countCompleted(): Promise<number> {
    return await TodoSequelizeModel.count({
      where: { completed: true },
    });
  }

  async findBySpecification(
    specification: Specification<Todo>
  ): Promise<Todo[]> {
    // For Sequelize, we'll fetch all and filter in memory
    // In a real implementation, you'd translate specifications to SQL
    const allTodos = await this.getAll();
    return allTodos
      .filter((todo) => specification.isSatisfiedBy(todo))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Converts Sequelize model to domain object
   */
  private toDomain(model: any): Todo {
    return new Todo(
      model.title,
      Boolean(model.completed), // Convert SQLite integer to boolean
      model.createdAt instanceof Date
        ? model.createdAt
        : new Date(model.createdAt),
      model.id,
      model.priority,
      model.dueDate
        ? model.dueDate instanceof Date
          ? model.dueDate
          : new Date(model.dueDate)
        : undefined
    );
  }
}
