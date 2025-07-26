import { Todo } from '../entities/Todo';
import { Specification } from './Specification';

/**
 * Todo-specific specifications
 */
export class CompletedTodoSpecification extends Specification<Todo> {
  isSatisfiedBy(todo: Todo): boolean {
    return todo.completed;
  }
}

export class ActiveTodoSpecification extends Specification<Todo> {
  isSatisfiedBy(todo: Todo): boolean {
    return !todo.completed;
  }
}

export class OverdueTodoSpecification extends Specification<Todo> {
  constructor(private currentDate: Date = new Date()) {
    super();
  }

  isSatisfiedBy(todo: Todo): boolean {
    if (todo.completed) return false;

    const daysSinceCreation = Math.floor(
      (this.currentDate.getTime() - todo.createdAt.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return daysSinceCreation > 7;
  }
}

export class HighPriorityTodoSpecification extends Specification<Todo> {
  isSatisfiedBy(todo: Todo): boolean {
    return todo.priority.level === 'high';
  }
}
