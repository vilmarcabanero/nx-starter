// Command DTOs for CQRS pattern
// Unified version combining frontend and backend with optional validation

import type { TodoPriorityLevel } from '@nx-starter/domain-core';

// Command interfaces
export interface CreateTodoCommand {
  title: string;
  priority?: TodoPriorityLevel;
  dueDate?: Date;
}

export interface UpdateTodoCommand {
  id: string;
  title?: string;
  completed?: boolean;
  priority?: TodoPriorityLevel;
  dueDate?: Date;
}

export interface DeleteTodoCommand {
  id: string;
}

export interface ToggleTodoCommand {
  id: string;
}

// Optional validation schemas (can be used when zod is available)
// These are kept as optional to support both frontend and backend usage
export const createCommandValidationSchema = () => {
  try {
    // Dynamic import to avoid bundling zod when not needed
    const { z } = require('zod');

    return {
      CreateTodoCommandSchema: z.object({
        title: z
          .string()
          .min(2, 'Title must be at least 2 characters')
          .max(255, 'Title cannot exceed 255 characters'),
        priority: z.enum(['low', 'medium', 'high']).optional(),
        dueDate: z
          .string()
          .datetime()
          .optional()
          .transform((val: string | undefined) =>
            val ? new Date(val) : undefined
          ),
      }),

      UpdateTodoCommandSchema: z.object({
        id: z.string().min(1, 'ID is required'),
        title: z
          .string()
          .min(2, 'Title must be at least 2 characters')
          .max(255, 'Title cannot exceed 255 characters')
          .optional(),
        completed: z.boolean().optional(),
        priority: z.enum(['low', 'medium', 'high']).optional(),
        dueDate: z
          .string()
          .datetime()
          .optional()
          .transform((val: string | undefined) =>
            val ? new Date(val) : undefined
          ),
      }),

      DeleteTodoCommandSchema: z.object({
        id: z.string().min(1, 'ID is required'),
      }),

      ToggleTodoCommandSchema: z.object({
        id: z.string().min(1, 'ID is required'),
      }),
    };
  } catch {
    // Return empty object if zod is not available
    return {};
  }
};
