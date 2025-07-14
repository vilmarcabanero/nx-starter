import { z } from 'zod';
import type { TodoPriorityLevel } from '@/core/domain/todo/value-objects/TodoPriority';

// Command DTOs for CQRS pattern
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

// Validation schemas for commands
export const CreateTodoCommandSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(255, 'Title cannot exceed 255 characters'),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined)
});

export const UpdateTodoCommandSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  title: z.string().min(2, 'Title must be at least 2 characters').max(255, 'Title cannot exceed 255 characters').optional(),
  completed: z.boolean().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined)
});

export const DeleteTodoCommandSchema = z.object({
  id: z.string().min(1, 'ID is required')
});

export const ToggleTodoCommandSchema = z.object({
  id: z.string().min(1, 'ID is required')
});