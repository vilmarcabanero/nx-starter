/**
 * User Command DTOs
 * Commands for user-related operations following CQRS pattern
 */

export interface RegisterUserCommand {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}