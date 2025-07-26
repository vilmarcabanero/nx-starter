import { useState, useCallback } from 'react';
import { useTodoStore } from '../../../../infrastructure/state/TodoStore';
import type { TodoFormViewModel } from './interfaces/TodoViewModels';

/**
 * View Model for Todo Form component
 * Handles form-specific presentation logic and business operations
 */
export const useTodoFormViewModel = (): TodoFormViewModel => {
  const store = useTodoStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitTodo = useCallback(
    async (title: string) => {
      setIsSubmitting(true);
      try {
        await store.createTodo({ title: title.trim() });
      } catch (error) {
        console.error('Failed to create todo:', error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [store]
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
    isGlobalLoading: store.getIsLoading(),
    submitTodo,
    handleFormSubmit,
  };
};
