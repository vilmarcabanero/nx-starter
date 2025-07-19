import { useState, useCallback } from 'react';
import { useTodoStore } from '@/core/infrastructure/todo/state/TodoStore';
import type { TodoFormViewModel } from './interfaces/TodoViewModels';

/**
 * View Model for Todo Form component
 * Handles form-specific presentation logic and validation
 */
export const useTodoFormViewModel = (): TodoFormViewModel => {
  const store = useTodoStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateTitle = useCallback((title: string): boolean => {
    const errors: Record<string, string> = {};

    if (!title) {
      errors.title = 'Title is required';
    } else if (title && !title.trim()) {
      errors.title = 'Title cannot be empty';
    } else if (title.trim().length < 2) {
      errors.title = 'Title must be at least 2 characters long';
    } else if (title.trim().length > 255) {
      errors.title = 'Title cannot exceed 255 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  const submitTodo = useCallback(async (title: string) => {
    if (!validateTitle(title)) {
      throw new Error('Validation failed');
    }

    setIsSubmitting(true);
    try {
      await store.createTodo({ title: title.trim() });
      setValidationErrors({});
    } catch (error) {
      console.error('Failed to create todo:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [store, validateTitle]);

  const handleFormSubmit = useCallback(async (title: string): Promise<boolean> => {
    if (!title.trim()) return false;
    
    try {
      await submitTodo(title);
      return true;
    } catch (error) {
      console.error('Failed to create todo:', error);
      return false;
    }
  }, [submitTodo]);

  return {
    isSubmitting,
    validationErrors,
    isGlobalLoading: store.getIsLoading(),
    submitTodo,
    validateTitle,
    handleFormSubmit,
  };
};
