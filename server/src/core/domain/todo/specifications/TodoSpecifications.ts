import { Todo } from '@/core/domain/todo/entities/Todo';

/**
 * Base specification interface for domain rules
 */
export interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
  and(specification: Specification<T>): Specification<T>;
  or(specification: Specification<T>): Specification<T>;
  not(): Specification<T>;
}

/**
 * Abstract base class for specifications
 */
export abstract class BaseSpecification<T> implements Specification<T> {
  abstract isSatisfiedBy(candidate: T): boolean;

  and(specification: Specification<T>): Specification<T> {
    return new AndSpecification(this, specification);
  }

  or(specification: Specification<T>): Specification<T> {
    return new OrSpecification(this, specification);
  }

  not(): Specification<T> {
    return new NotSpecification(this);
  }
}

/**
 * Composite specifications
 */
class AndSpecification<T> extends BaseSpecification<T> {
  constructor(
    private left: Specification<T>,
    private right: Specification<T>
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate);
  }
}

class OrSpecification<T> extends BaseSpecification<T> {
  constructor(
    private left: Specification<T>,
    private right: Specification<T>
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate);
  }
}

class NotSpecification<T> extends BaseSpecification<T> {
  constructor(private specification: Specification<T>) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return !this.specification.isSatisfiedBy(candidate);
  }
}

/**
 * Todo-specific specifications
 */
export class CompletedTodoSpecification extends BaseSpecification<Todo> {
  isSatisfiedBy(todo: Todo): boolean {
    return todo.completed;
  }
}

export class ActiveTodoSpecification extends BaseSpecification<Todo> {
  isSatisfiedBy(todo: Todo): boolean {
    return !todo.completed;
  }
}

export class OverdueTodoSpecification extends BaseSpecification<Todo> {
  constructor(private currentDate: Date = new Date()) {
    super();
  }

  isSatisfiedBy(todo: Todo): boolean {
    if (todo.completed) return false;

    const daysSinceCreation = Math.floor(
      (this.currentDate.getTime() - todo.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceCreation > 7;
  }
}

export class HighPriorityTodoSpecification extends BaseSpecification<Todo> {
  isSatisfiedBy(todo: Todo): boolean {
    return todo.priority.level === 'high';
  }
}
