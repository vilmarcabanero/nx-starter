import { useCallback } from 'react';
import { useTodoStore } from '../../../infrastructure/state/TodoStore';
import type { ErrorBannerViewModel } from '../../interfaces/TodoViewModels';

/**
 * View Model for Error Banner component
 * Handles error display and management
 */
export const useErrorBannerViewModel = (): ErrorBannerViewModel => {
  const store = useTodoStore();

  const dismiss = useCallback(() => {
    store.clearError();
  }, [store]);

  const retry = useCallback(() => {
    store.loadTodos();
  }, [store]);

  return {
    hasError: !!store.error,
    error: store.error,
    dismiss,
    retry,
  };
};
