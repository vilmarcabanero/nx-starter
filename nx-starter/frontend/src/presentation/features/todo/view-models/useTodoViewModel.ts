import { useEffect, useRef } from 'react';
import { useTodoStore } from '../../../../infrastructure/state/TodoStore';

/**
 * Main Todo View Model for application-level concerns
 * Handles data initialization on page load
 * Error management is now handled by ErrorBannerViewModel
 * Filter management is handled by TodoStatsViewModel
 * Specific CRUD operations are handled by specialized view models
 */
export const useTodoViewModel = () => {
  const store = useTodoStore();
  const hasLoadedInitially = useRef(false);

  // Load todos on mount
  useEffect(() => {
    if (!hasLoadedInitially.current) {
      hasLoadedInitially.current = true;
      store.loadTodos();
    }
  }, [store]);

  // This view model now only handles initialization
  // All other concerns are handled by specialized view models
  return {};
};
