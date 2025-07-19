import { z } from 'zod';
import type { TodoPriorityLevel } from '@nx-starter/domain-core';

/**
 * Zod schemas for Todo command validation
 * These schemas define the validation rules and generate TypeScript types
 */

// Base Todo validation schemas
export const TodoPrioritySchema = z.enum(['low', 'medium', 'high']);

export const CreateTodoCommandSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(255, 'Title cannot exceed 255 characters'),
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
    .min(2, 'Title must be at least 2 characters')
    .max(255, 'Title cannot exceed 255 characters')
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