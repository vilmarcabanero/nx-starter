import type { ZodError, ZodIssue } from 'zod';

/**
 * Utility for mapping Zod validation errors to user-friendly messages
 * Provides consistent error handling across all forms
 */

export interface FormError {
  field: string;
  message: string;
}

/**
 * Maps Zod validation errors to user-friendly form errors
 * @param zodError - The Zod validation error
 * @returns Array of form errors with field names and messages
 */
export const mapZodErrorToFormErrors = (zodError: ZodError): FormError[] => {
  return zodError.issues.map((issue: ZodIssue) => ({
    field: issue.path.join('.'),
    message: getUserFriendlyMessage(issue),
  }));
};

/**
 * Converts a Zod issue to a user-friendly error message
 * @param issue - The Zod validation issue
 * @returns User-friendly error message
 */
const getUserFriendlyMessage = (issue: ZodIssue): string => {
  const fieldName = getFieldDisplayName(issue.path[0] as string);
  
  switch (issue.code) {
    case 'too_small':
      if (issue.minimum === 1) {
        return `${fieldName} is required`;
      }
      return `${fieldName} must be at least ${issue.minimum} characters`;
      
    case 'too_big':
      return `${fieldName} cannot exceed ${issue.maximum} characters`;
      
    case 'invalid_type':
      return `${fieldName} is required`;
      
    default:
      return issue.message;
  }
};

/**
 * Maps technical field names to user-friendly display names
 * @param fieldName - The technical field name
 * @returns User-friendly field display name
 */
const getFieldDisplayName = (fieldName: string): string => {
  const fieldDisplayNames: Record<string, string> = {
    title: 'Title',
    priority: 'Priority',
    dueDate: 'Due Date',
    completed: 'Completed Status',
    id: 'ID',
  };
  
  return fieldDisplayNames[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
};

/**
 * Extracts the first error message for a specific field
 * Useful for displaying single error messages in form inputs
 * @param zodError - The Zod validation error
 * @param fieldName - The field to get the error for
 * @returns The error message or null if no error exists for the field
 */
export const getFieldError = (zodError: ZodError | null, fieldName: string): string | null => {
  if (!zodError) return null;
  
  const fieldError = zodError.issues.find((issue) =>
    issue.path.join('.') === fieldName
  );
  
  return fieldError ? getUserFriendlyMessage(fieldError) : null;
};

/**
 * Checks if a specific field has validation errors
 * @param zodError - The Zod validation error
 * @param fieldName - The field to check
 * @returns True if the field has errors
 */
export const hasFieldError = (zodError: ZodError | null, fieldName: string): boolean => {
  return getFieldError(zodError, fieldName) !== null;
};