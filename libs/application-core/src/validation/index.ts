// Validation schemas and types
export * from './TodoValidationSchemas';

// Base validation service and utilities
export * from './ValidationService';

// Concrete validation service implementations
export * from './TodoValidationService';

// Note: Custom decorators for routing-controllers were removed in favor of manual validation

// Note: ValidationMiddleware is excluded from frontend builds to avoid backend dependencies

// Re-export commonly used validation schemas for convenience
export {
  CreateTodoCommandSchema,
  UpdateTodoCommandSchema,
  DeleteTodoCommandSchema,
  ToggleTodoCommandSchema,
  TodoIdSchema,
  TodoValidationSchemas,
} from './TodoValidationSchemas';

// Re-export validation service tokens
export { VALIDATION_TOKENS } from './TodoValidationService';