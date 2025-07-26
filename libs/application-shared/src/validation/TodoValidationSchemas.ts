import { z } from 'zod';
import type { TodoPriorityLevel } from '@nx-starter/domain';

/**
 * Zod schemas for Todo command validation
 * These schemas define the validation rules and generate TypeScript types
 */

// Base Todo validation schemas
export const TodoPrioritySchema = z.enum(['low', 'medium', 'high']);

// Enhanced title validation with specific error messages
const validateTitle = (title: string, ctx: z.RefinementCtx) => {
  // Check if title is provided (not undefined/null)
  if (title === undefined || title === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Title is required',
    });
    return;
  }

  // Check if title is empty string
  if (title === '') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Title is required',
    });
    return;
  }

  // Check if title becomes empty after trimming (whitespace only)
  if (title.trim() === '') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Title cannot be empty',
    });
    return;
  }

  // Check minimum length (after trimming)
  if (title.trim().length < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_small,
      message: 'Title must be at least 2 characters',
      minimum: 2,
      origin: 'string',
      inclusive: true,
      input: title,
    });
    return;
  }

  // Check maximum length
  if (title.length > 255) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Title cannot exceed 255 characters',
    });
    return;
  }
};

export const CreateTodoCommandSchema = z.object({
  title: z
    .string()
    .superRefine(validateTitle),
  priority: TodoPrioritySchema.optional(),
  dueDate: z
    .string()
    .datetime()
    .optional()
    .transform((val) => val ? new Date(val) : undefined),
}).transform((data) => ({
  ...data,
  priority: data.priority || 'medium' as const,
}));

export const UpdateTodoCommandSchema = z.object({
  id: z.string().min(1, 'ID cannot be empty'),
  title: z
    .string()
    .superRefine(validateTitle)
    .optional(),
  completed: z.boolean().optional(),
  priority: TodoPrioritySchema.optional(),
  dueDate: z
    .string()
    .datetime()
    .optional()
    .transform((val) => val ? new Date(val) : undefined),
});

export const DeleteTodoCommandSchema = z.object({
  id: z.string().min(1, 'ID cannot be empty'),
});

export const ToggleTodoCommandSchema = z.object({
  id: z.string().min(1, 'ID cannot be empty'),
});

// Simple ID validation schema for route parameters
export const TodoIdSchema = z.string().min(1, 'ID cannot be empty');

// Inferred TypeScript types from Zod schemas
export type CreateTodoCommand = z.infer<typeof CreateTodoCommandSchema>;
export type UpdateTodoCommand = z.infer<typeof UpdateTodoCommandSchema>;
export type DeleteTodoCommand = z.infer<typeof DeleteTodoCommandSchema>;
export type ToggleTodoCommand = z.infer<typeof ToggleTodoCommandSchema>;

// Export all schemas as a collection for easier importing
export const TodoValidationSchemas = {
  CreateTodoCommandSchema,
  UpdateTodoCommandSchema,
  DeleteTodoCommandSchema,
  ToggleTodoCommandSchema,
  TodoIdSchema,
} as const;