import { TodoTitle } from '../value-objects/TodoTitle';
import {
  TodoPriority,
  type TodoPriorityLevel,
} from '../value-objects/TodoPriority';
import { TodoId } from '../value-objects/TodoId';
import { TodoAlreadyCompletedException } from '../exceptions/DomainExceptions';

interface ITodo {
  id?: TodoId;
  title: TodoTitle;
  completed: boolean;
  createdAt: Date;
  priority: TodoPriority;
  dueDate?: Date;
}

export class Todo implements ITodo {
  private readonly _title: TodoTitle;
  private readonly _priority: TodoPriority;
  private readonly _id?: TodoId;
  private readonly _completed: boolean;
  private readonly _createdAt: Date;
  private readonly _dueDate?: Date;

  constructor(
    title: string | TodoTitle,
    completed = false,
    createdAt = new Date(),
    id?: string | TodoId,
    priority: TodoPriorityLevel = 'medium',
    dueDate?: Date
  ) {
    this._title = title instanceof TodoTitle ? title : new TodoTitle(title);
    this._priority = new TodoPriority(priority);
    this._id = id instanceof TodoId ? id : id ? new TodoId(id) : undefined;
    this._completed = completed;
    this._createdAt = createdAt;
    this._dueDate = dueDate;
  }

  get id(): TodoId | undefined {
    return this._id;
  }

  get title(): TodoTitle {
    return this._title;
  }

  get priority(): TodoPriority {
    return this._priority;
  }

  get completed(): boolean {
    return this._completed;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get dueDate(): Date | undefined {
    return this._dueDate;
  }

  // For backwards compatibility with existing code that expects string ID
  get stringId(): string | undefined {
    return this._id?.value;
  }

  // Deprecated: Use stringId instead
  get numericId(): string | undefined {
    return this._id?.value;
  }

  get titleValue(): string {
    return this._title.value;
  }

  // Domain business logic methods
  toggle(): Todo {
    return this.createCopy({ completed: !this._completed });
  }

  updateTitle(newTitle: string | TodoTitle): Todo {
    const title =
      newTitle instanceof TodoTitle ? newTitle : new TodoTitle(newTitle);
    return this.createCopy({ title });
  }

  updatePriority(priority: TodoPriorityLevel): Todo {
    const newPriority = new TodoPriority(priority);
    return this.createCopy({ priority: newPriority });
  }

  updateDueDate(dueDate?: Date): Todo {
    return this.createCopy({ dueDate });
  }

  /**
   * Creates a copy of this todo with modified properties
   * Immutable entity pattern - all changes create new instances
   */
  private createCopy(updates: {
    title?: TodoTitle;
    completed?: boolean;
    priority?: TodoPriority;
    dueDate?: Date;
  }): Todo {
    return new Todo(
      updates.title || this._title,
      updates.completed !== undefined ? updates.completed : this._completed,
      this._createdAt,
      this._id,
      updates.priority?.level || this._priority.level,
      updates.dueDate !== undefined ? updates.dueDate : this._dueDate
    );
  }

  isOverdue(): boolean {
    if (this._completed) return false;

    if (this._dueDate) {
      return new Date() > this._dueDate;
    }

    // Fallback: consider todos overdue after 7 days if no due date
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return this._createdAt < sevenDaysAgo;
  }

  /**
   * Validates business rules before completing
   */
  canBeCompleted(): boolean {
    return !this._completed;
  }

  /**
   * Creates a completed version of this todo
   */
  complete(): Todo {
    if (!this.canBeCompleted()) {
      throw new TodoAlreadyCompletedException();
    }
    return this.createCopy({ completed: true });
  }

  /**
   * Domain equality comparison based on business identity
   */
  equals(other: Todo): boolean {
    if (!this._id || !other._id) {
      return false;
    }
    return this._id.equals(other._id);
  }

  /**
   * Validates business invariants
   */
  validate(): void {
    if (!this._title || this._title.value.trim().length === 0) {
      throw new Error('Todo must have a valid title');
    }

    if (this._dueDate && this._dueDate < this._createdAt) {
      throw new Error('Due date cannot be before creation date');
    }
  }
}

export type { ITodo };
export type { TodoPriorityLevel };
