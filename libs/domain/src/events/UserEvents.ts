import { DomainEvent } from '../entities/Entity';

export class UserRegisteredEvent extends DomainEvent {
  public readonly userId: string;
  public readonly email: string;
  public readonly username: string;

  constructor(userId: string, email: string, username: string) {
    super();
    this.userId = userId;
    this.email = email;
    this.username = username;
  }
}