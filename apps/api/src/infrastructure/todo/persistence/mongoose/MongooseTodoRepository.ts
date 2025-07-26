import { injectable } from 'tsyringe';
import mongoose from 'mongoose';
import { Todo } from '@nx-starter/domain';
import type { ITodoRepository } from '@nx-starter/domain';
import type { Specification } from '@nx-starter/domain';
import { TodoModel } from './TodoSchema';

/**
 * Mongoose implementation of ITodoRepository
 * For MongoDB NoSQL database
 */
@injectable()
export class MongooseTodoRepository implements ITodoRepository {
  async getAll(): Promise<Todo[]> {
    const documents = await TodoModel.find()
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return documents.map(this.toDomain);
  }

  async create(todo: Todo): Promise<string> {
    const document = new TodoModel({
      title: todo.titleValue,
      completed: todo.completed,
      createdAt: todo.createdAt,
      priority: todo.priority.level,
      dueDate: todo.dueDate,
    });

    const saved = await document.save();
    return saved._id.toString();
  }

  async update(id: string, changes: Partial<Todo>): Promise<void> {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`Todo with ID ${id} not found`);
    }

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

    const result = await TodoModel.updateOne({ _id: id }, updateData).exec();

    if (result.matchedCount === 0) {
      throw new Error(`Todo with ID ${id} not found`);
    }
  }

  async delete(id: string): Promise<void> {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`Todo with ID ${id} not found`);
    }

    const result = await TodoModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      throw new Error(`Todo with ID ${id} not found`);
    }
  }

  async getById(id: string): Promise<Todo | undefined> {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return undefined;
    }

    const document = await TodoModel.findById(id).lean().exec();
    return document ? this.toDomain(document) : undefined;
  }

  async getActive(): Promise<Todo[]> {
    const documents = await TodoModel.find({ completed: false })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return documents.map(this.toDomain);
  }

  async getCompleted(): Promise<Todo[]> {
    const documents = await TodoModel.find({ completed: true })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return documents.map(this.toDomain);
  }

  async count(): Promise<number> {
    return await TodoModel.countDocuments().exec();
  }

  async countActive(): Promise<number> {
    return await TodoModel.countDocuments({ completed: false }).exec();
  }

  async countCompleted(): Promise<number> {
    return await TodoModel.countDocuments({ completed: true }).exec();
  }

  async findBySpecification(
    specification: Specification<Todo>
  ): Promise<Todo[]> {
    // For MongoDB, we'll fetch all and filter in memory
    // In a real implementation, you'd translate specifications to MongoDB queries
    const allTodos = await this.getAll();
    return allTodos
      .filter((todo) => specification.isSatisfiedBy(todo))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Converts Mongoose document to domain object
   */
  private toDomain(document: any): Todo {
    return new Todo(
      document.title,
      document.completed,
      document.createdAt,
      document._id.toString(),
      document.priority,
      document.dueDate
    );
  }
}
