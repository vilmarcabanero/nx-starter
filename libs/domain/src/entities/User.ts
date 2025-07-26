import { AggregateRoot } from './Entity';
import { Email } from '../value-objects/Email';
import { Username } from '../value-objects/Username';
import { HashedPassword } from '../value-objects/HashedPassword';
import { Name } from '../value-objects/Name';
import { UserRegisteredEvent } from '../events/UserEvents';

export interface UserProps {
  firstName: Name;
  lastName: Name;
  email: Email;
  username: Username;
  hashedPassword: HashedPassword;
  createdAt: Date;
}

export class User extends AggregateRoot<string> {
  private readonly _firstName: Name;
  private readonly _lastName: Name;
  private readonly _email: Email;
  private readonly _username: Username;
  private readonly _hashedPassword: HashedPassword;
  private readonly _createdAt: Date;

  constructor(id: string, props: UserProps) {
    super(id);
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._email = props.email;
    this._username = props.username;
    this._hashedPassword = props.hashedPassword;
    this._createdAt = props.createdAt;

    // Add domain event when user is created
    this.addDomainEvent(new UserRegisteredEvent(id, props.email.value, props.username.value));
  }

  get firstName(): Name {
    return this._firstName;
  }

  get lastName(): Name {
    return this._lastName;
  }

  get email(): Email {
    return this._email;
  }

  get username(): Username {
    return this._username;
  }

  get hashedPassword(): HashedPassword {
    return this._hashedPassword;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get fullName(): string {
    return `${this._firstName.value} ${this._lastName.value}`;
  }

  public static create(
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    username: string,
    hashedPassword: string
  ): User {
    return new User(id, {
      firstName: Name.create(firstName),
      lastName: Name.create(lastName),
      email: Email.create(email),
      username: Username.create(username),
      hashedPassword: HashedPassword.create(hashedPassword),
      createdAt: new Date(),
    });
  }

  public toPlainObject() {
    return {
      id: this.id,
      firstName: this._firstName.value,
      lastName: this._lastName.value,
      email: this._email.value,
      username: this._username.value,
      hashedPassword: this._hashedPassword.value,
      createdAt: this._createdAt,
    };
  }
}