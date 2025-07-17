import { DomainEvent } from '../entities/Entity';
import { TodoId } from '../value-objects/TodoId';
import { TodoTitle } from '../value-objects/TodoTitle';

export class TodoCreatedEvent extends DomainEvent {
  constructor(
    public readonly todoId: TodoId,
    public readonly title: TodoTitle
  ) {
    super();
  }
}

export class TodoCompletedEvent extends DomainEvent {
  constructor(
    public readonly todoId: TodoId,
    public readonly completedAt: Date
  ) {
    super();
  }
}

export class TodoUncompletedEvent extends DomainEvent {
  constructor(
    public readonly todoId: TodoId,
    public readonly uncompletedAt: Date
  ) {
    super();
  }
}

export class TodoUpdatedEvent extends DomainEvent {
  constructor(
    public readonly todoId: TodoId,
    public readonly newTitle: TodoTitle,
    public readonly updatedAt: Date
  ) {
    super();
  }
}

export class TodoDeletedEvent extends DomainEvent {
  constructor(public readonly todoId: TodoId, public readonly deletedAt: Date) {
    super();
  }
}
