import type { CreateTodoCommand, UpdateTodoCommand } from '@nx-starter/application-shared';

/**
 * Form-specific types derived from Zod schemas
 * These types ensure perfect alignment between form data and validation schemas
 */

// Form data for creating new todos
export type TodoFormData = Pick<CreateTodoCommand, 'title'>;

// Form data for updating existing todos (for inline editing)
export type TodoUpdateFormData = Pick<UpdateTodoCommand, 'title'>;

// Full create form data (if we expand to include priority, dueDate etc)
export type ExtendedTodoFormData = Omit<CreateTodoCommand, 'priority'> & {
  priority?: CreateTodoCommand['priority'];
};

// Form input types that match HTML input expectations
export type TodoFormInputs = {
  title: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string; // HTML datetime-local input format
};

/**
 * Type guards and utilities for form validation
 */
export const isValidTodoFormData = (data: unknown): data is TodoFormData => {
  return typeof data === 'object' && 
         data !== null && 
         'title' in data && 
         typeof (data as { title: unknown }).title === 'string';
};