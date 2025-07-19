// Command DTOs for CQRS pattern
// TypeScript types are now generated from Zod schemas for consistency

import {
  CreateTodoCommandSchema,
  UpdateTodoCommandSchema,
  DeleteTodoCommandSchema,
  ToggleTodoCommandSchema,
} from '../validation/TodoValidationSchemas';

// Re-export command types from validation schemas
export type {
  CreateTodoCommand,
  UpdateTodoCommand,
  DeleteTodoCommand,
  ToggleTodoCommand,
} from '../validation/TodoValidationSchemas';

// Re-export validation schemas for backward compatibility
export {
  CreateTodoCommandSchema,
  UpdateTodoCommandSchema,
  DeleteTodoCommandSchema,
  ToggleTodoCommandSchema,
  TodoValidationSchemas,
} from '../validation/TodoValidationSchemas';

// Legacy function for backward compatibility - now returns required schemas
export const createCommandValidationSchema = () => {
  try {
    // Use proper ES6 imports since the module exists
    return {
      CreateTodoCommandSchema,
      UpdateTodoCommandSchema,
      DeleteTodoCommandSchema,
      ToggleTodoCommandSchema,
    };
  } catch {
    // Fallback in case of import issues
    return {};
  }
};
