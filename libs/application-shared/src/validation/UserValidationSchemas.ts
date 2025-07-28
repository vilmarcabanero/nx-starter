import { z } from 'zod';

/**
 * User validation schemas
 * Contains all validation rules and error messages as specified in requirements
 */

// Custom error messages as per requirements
export const USER_VALIDATION_ERRORS = {
  REG_MISSING_FIRSTNAME: 'First name is required',
  REG_MISSING_LASTNAME: 'Last name is required', 
  REG_MISSING_EMAIL: 'Email address is required',
  REG_MISSING_PASSWORD: 'Password is required',
  REG_INVALID_EMAIL: 'Please provide a valid email address',
  REG_WEAK_PASSWORD: 'Password must be at least 8 characters long with at least one uppercase letter, one lowercase letter, and one number',
  REG_EMAIL_EXISTS: 'This email address is already registered',
  REG_INVALID_NAME: 'Names can only contain letters, spaces, and hyphens',
  AUTH_MISSING_IDENTIFIER: 'Email or username is required',
  AUTH_MISSING_PASSWORD: 'Password is required',
  AUTH_INVALID_EMAIL: 'Please provide a valid email address'
} as const;

// Name validation schema (for firstName and lastName)
export const NameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(50, 'Name cannot exceed 50 characters')
  .regex(/^[a-zA-ZñÑ\s-]+$/, USER_VALIDATION_ERRORS.REG_INVALID_NAME);

// First name validation
export const FirstNameSchema = z
  .string()
  .min(1, USER_VALIDATION_ERRORS.REG_MISSING_FIRSTNAME)
  .max(50, 'Name cannot exceed 50 characters')
  .regex(/^[a-zA-ZñÑ\s-]+$/, USER_VALIDATION_ERRORS.REG_INVALID_NAME);

// Last name validation  
export const LastNameSchema = z
  .string()
  .min(1, USER_VALIDATION_ERRORS.REG_MISSING_LASTNAME)
  .max(50, 'Name cannot exceed 50 characters')
  .regex(/^[a-zA-ZñÑ\s-]+$/, USER_VALIDATION_ERRORS.REG_INVALID_NAME);

// Email validation schema
export const EmailSchema = z
  .string()
  .min(1, USER_VALIDATION_ERRORS.REG_MISSING_EMAIL)
  .email(USER_VALIDATION_ERRORS.REG_INVALID_EMAIL)
  .max(254, 'Email address is too long');

// Password validation schema  
export const PasswordSchema = z
  .string()
  .min(1, USER_VALIDATION_ERRORS.REG_MISSING_PASSWORD)
  .min(8, USER_VALIDATION_ERRORS.REG_WEAK_PASSWORD)
  .regex(/[A-Z]/, USER_VALIDATION_ERRORS.REG_WEAK_PASSWORD)
  .regex(/[a-z]/, USER_VALIDATION_ERRORS.REG_WEAK_PASSWORD)
  .regex(/[0-9]/, USER_VALIDATION_ERRORS.REG_WEAK_PASSWORD);

// Register user command validation schema
export const RegisterUserCommandSchema = z.object({
  firstName: FirstNameSchema,
  lastName: LastNameSchema,
  email: EmailSchema,
  password: PasswordSchema,
});

// Login user command validation schema (matches DTO interface)
export const LoginUserCommandSchema = z.object({
  identifier: z
    .string()
    .min(1, USER_VALIDATION_ERRORS.AUTH_MISSING_IDENTIFIER)
    .refine((value) => {
      // If it looks like an email (contains @), validate email format
      if (value.includes('@')) {
        return z.string().email().safeParse(value).success;
      }
      // Otherwise, it's a username - just check it's not empty (already checked by min(1))
      return true;
    }, {
      message: USER_VALIDATION_ERRORS.AUTH_INVALID_EMAIL,
    }),
  password: z
    .string()
    .min(1, USER_VALIDATION_ERRORS.AUTH_MISSING_PASSWORD),
});

// Frontend form schema extends the command schema with UI-specific fields
export const LoginFormSchema = LoginUserCommandSchema.extend({
  rememberMe: z.boolean().optional(),
});

// Export all schemas for easy access
export const UserValidationSchemas = {
  RegisterUserCommand: RegisterUserCommandSchema,
  LoginUserCommand: LoginUserCommandSchema,
  LoginForm: LoginFormSchema,
  FirstName: FirstNameSchema,
  LastName: LastNameSchema,
  Email: EmailSchema,
  Password: PasswordSchema,
  Name: NameSchema,
} as const;