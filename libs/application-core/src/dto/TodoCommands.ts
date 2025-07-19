// Command DTOs for CQRS pattern
// TypeScript types are now generated from Zod schemas for consistency

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
  return {
    CreateTodoCommandSchema: require('../validation/TodoValidationSchemas').CreateTodoCommandSchema,
    UpdateTodoCommandSchema: require('../validation/TodoValidationSchemas').UpdateTodoCommandSchema,
    DeleteTodoCommandSchema: require('../validation/TodoValidationSchemas').DeleteTodoCommandSchema,
    ToggleTodoCommandSchema: require('../validation/TodoValidationSchemas').ToggleTodoCommandSchema,
  };
};
