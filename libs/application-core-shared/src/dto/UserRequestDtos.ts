/**
 * User Request DTOs
 * Data Transfer Objects for user-related API requests
 */

export interface RegisterUserRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}