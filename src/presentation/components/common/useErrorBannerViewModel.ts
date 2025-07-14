import { useCallback } from 'react';
import { useTodoStore } from '@/core/infrastructure/todo/state/TodoStore';
import type { ErrorBannerViewModel } from '@/presentation/features/todo/view-models/interfaces/TodoViewModels';

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
