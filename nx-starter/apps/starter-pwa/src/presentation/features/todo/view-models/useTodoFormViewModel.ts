import { useState, useCallback } from 'react';
import { useTodoStore } from '../../../../infrastructure/state/TodoStore';
import type { TodoFormViewModel } from './interfaces/TodoViewModels';

/**
 * View Model for Todo Form component
 * Handles form-specific presentation logic and validation
 */
export const useTodoFormViewModel = (): TodoFormViewModel => {
  const store = useTodoStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [shouldShowValidationErrors, setShouldShowValidationErrors] = useState(false);

  const validateTitleLogic = useCallback((title: string): Record<string, string> => {
    const errors: Record<string, string> = {};
    const trimmedTitle = title?.trim();

    if (!title) {
      errors.title = 'Title is required';
    } else if (!trimmedTitle) {
      errors.title = 'Title cannot be empty';
    } else if (trimmedTitle.length < 2) {
      errors.title = 'Title must be at least 2 characters long';
    } else if (trimmedTitle.length > 255) {
      errors.title = 'Title cannot exceed 255 characters';
    }

    return errors;
  }, []);

  const validateTitle = useCallback((title: string): boolean => {
    const errors = validateTitleLogic(title);

    // Only set validation errors if we should show them
    if (shouldShowValidationErrors) {
      setValidationErrors(errors);
    }
    
    return Object.keys(errors).length === 0;
  }, [shouldShowValidationErrors, validateTitleLogic]);

  const validateTitleAndSetErrors = useCallback((title: string): boolean => {
    const errors = validateTitleLogic(title);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [validateTitleLogic]);

  const submitTodo = useCallback(
    async (title: string) => {
      // Enable showing validation errors before validation
      setShouldShowValidationErrors(true);
      
      // Always validate and set errors during submission
      if (!validateTitleAndSetErrors(title)) {
        throw new Error('Validation failed');
      }

      setIsSubmitting(true);
      try {
        await store.createTodo({ title: title.trim() });
        setValidationErrors({});
        // Reset the flag on successful submission
        setShouldShowValidationErrors(false);
      } catch (error) {
        console.error('Failed to create todo:', error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [store, validateTitleAndSetErrors]
  );

  const handleFormSubmit = useCallback(
    async (title: string): Promise<boolean> => {
      if (!title.trim()) return false;

      try {
        await submitTodo(title);
        return true;
      } catch (error) {
        console.error('Failed to create todo:', error);
        return false;
      }
    },
    [submitTodo]
  );

  return {
    isSubmitting,
    validationErrors,
    shouldShowValidationErrors,
    isGlobalLoading: store.getIsLoading(),
    submitTodo,
    validateTitle,
    handleFormSubmit,
  };
};
